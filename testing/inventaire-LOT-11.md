# Inventaire LOT-11 : simulation EDI

> Cet inventaire décrit une simulation métier inspirée de Dilicom. Aucun échange, compte, réseau ou intégration Dilicom réel n'est utilisé.

| Règle | Ce qu'on vérifie | Testable unitaire ? | Comment |
|---|---|---|---|
| FLOW-RM-084 | Le bouton EDI crée une commande externe fictive et les messages ORDERS, ORDRSP et DESADV associés, immédiatement pour la démonstration | 🟠 | `EDIContext.test.tsx` vérifie la génération unique ; smoke LOT-11 vérifie l'interface |
| FLOW-RM-085 | Les messages sont isolés par `codeClient` | 🟢 | `EDIContext.test.tsx` monte deux comptes de démonstration distincts |
| FLOW-RM-086 | `groupDESADVByOrder` : statut `EN_COURS` si quantité livrée inférieure, `SOLDE` sinon | 🟢 | `ediUtils.test.ts` |
| FLOW-RM-087 | `filterEDIMessages` filtre par type ou `ALL` | 🟢 | `ediUtils.test.ts` |
| FLOW-RM-088 | `getFluxCounts` calcule les compteurs affichés | 🟢 | `ediUtils.test.ts` |
| FLOW-RM-089 | `messageContainsISBN` recherche par ISBN, référence ou commande | 🟢 | `ediUtils.test.ts` |
| FLOW-RM-090 | Le rendu EDIFACT illustratif découpe les titres longs | 🟢 | `ediUtils.test.ts` |
| FLOW-RM-091 | Le rendu EDIFACT illustratif formate l'auteur | 🟢 | `ediUtils.test.ts` |

## Remplacement des scénarios historiques

Les anciennes consignes demandaient de sélectionner EDI dans le tunnel du panier et d'attendre 3 puis 8 secondes. Elles sont remplacées : l'action « Simuler une nouvelle commande EDI » de `/edi` ne lit ni ne modifie le panier, et les trois messages sont ajoutés immédiatement afin de rendre la démonstration observable.
