# Smoke tests manuels — LOT-11 : simulation EDI

> La page EDI est une simulation. Elle illustre des commandes externes provenant du logiciel du libraire, sans connexion réelle à Dilicom et sans transmission réelle.

## SMOKE-084 — Simuler une commande externe et ses messages

**Préconditions**

- Application locale lancée, compte de démonstration connecté.
- Noter le contenu actuel du panier.

**Étapes**

1. Ouvrir `/edi` et lire le bandeau « Simulation des échanges EDI ».
2. Cliquer « Simuler une nouvelle commande EDI ».
3. Relever la nouvelle commande dans l'historique des échanges, puis dans `/historique`.
4. Revenir dans `/panier`.

**Résultat attendu**

- La page explique qu'aucune connexion réelle à Dilicom n'est active et que les étapes sont accélérées pour la démonstration.
- Les messages ORDERS, ORDRSP et DESADV de la nouvelle commande apparaissent immédiatement et pointent vers le même numéro de commande.
- L'historique affiche l'origine « EDI — simulation » et le distributeur « FlowDiff — distributeur fictif ».
- Le panier est inchangé.

## SMOKE-085 — Isolation par compte de démonstration

**Préconditions**

- Deux comptes de démonstration disponibles.

**Étapes**

1. Avec le premier compte, créer une simulation EDI et noter son numéro de commande.
2. Se déconnecter, puis se connecter avec le second compte et ouvrir `/edi`.

**Résultat attendu**

- Le second compte ne voit pas les messages créés par le premier compte.
- Les données propres à chaque compte restent séparées dans le stockage local.
