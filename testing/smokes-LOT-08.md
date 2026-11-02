# Smoke tests manuels — LOT-08 : panier, ebooks, OP et reliquat

> Ces scénarios concernent l'interface actuelle. Le tunnel passe par **Adresses**, puis **Vérifiez votre commande** ; l'ancienne étape « Mode de transmission » est supprimée.

## Règles du lot

| Règle | Vérification | Couverture |
|---|---|---|
| FLOW-RM-060 | Le statut de stock est figé à l'ajout | unitaire |
| FLOW-RM-061 | Drapeau `enReliquat` et détection de reliquat | unitaire ; effet visible dans SMOKE-056 du LOT-07 |
| FLOW-RM-062 | Adresse de facturation identique par défaut ; validation et persistance de l'adresse retenue | SMOKE-062 |
| FLOW-RM-063 | Clé composite ebook et déduplication par ISBN numérique | unitaire |
| FLOW-RM-064 | Ajout/retrait d'une OP et limite `CART_LIMIT` | unitaire |

## SMOKE-062 — La case « Adresse de facturation identique » pilote le formulaire et la commande

**Préconditions**

- Application locale lancée ; compte de démonstration connecté.
- Un titre disponible dans le panier.

**Étapes**

1. Dans `/panier`, cliquer « Valider la commande » pour arriver à l'étape « Adresses ».
2. Vérifier que « Adresse de facturation identique à la livraison » est cochée et qu'aucun formulaire de facturation n'est affiché.
3. Décocher la case, saisir un code postal de facturation invalide et laisser la ville vide, puis cliquer « Vérifier ma commande ».
4. Corriger l'adresse de facturation avec, par exemple, `5 avenue Foch, 69003 Lyon`, puis cliquer « Vérifier ma commande ».
5. À l'étape « Vérifiez votre commande », contrôler les deux adresses ; cliquer « Valider ma commande ».
6. Ouvrir la commande la plus récente dans `/historique`.

**Résultat attendu**

- À l'étape 3, le passage est bloqué et les erreurs de code postal et de ville sont visibles.
- Une fois l'adresse valide, l'écran de vérification affiche deux adresses distinctes.
- Après validation, l'historique reprend l'adresse de facturation distincte ; lorsqu'elle est cochée comme identique, il reprend l'adresse de livraison.
- Cette commande reste d'origine « Site FlowDiff » : le réglage des adresses ne déclenche pas de simulation EDI.
