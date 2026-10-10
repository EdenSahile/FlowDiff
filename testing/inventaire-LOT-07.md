# Inventaire LOT-07 : Panier, tunnel de commande

> Decoupage thematique ci-dessous cree par l'inventaire (le ticket ne definit pas de paquets).

---

### Tunnel et structure des etapes

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-050 | 3 etapes dans l'ordre (recap, adresses, transmission), navigation avant/arriere, detection derniere etape, labels | 🟢 | Fonctions pures exportees (`getNextStep`, `getPrevStep`, `isLastStep`, `getStepIndex`, `getStepLabel`) sans dependance | Unitaire, test-first. 8 tests deja ecrits dans `checkoutSteps.test.ts` |

### Validation d'adresse

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-051 | Adresse de livraison : rue requise, code postal 5 chiffres, ville requise. Parsing d'une adresse a plat | 🟢 | Schema Zod (`addressSchema`) et fonction pure `parseAddressString`, sans dependance | Unitaire, test-first. 7 tests deja ecrits dans `checkoutSchemas.test.ts` |

### Mode de transmission

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-052 | Le schema accepte uniquement FLOWDIFF ou EDI | 🟢 | Schema Zod (`transmissionSchema`), validation pure sans dependance | Unitaire, test-first |
| FLOW-RM-053 | Valeur par defaut FLOWDIFF quand rien n'est stocke en localStorage | 🟢 | `loadTransmissionMode` contient la logique de fallback (lecture localStorage + retour 'FLOWDIFF'). localStorage disponible en jsdom | Unitaire, test-first |
| FLOW-RM-054 | La preference de transmission est persistee par codeClient (cle `bookflow_transmission_{codeClient}`) | 🟢 | `transmissionKey` genere la cle par codeClient, `loadTransmissionMode` lit depuis cette cle. La logique d'isolation est la notre, localStorage est disponible en jsdom | Unitaire, test-first |

### Confirmation de commande

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-055 | Confirmer cree une commande (addOrder), vide le panier (clearCart), affiche l'ecran de succes | 🔴 | `handleConfirmOrder` est defini inline dans CartPage, orchestre des appels a plusieurs contextes (OrdersContext, CartContext, ToastContext) et modifie le state du composant. Pas de logique pure extractible | Manuel (smoke) |
| FLOW-RM-056 | Si articles en reliquat dans le panier, un toast « notifie par email » s'affiche apres confirmation | 🟠 | La detection (`hasReliquatInItems(items)`) est une derivation pure testable via le CartContext en jsdom. L'affichage du toast est du comportement composant non testable unitairement | Unitaire (detection reliquat) + smoke manuel (toast affiche) |
| FLOW-RM-057 | Message de succes different selon FLOWDIFF (recap par email) vs EDI (accuse Dilicom + statut « En attente d'envoi ») | 🔴 | Branchement JSX conditionnel dans CartPage (`localTransmission === 'EDI'`). Pas de logique pure, c'est du rendu composant | Manuel (smoke) |

### Options de commande (reference, livraison)

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-058 | Reference commande globale et par ligne limitees a 35 caracteres | 🔴 | La limite est portee par l'attribut HTML `maxLength={35}` sur les inputs. Pas de schema Zod ni de logique applicative derriere | Manuel (smoke) |
| FLOW-RM-059 | Livraison standard (1-3 jours) ou date specifique >= aujourd'hui | 🔴 | Le choix est un radio button, la contrainte date est le `min={today}` du composant DatePicker. Pas de validation metier extractible | Manuel (smoke) |

---

## Recap

**Unitaire automatise** (vers `unit-test-writer`) :
- FLOW-RM-050 : navigation du tunnel (deja couvert, 8 tests)
- FLOW-RM-051 : validation adresse + parsing (deja couvert, 7 tests)
- FLOW-RM-052 : schema transmission FLOWDIFF/EDI
- FLOW-RM-053 : valeur par defaut FLOWDIFF
- FLOW-RM-054 : persistance transmission par codeClient

**Couverture partielle** (unitaire + smoke manuel) :
- FLOW-RM-056 : unitaire sur `hasReliquatInItems` (detection reliquat dans les items du panier) + smoke « le toast s'affiche apres confirmation quand le panier contient des articles en reliquat »

**Verification manuelle** (vers `smoke-test-writer`) :
- FLOW-RM-055 : confirmer la commande cree l'order, vide le panier, affiche l'ecran de succes
- FLOW-RM-057 : le message de succes differe entre FLOWDIFF et EDI
- FLOW-RM-058 : la reference globale et par ligne sont limitees a 35 caracteres
- FLOW-RM-059 : choix livraison standard ou date specifique >= aujourd'hui
