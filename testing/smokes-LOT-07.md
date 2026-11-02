# Smoke tests manuels — LOT-07 : panier et tunnel de commande

> Scénarios à exécuter sur l'application locale (`npm run dev`). Ils décrivent le tunnel courant : **adresses**, puis **vérification**. L'ancienne étape « Mode de transmission » a été supprimée ; l'EDI se simule depuis `/edi`, jamais depuis le panier.

## Règles du tunnel actuel

| Règle | Vérification | Couverture |
|---|---|---|
| FLOW-RM-050 | Deux étapes, navigation et ancienne URL `?etape=transmission` redirigée vers une étape valide | unitaire (`checkoutSteps.test.ts`) + SMOKE-055 |
| FLOW-RM-051 | Adresse de livraison : rue requise, code postal à cinq chiffres, ville requise | unitaire (`checkoutSchemas.test.ts`) + SMOKE-055 |
| FLOW-RM-052 à 054 | Ancien choix et préférence de transmission | **Remplacés** : ces règles ne correspondent plus au tunnel actuel |
| FLOW-RM-055 | Validation : crée la commande, vide le panier, affiche la confirmation | SMOKE-055 |
| FLOW-RM-056 | Un reliquat affiche un message de démonstration après validation | SMOKE-056 |
| FLOW-RM-057 | Les canaux Site FlowDiff et EDI — simulation sont distincts | SMOKE-057 |
| FLOW-RM-058 | Références globale et par ligne limitées à 35 caractères | SMOKE-058 |
| FLOW-RM-059 | Livraison standard ou date spécifique non antérieure au jour courant | SMOKE-059 |

## SMOKE-055 — Valider une commande créée depuis le site

**Préconditions**

- Application lancée localement, compte de démonstration connecté.
- Panier vide au départ.

**Étapes**

1. Depuis `/fonds`, ajouter deux exemplaires d'un titre disponible.
2. Ouvrir `/panier`, relever le Total TTC, puis cliquer « Valider la commande ».
3. À l'étape « Adresses », vérifier ou renseigner une adresse de livraison valide, puis cliquer « Vérifier ma commande ».
4. À l'étape « Vérifiez votre commande », contrôler les lignes, montants et adresses, puis cliquer « Valider ma commande ».
5. Ouvrir `/panier`, puis `/historique`.

**Résultat attendu**

- Aucune étape ni option « Mode de transmission » n'est proposée.
- La confirmation affiche « Votre commande a été enregistrée sur FlowDiff. » et « Démonstration : aucune commande réelle n’a été transmise. »
- Le panier est vide ; la commande récente est présente dans l'historique avec l'origine « Site FlowDiff », le statut métier et le total relevé.
- Aucun échange EDI n'est créé par cette commande.

## SMOKE-056 — Reliquat sans promesse d'email réel

**Préconditions**

- Panier vide ; ajouter un titre en réimpression en confirmant l'alerte stock.

**Étapes**

1. Vérifier que la ligne du panier signale le reliquat.
2. Parcourir Adresses → Vérifiez votre commande → « Valider ma commande ».

**Résultat attendu**

- Un toast affiche : « Démonstration : les titres en reliquat apparaîtront dans le suivi de commande. »
- Le toast ne promet pas l'envoi d'un email.

## SMOKE-057 — Séparation du site et de la simulation EDI

**Préconditions**

- Compte de démonstration connecté ; noter le contenu du panier avant la simulation.

**Étapes**

1. Créer une commande par le panier selon SMOKE-055 et noter son origine dans `/historique`.
2. Ouvrir `/edi` et cliquer « Simuler une nouvelle commande EDI ».
3. Vérifier l'historique des échanges EDI, puis revenir dans `/historique` et `/panier`.

**Résultat attendu**

- La commande créée par le panier est libellée « Site FlowDiff » et n'a créé aucun message EDI.
- La simulation ajoute une commande libellée « EDI — simulation » et les messages ORDERS, ORDRSP et DESADV associés au distributeur « FlowDiff — distributeur fictif ».
- Le panier reste strictement inchangé par la simulation EDI.
- La page EDI précise que les étapes sont générées immédiatement pour les besoins de la démonstration et qu'aucune connexion réelle à Dilicom n'est active.

## SMOKE-058 — Références de commande

**Préconditions**

- Un titre disponible dans le panier ; préparer une chaîne de 40 caractères.

**Étapes**

1. Dans le panier, renseigner la référence globale et une référence de ligne avec cette chaîne.
2. Vérifier que chaque champ s'arrête au 35e caractère.
3. Parcourir Adresses → Vérifiez votre commande → « Valider ma commande », puis ouvrir la commande dans `/historique`.

**Résultat attendu**

- Les deux références enregistrées sont limitées à 35 caractères et restent distinctes.

## SMOKE-059 — Livraison standard ou date spécifique

**Préconditions**

- Un titre disponible dans le panier.

**Étapes**

1. Dans le panier, vérifier que « Délai habituel (1–3 jours ouvrés) » est le choix par défaut.
2. Choisir « Date spécifique » et ouvrir le calendrier.
3. Vérifier qu'une date passée ne peut pas être sélectionnée, puis choisir une date future.
4. Cliquer « Valider la commande », poursuivre par Adresses puis Vérifiez votre commande et valider.

**Résultat attendu**

- Le bouton de départ reste indisponible tant qu'une date spécifique est sélectionnée sans date.
- La commande conserve la date demandée ; le mode standard n'enregistre pas de date spécifique.
