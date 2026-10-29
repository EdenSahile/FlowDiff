# Smoke tests manuels - LOT-06 : Panier et remises

> **Ces scenarios sont ecrits apres l'implementation**, contrairement aux fichiers des LOT-02, 03, 04, 10 et 11, qui precedaient le code (test-first). Les libelles, chemins et numeros de ligne cites ont donc ete releves dans la source le 25 octobre 2026.
> A executer sur l'application lancee en local (`npm run dev`).

---

## Remises

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-041 | 🟢 | `REMISE_RATES` : 30 % en BD/Mangas et Jeunesse, 35 % en Litterature et Adulte-pratique | aucun smoke, couvert en unitaire |
| FLOW-RM-042 | 🟠 | Les taux du libraire connecte passent devant `REMISE_RATES`, et le prix net affiche les suit | non observable en manuel (demo mono-compte), couvert en unitaire : voir SMOKE-042 ci-dessous |
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

### SMOKE-042 : Le prix net suit les taux du libraire connecte

> **Non verifiable en manuel : la regle est couverte par les tests unitaires.**
>
> La regle (`effectiveRates`, `src/contexts/CartContext.tsx:239-244`) : les taux de `remisesParUnivers` du libraire connecte passent devant `REMISE_RATES`, et le prix net affiche les suit. Elle est testee en unitaire (part 🟠 de FLOW-RM-042).
>
> Elle n'est pas observable a la main, pour deux raisons cumulees et voulues par le design de la demo :
>
> - **Demo mono-compte.** Le login est verrouille sur LIB001 : champs pre-remplis et desactives dans `src/pages/auth/LoginPage.tsx`, pour ne jamais exposer d'identifiant. On ne peut donc pas se connecter comme un autre libraire pour comparer les taux.
> - **Taux identiques au defaut.** Les 3 libraires de `src/lib/mockUsers.ts` portent les memes taux que `REMISE_RATES` (Litterature 35, Adulte-pratique 35, BD/Mangas 30, Jeunesse 30). Un ecran qui afficherait le taux par defaut et un ecran qui afficherait le taux du libraire sont donc indistinguables.
>
> La rendre observable supposerait soit de deverrouiller le login (contraire au parti pris de la demo), soit de donner a LIB001 un taux distinct du defaut. Decision prise de ne pas le faire : la regle reste garantie par l'unitaire.

- [x] Couvert en unitaire, non applicable en smoke
