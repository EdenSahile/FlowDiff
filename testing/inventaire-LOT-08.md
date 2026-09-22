# Inventaire LOT-08 : Panier, ebooks, OP et reliquat

5 regles, pas de decoupage en paquets dans le ticket. Tableau unique.

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-060 | Snapshot du statut stock au moment de l'ajout : le `CartItem` stocke `book.statut` a la creation, pas une reference au statut courant | :green_circle: | C'est notre code : l'assignation `statut: book.statut` dans `addToCart` (ligne 267 de CartContext). On peut rendre le provider avec RTL, appeler `addToCart` avec un book dont le statut est `disponible`, et verifier que l'item cree porte bien ce statut. Aucune dependance externe. | Unitaire, test-first |
| FLOW-RM-061 | Flag `enReliquat` positionne a `true` pour les titres `en_reimp`, `false` sinon ; `hasReliquatInItems` detecte la presence d'au moins 1 reliquat | :green_circle: | `hasReliquatInItems` est une fonction pure exportee, directement testable. L'assignation `enReliquat: enReliquat ?? false` dans `addToCart` est notre logique de state. Aucun comportement de dependance en jeu. | Unitaire, test-first |
| FLOW-RM-062 | Checkbox "Adresse de facturation identique a la livraison" cochee par defaut ; quand cochee, la facturation reprend l'adresse de livraison et la validation saute le formulaire de facturation | :orange_circle: | La valeur par defaut (`useState(true)`), la resolution de l'adresse effective (`sameAsDelivery ? deliveryAddress : billingAddress`), et le saut de validation dans `goNext` sont notre code, testables unitairement en rendant CartPage avec des providers mockes. Mais CartPage (1300+ lignes) requiert le mock de 5 contexts (Cart, Auth, Toast, Notifications, Router). L'interaction reelle (la checkbox bascule, le formulaire apparait/disparait, le tunnel complet fonctionne) n'est confirmee par aucun smoke existant. | Unitaire (logique de resolution + validation) + smoke manuel (interaction checkbox dans le tunnel) |
| FLOW-RM-063 | Ebooks supportes avec ISBN specifique et hebergeur : cle composite `bookId::isbnEbook` pour le panier, deduplication par ISBN ebook | :green_circle: | `getItemKey` est une fonction pure exportee. La deduplication dans `addToCart` (match sur `book.id` + `isbnEbook` pour les ebooks, `book.id` seul sinon) est notre logique de state. On peut tester `getItemKey` directement et verifier le comportement de dedup via le provider. Aucune dependance externe. | Unitaire, test-first |
| FLOW-RM-064 | Ajout et suppression d'operations promotionnelles : `addOPToCart` ajoute un groupe OP avec cadeau (gratuit) et PLV (payante), `removeOP` le retire ; la limite CART_LIMIT s'applique aux livres OP | :green_circle: | `addOPToCart` et `removeOP` sont des transformations de state dans notre code. Le calcul PLV dans `computeTotals` est deja couvert par les tests existants. L'ajout (avec generation d'id et controle de limite) et la suppression (filtre par id) sont testables via le provider. Aucun comportement de dependance. | Unitaire, test-first |

## Recap

### Unitaire automatise (vers `unit-test-writer`)

- FLOW-RM-060 : snapshot statut stock a l'ajout
- FLOW-RM-061 : flag enReliquat et detection `hasReliquatInItems`
- FLOW-RM-063 : cle composite ebook et deduplication
- FLOW-RM-064 : ajout/suppression OP avec controle CART_LIMIT

### Couverture partielle, unitaire + smoke (vers `unit-test-writer` + `smoke-test-writer`)

- FLOW-RM-062 : unitaire sur la logique (valeur par defaut, resolution adresse effective, saut de validation) + smoke manuel "tunnel adresses : verifier que la checkbox est cochee par defaut, que la decocher affiche le formulaire de facturation, et que la recocher le masque"

### Verification manuelle uniquement (vers `smoke-test-writer`)

Aucune regle dans ce lot.
