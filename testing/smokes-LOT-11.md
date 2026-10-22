# Smoke tests manuels - LOT-11 : EDI (echanges Dilicom)

> **Ces scenarios sont ecrits avant l'implementation (test-first).**
> **Ne les executer qu'une fois l'implementation terminee**, sur l'application lancee en local (`pnpm dev`).

---

## Regles EDI

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-084 | 🔴 | Commande EDI genere auto ORDRSP apres ~3s et DESADV apres ~8s | SMOKE-084 ci-dessous |
| FLOW-RM-085 | 🔴 | Donnees EDI isolees par codeClient | SMOKE-085 ci-dessous |
| FLOW-RM-086 | 🟢 | `groupDESADVByOrder` : statut EN_COURS vs SOLDE selon qte livree/commandee | aucun smoke, couvert en unitaire |
| FLOW-RM-087 | 🟢 | `filterEDIMessages` filtre par type ou ALL | aucun smoke, couvert en unitaire |
| FLOW-RM-088 | 🟢 | `getFluxCounts` : 4 compteurs (orders, expeditions, factures, errors) | aucun smoke, couvert en unitaire |
| FLOW-RM-089 | 🟢 | `messageContainsISBN` : recherche partielle, chaine vide, INVOIC inclus | aucun smoke, couvert en unitaire |
| FLOW-RM-090 | 🟢 | EDIFACT ORDERS : split titres longs en chunks de 35 chars dans IMD+L+050 | aucun smoke, couvert en unitaire |
| FLOW-RM-091 | 🟢 | EDIFACT ORDERS : IMD auteur avec inversion nom/prenom | aucun smoke, couvert en unitaire |

---

### SMOKE-084 : Commande EDI genere ORDRSP puis DESADV automatiquement

> ✅ **Ce qu'on verifie :**
> - Apres une commande passee en mode EDI, un message ORDRSP apparait dans la liste des echanges EDI au bout de ~3 secondes
> - Un message DESADV apparait au bout de ~8 secondes
> - La logique vit dans un `useEffect` de `EDIProvider` avec 2 `setTimeout` (lignes 87-160 de `EDIContext.tsx`), rien n'est exporte ni appelable en dehors du composant, donc seul un test manuel peut verifier le branchement complet

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Au moins 1 article dans le panier (par exemple, ajouter "Houris" de Kamel Daoud depuis le catalogue Fonds ou Nouveautes)
- Vider les messages EDI existants de localStorage pour partir d'un etat propre : ouvrir la console du navigateur et executer `localStorage.removeItem('bookflow_edi_LIB001'); localStorage.removeItem('bookflow_edi_version_LIB001')` puis recharger la page

**Etapes**

1. Aller sur `/panier` et lancer le tunnel de commande ("Valider mon panier")
2. Remplir l'etape Livraison (les champs sont pre-remplis par defaut), passer a l'etape suivante
3. A l'etape "Mode de transmission", selectionner **EDI** et cliquer "Envoyer la commande"
4. Apres confirmation, aller sur `/edi` et descendre jusqu'a la section "Historique des echanges". Noter l'heure exacte affichee et observer la liste pendant 10 secondes

**Resultat attendu**

- Un message de type **ORDERS** (statut SENT) apparait immediatement dans l'historique, avec le numero de commande correspondant (format `CMD-XXXXXXXX`)
- Au bout de ~3 secondes, un message de type **ORDRSP** (statut RECEIVED) apparait, avec la reference `ACK-XXXXXXXX` et le detail "Acceptee"
- Au bout de ~8 secondes, un message de type **DESADV** (statut RECEIVED) apparait, avec la reference `DESADV-XXXXXXXX`
- Les 3 messages pointent vers la meme commande (meme `orderId` dans le payload)

- [ ] Verifie

---

### SMOKE-085 : Donnees EDI isolees par codeClient

> ✅ **Ce qu'on verifie :**
> - Les messages EDI d'un codeClient ne sont pas visibles quand on se connecte avec un autre codeClient
> - L'isolation repose sur les cles localStorage suffixees par codeClient (`bookflow_edi_{codeClient}`), mais ces fonctions ne sont pas exportees, donc seul un test manuel peut verifier le mecanisme de bout en bout

**Preconditions**

- Application lancee en local (`pnpm dev`)
- 2 comptes mock disponibles :
  - LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
  - LIB002 / thomas.beaumont@motsvoyageurs.fr / Libraire123!
- Nettoyer localStorage pour les 2 comptes avant le test : ouvrir la console et executer `localStorage.removeItem('bookflow_edi_LIB001'); localStorage.removeItem('bookflow_edi_version_LIB001'); localStorage.removeItem('bookflow_edi_LIB002'); localStorage.removeItem('bookflow_edi_version_LIB002')` puis recharger la page

**Etapes**

1. Se connecter avec LIB001, ajouter un article au panier, passer une commande en mode EDI (tunnel complet), puis aller sur `/edi` et attendre ~10 secondes pour que les 3 messages (ORDERS, ORDRSP, DESADV) apparaissent. Noter le nombre total de messages visibles dans l'historique
2. Se deconnecter (menu burger > "Se deconnecter")
3. Se connecter avec LIB002 et aller sur `/edi`, section "Historique des echanges". Observer les messages affiches
4. Verifier dans la console du navigateur que les cles localStorage sont bien separees : `localStorage.getItem('bookflow_edi_LIB001')` et `localStorage.getItem('bookflow_edi_LIB002')`

**Resultat attendu**

- Etape 1 : les 3 messages de la commande LIB001 sont visibles dans l'historique EDI (plus eventuellement les messages mock pre-charges)
- Etape 3 : la page EDI de LIB002 ne contient **aucun** des messages generes a l'etape 1. Elle affiche uniquement les messages mock pre-charges pour LIB002 (provenant de `MOCK_EDI_MESSAGES`), qui sont communs au demarrage mais stockes separement par codeClient
- Etape 4 : `localStorage.getItem('bookflow_edi_LIB001')` contient un JSON avec les messages de LIB001 (incluant la commande passee a l'etape 1). `localStorage.getItem('bookflow_edi_LIB002')` contient un JSON different, sans la commande de LIB001

- [ ] Verifie
