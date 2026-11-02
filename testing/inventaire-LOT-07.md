# Inventaire LOT-07 : panier et tunnel de commande

> Inventaire synchronisé avec le tunnel courant : les commandes du panier sont uniquement d'origine Site FlowDiff. Le choix de transmission a été supprimé ; l'EDI est simulé depuis sa page dédiée.

## Tunnel et validation

| Règle | Ce qu'on vérifie | Testable unitaire ? | Comment |
|---|---|---|---|
| FLOW-RM-050 | Deux étapes dans l'ordre (adresses, vérification), navigation et redirection de `?etape=transmission` | 🟢 | `checkoutSteps.test.ts` |
| FLOW-RM-051 | Adresse de livraison : rue, code postal à cinq chiffres et ville ; parsing d'adresse | 🟢 | `checkoutSchemas.test.ts` |
| FLOW-RM-052 à 054 | Ancien choix et préférence de transmission | — | Règles remplacées ; aucun comportement à tester dans le panier |
| FLOW-RM-055 | Validation : commande ajoutée, panier vidé, écran de succès | 🔴 | Smoke LOT-07 |
| FLOW-RM-056 | Reliquat : détection et toast de démonstration | 🟠 | Unitaire sur `hasReliquatInItems` + smoke LOT-07 |
| FLOW-RM-057 | Isolement du site et de l'EDI — simulation | 🟠 | `EDIContext.test.tsx` + smoke LOT-07 |

## Options de commande

| Règle | Ce qu'on vérifie | Testable unitaire ? | Comment |
|---|---|---|---|
| FLOW-RM-058 | Références globale et par ligne limitées à 35 caractères | 🔴 | Smoke LOT-07 |
| FLOW-RM-059 | Livraison standard ou date spécifique non antérieure au jour courant | 🔴 | Smoke LOT-07 |

## Recap

- Unitaire : navigation du tunnel, validation des adresses et détection de reliquat.
- Smoke : confirmation Site FlowDiff, reliquat, séparation avec l'EDI, références et livraison.
- Les règles de transmission du panier sont conservées dans les archives historiques, mais ne sont plus applicables.
