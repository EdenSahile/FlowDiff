# Smoke tests manuels : LOT-03 (Auth : logout, routes protegees et isolation)

> **Ces scenarios s'executent APRES l'implementation**, pas avant. Le fichier est ecrit en test-first pour fixer les criteres d'acceptation.

---

## Logout

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-016 | :green_circle: | Logout supprime token + wishlist username, conserve panier et historique | Aucun smoke, couvert en unitaire |

---

## Routes protegees

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-017 | :green_circle: | ProtectedRoute redirige vers /login, passe state.from, rend Outlet si connecte, rend null si loading | Aucun smoke, couvert en unitaire |

---

## Redirection post-login securisee (anti open-redirect)

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-018 | :green_circle: | getSafeRedirectPath accepte/rejette les cibles de redirection | Aucun smoke, couvert en unitaire |

---

## Isolation des donnees par codeClient

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-020 | :green_circle: | Cles localStorage suffixees par codeClient + fallback guest | Aucun smoke, couvert en unitaire |
| FLOW-RM-020 | :orange_circle: | Rechargement des donnees au changement d'utilisateur : le panier de LIB001 ne fuit pas vers LIB002 | Scenario ci-dessous |
| FLOW-RM-020 | :green_circle: | Fallback guest quand aucun user connecte | Aucun smoke, couvert en unitaire |

---

### FLOW-RM-020 : Isolation du panier entre 2 comptes librairie

> :white_check_mark: **Ce qu'on verifie :**
> - Quand un libraire se connecte, il voit son propre panier, pas celui d'un autre compte
> - Le cycle complet login / ajout panier / logout / login autre compte traverse plusieurs contexts React (AuthContext, CartContext) et leur cycle de vie reel, ce que les tests unitaires ne couvrent pas

**Preconditions**

- L'application tourne en local (`npm run dev`)
- Aucun utilisateur n'est connecte (page `/login` affichee)
- Le localStorage du navigateur est vide pour les cles `bookflow_*` (ouvrir DevTools > Application > Local Storage et supprimer les entrees qui commencent par `bookflow_`)

**Point d'attention** : la page de login est actuellement verrouillee sur le compte LIB001 (champs pre-remplis et desactives). Pour se connecter en LIB002, il faut passer par les DevTools du navigateur (voir etape 5). Si un mecanisme de selection de compte est ajoute ulterieurement, adapter les etapes 5-6 en consequence.

**Comptes utilises**

| Compte | Code client | Email | Mot de passe |
|---|---|---|---|
| Librairie Lira | LIB001 | marie.lecomte@librairie-lira.fr | Libraire123! |
| Les Mots Voyageurs | LIB002 | thomas.beaumont@motsvoyageurs.fr | Libraire123! |

**Etapes**

1. Sur la page `/login`, cliquer sur **Se connecter** (les identifiants LIB001 sont pre-remplis). Verifier que l'accueil s'affiche et que le code client affiche dans la sidebar est `LIB001`.
2. Naviguer vers un livre commandable (section **Fonds** ou **Nouveautes**, cliquer sur un titre). Sur la fiche produit, cliquer sur **Ajouter au panier**. Verifier que le badge panier affiche `1`.
3. Cliquer sur **Se deconnecter** dans la sidebar (en bas). Confirmer dans la modale. Verifier que la page `/login` s'affiche.
4. Ouvrir DevTools > Application > Local Storage. Verifier que la cle `bookflow_cart_LIB001` existe et contient le livre ajoute (le panier LIB001 est conserve apres logout, conformement a FLOW-RM-016).
5. Dans la console DevTools, activer les champs de login et saisir les identifiants LIB002 :
   ```js
   document.querySelector('#identifier').disabled = false
   document.querySelector('#identifier').value = 'LIB002'
   document.querySelector('#identifier').dispatchEvent(new Event('input', { bubbles: true }))
   document.querySelector('#password').disabled = false
   ```
   Puis effacer manuellement le champ "Code client ou email", saisir `LIB002`, et cliquer sur **Se connecter**.
6. Verifier que l'accueil s'affiche et que le code client dans la sidebar est `LIB002`.
7. Naviguer vers `/panier`. Verifier que la page affiche **"Votre panier est vide"**. Le livre ajoute a l'etape 2 ne doit pas apparaitre.

**Resultat attendu**

- A l'etape 7, la page panier affiche le message "Votre panier est vide" (texte exact dans `CartPage.tsx` ligne 1256). Le badge panier en header n'affiche aucun chiffre (ou 0).
- La cle `bookflow_cart_LIB002` dans le localStorage est soit absente, soit contient un tableau `items` vide.
- La cle `bookflow_cart_LIB001` contient toujours le livre de l'etape 2 (pas de perte de donnees croisee).

- [ ] Scenario valide
