# Smoke tests manuels - LOT-06 : Panier et remises

> **Ces scenarios sont ecrits apres l'implementation**, contrairement aux fichiers des LOT-02, 03, 04, 10 et 11, qui precedaient le code (test-first). Les libelles, chemins et numeros de ligne cites ont donc ete releves dans la source le 25 octobre 2026.
> A executer sur l'application lancee en local (`npm run dev`).

---

## Remises

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-041 | 🟢 | `REMISE_RATES` : 30 % en BD/Mangas et Jeunesse, 35 % en Litterature et Adulte-pratique | aucun smoke, couvert en unitaire |
| FLOW-RM-042 | 🟠 | Les taux du libraire connecte passent devant `REMISE_RATES`, et le prix net affiche les suit | SMOKE-042 ci-dessous, part unitaire sur les totaux |
| FLOW-RM-043 | 🟢 | La remise porte sur les ouvrages d'une OP, pas sur la PLV | aucun smoke, couvert en unitaire |
| FLOW-RM-044 | 🟢 | TVA a 5,5 % sur le livre, 20 % sur la PLV | aucun smoke, couvert en unitaire |
| FLOW-RM-045 | 🟢 | Formule du net HT | aucun smoke, couvert en unitaire |
| FLOW-RM-046 | 🟢 | Panier vide : tous les totaux a 0 | aucun smoke, couvert en unitaire |

## Operations sur le panier

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-038 | 🟢 | Limite de 30 articles | aucun smoke, couvert en unitaire |
| FLOW-RM-039 | 🟢 | Meme livre ajoute 2 fois : incrementation, pas de 2e ligne | aucun smoke, couvert en unitaire |
| FLOW-RM-040 | 🟢 | Toast d'erreur quand la limite est atteinte, panier inchange | aucun smoke, couvert en unitaire |
| FLOW-RM-047 | 🟢 | Quantite ramenee sous 1 : la ligne est supprimee | aucun smoke, couvert en unitaire |
| FLOW-RM-048 | 🟢 | Panier persiste par codeClient | aucun smoke, couvert en unitaire (LOT-03) |
| FLOW-RM-049 | 🟢 | Panier invalide en localStorage : purge | aucun smoke, couvert en unitaire |

---

### SMOKE-042 : Le prix net affiche suit les taux du libraire connecte

> ✅ **Ce qu'on verifie :**
> - Le pourcentage de remise et le prix net affiches sur la carte du catalogue viennent de `remisesParUnivers` du libraire connecte, et non de `REMISE_RATES`
> - Le recapitulatif du panier utilise le meme taux
> - La part unitaire couvre les totaux calcules (`effectiveRates`, `src/contexts/CartContext.tsx:240-244`). Le smoke couvre ce qui ne se voit qu'a l'ecran : les 2 endroits qui affichent la remise lisent bien la meme source
>
> ⚠️ **Cette regle n'est pas observable sur les donnees actuelles.** Les 3 libraires de `src/lib/mockUsers.ts` portent tous `{ Litterature: 35, BD/Mangas: 30, Jeunesse: 30, Adulte-pratique: 35 }`, exactement les valeurs de `REMISE_RATES` (`src/contexts/CartContext.tsx:20-25`). Avec ces donnees, un ecran affichant les taux par defaut et un ecran affichant les taux du libraire sont indistinguables. Le scenario demande donc une modification temporaire des donnees mock, a annuler apres le test.

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Panier vide au depart
- **Modification temporaire** : dans `src/lib/mockUsers.ts`, sur le seul utilisateur `LIB001`, remplacer `'BD/Mangas': 30` par `'BD/Mangas': 42`. Laisser LIB002 et LIB003 intacts, ils servent de temoin. Se deconnecter puis se reconnecter pour que le contexte d'authentification relise l'utilisateur
- Un titre de l'univers BD/Mangas au statut disponible est necessaire, par exemple « Spy x Family T.1 » (`f-bd-spy`). « Jujutsu Kaisen T.8 » ne convient pas, il est en reimpression

**Etapes**

1. Aller sur `/fonds` et filtrer sur l'univers BD/Mangas
2. Sur la carte de « Spy x Family T.1 », relever le pourcentage de remise affiche et le prix net
3. Ajouter ce titre au panier, quantite 1
4. Aller sur `/panier` et relever, dans le recapitulatif de droite, le pourcentage de remise et le montant de la remise
5. Se deconnecter, se connecter avec LIB002 / thomas.beaumont@motsvoyageurs.fr / Libraire123!
6. Revenir sur la carte du meme titre dans `/fonds` et relever de nouveau le pourcentage et le prix net
7. **Annuler la modification de `src/lib/mockUsers.ts`** et verifier que la carte reaffiche 30 % pour LIB001

**Resultat attendu**

- Etape 2 : la carte affiche **42 %**, pas 30 %. Le prix net vaut le prix public TTC moins 42 %
- Etape 4 : le recapitulatif du panier affiche **42 %** lui aussi, et le montant de la remise vaut 42 % du prix public TTC. Les 2 ecrans ne doivent jamais afficher 2 taux differents pour le meme titre
- Etape 6 : la carte affiche **30 %** pour LIB002, qui n'a pas ete modifie. C'est ce qui prouve que le taux vient du libraire connecte et non d'une valeur globale
- Etape 7 : LIB001 repasse a 30 %, et le fichier mock est revenu a son etat d'origine. Verifier par `git diff src/lib/mockUsers.ts`, qui doit etre vide

- [ ] Verifie
