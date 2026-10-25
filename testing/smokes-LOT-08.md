# Smoke tests manuels - LOT-08 : Panier, ebooks, OP et reliquat

> **Ces scenarios sont ecrits apres l'implementation**, contrairement aux fichiers des LOT-02, 03, 04, 10 et 11, qui precedaient le code (test-first). Les libelles, chemins et numeros de ligne cites ont donc ete releves dans la source le 25 octobre 2026.
> A executer sur l'application lancee en local (`pnpm dev`).

---

## Regles du lot

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-060 | 🟢 | Le statut de stock est fige a l'ajout, la ligne de panier ne suit pas le statut courant | aucun smoke, couvert en unitaire |
| FLOW-RM-061 | 🟢 | Drapeau `enReliquat` sur un titre en reimpression, et detection par `hasReliquatInItems` | aucun smoke, couvert en unitaire. L'affichage du toast releve de SMOKE-056 (LOT-07) |
| FLOW-RM-062 | 🟠 | Adresse de facturation identique a la livraison : cochee par defaut, et la validation saute le formulaire de facturation | SMOKE-062 ci-dessous, part unitaire sur la resolution d'adresse et le saut de validation |
| FLOW-RM-063 | 🟢 | Cle composite `bookId::isbnEbook`, deduplication par ISBN numerique | aucun smoke, couvert en unitaire |
| FLOW-RM-064 | 🟢 | Ajout et retrait d'une OP, limite `CART_LIMIT` appliquee aux livres de l'OP | aucun smoke, couvert en unitaire |

---

### SMOKE-062 : La case « adresse de facturation identique » commande le formulaire de facturation

> ✅ **Ce qu'on verifie :**
> - La case est cochee a l'arrivee sur l'etape Adresses
> - La decocher fait apparaitre un formulaire de facturation, la recocher le fait disparaitre
> - Case cochee, la validation ne reclame rien sur la facturation, meme si le formulaire a ete rempli n'importe comment avant d'etre masque
> - Case decochee, un formulaire de facturation incomplet bloque le passage a l'etape suivante
> - Case cochee, le recapitulatif de l'etape 3 affiche la meme adresse des 2 cotes
> - La part unitaire couvre la valeur par defaut, la resolution `sameAsDelivery ? deliveryAddress : billingAddress` et le saut de validation dans `goNext` (`src/pages/cart/CartPage.tsx:1158-1169`). Le smoke couvre l'apparition et la disparition du formulaire, et le fait que la validation ne se declenche pas sur un formulaire masque
>
> ⚠️ **L'adresse de facturation n'arrive pas sur la commande creee.** `handleConfirmOrder` calcule `effectiveBilling` puis l'abandonne par `void effectiveBilling` (`CartPage.tsx:1181-1199`) : elle n'est pas passee a `addOrder`. La regle ne se verifie donc **que sur le recapitulatif de l'etape 3**, pas dans l'historique de commandes. Ne pas chercher cette adresse sur `/historique`, elle n'y est pas.

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- 1 titre disponible dans le panier, par exemple « Leurs enfants apres eux » de Nicolas Mathieu
- L'adresse de livraison du compte LIB001 est `12 rue du Parc, 75001 Paris`

**Etapes**

1. Aller sur `/panier`, cliquer « Valider la commande », puis « Suivant : Adresses »
2. Observer l'etat de la case « Adresse de facturation identique a la livraison » et ce qui s'affiche sous elle
3. Decocher la case et observer
4. Dans le formulaire de facturation qui apparait, saisir un code postal invalide, `7500` sur 4 chiffres, et laisser la ville vide
5. Cliquer « Suivant : Mode de transmission »
6. Recocher la case et observer ce qu'il advient du formulaire de facturation et des messages d'erreur
7. Cliquer « Suivant : Mode de transmission »
8. Sur l'etape 3, lire les 2 encarts « Adresse de livraison » et « Adresse de facturation » du recapitulatif
9. Revenir en arriere par « Adresses », decocher la case, remplir cette fois une adresse de facturation valide et differente, par exemple `5 avenue Foch, 69003 Lyon`, puis avancer jusqu'a l'etape 3 et relire les 2 encarts

**Resultat attendu**

- Etape 2 : la case est **cochee**, et aucun formulaire de facturation n'est affiche
- Etape 3 : un bloc « Adresse de facturation » apparait, avec les memes champs que la livraison
- Etape 5 : le passage est **bloque**, l'etape reste sur Adresses, et les erreurs de code postal et de ville s'affichent sur le formulaire de facturation
- Etape 6 : le formulaire de facturation disparait entierement, erreurs comprises
- Etape 7 : le passage a l'etape 3 **reussit**, bien que les valeurs invalides saisies a l'etape 4 soient toujours en memoire. C'est le point central de ce scenario : case cochee, la facturation n'est pas validee du tout
- Etape 8 : les 2 encarts affichent la meme adresse, `12 rue du Parc, 75001 Paris`
- Etape 9 : les 2 encarts affichent 2 adresses differentes, la livraison a Paris et la facturation a Lyon

- [ ] Verifie
