# Smoke tests manuels - LOT-10 : Retours

> **Ces scenarios sont ecrits avant l'implementation (test-first).**
> **Ne les executer qu'une fois l'implementation terminee**, sur l'application lancee en local (`npm run dev`).

---

## Eligibilite et validation de la demande (UI)

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-074 | 🔴 | Seules les commandes au statut `livre` sont proposees dans le selecteur du formulaire de retour | SMOKE-074 ci-dessous |
| FLOW-RM-076 | 🔴 | Le bouton d'envoi reste desactive tant qu'un article coche n'a pas de motif | SMOKE-076 ci-dessous |

## Referentiels (motifs et statuts)

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-075 | 🟢 | `RETURN_REASON_LABELS` contient exactement 5 motifs avec libelles non vides | aucun smoke, couvert en unitaire |
| FLOW-RM-078 | 🟢 | `ReturnStatus` admet exactement 4 valeurs, `MOCK_RETURNS` les respecte | aucun smoke, couvert en unitaire |

## Creation d'un retour

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-077 | 🟢 | `createReturn` renvoie un retour `pending` avec champs de traitement a `null` | aucun smoke, couvert en unitaire |

## Statistiques de retours

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-079 | 🟢 | `returnRatio` = retours / commandes, 0 sans commande | aucun smoke, couvert en unitaire |
| FLOW-RM-080 | 🟢 | `activeCount` compte les retours `pending` et `in_transit` uniquement | aucun smoke, couvert en unitaire |
| FLOW-RM-081 | 🟢 | `avoirYTD` = somme des avoirs de l'annee en cours | aucun smoke, couvert en unitaire |
| FLOW-RM-082 | 🟢 | `sectorAverage` vaut 0.22 | aucun smoke, couvert en unitaire |
| FLOW-RM-083 | 🟢 | `getReturns` et `getReturnsStats` isolent par `codeClient` | aucun smoke, couvert en unitaire |

---

### SMOKE-074 : Le selecteur de commande ne propose que les commandes livrees

> ✅ **Ce qu'on verifie :**
> - Le selecteur de commande dans le formulaire de retour ne contient que les commandes au statut `livre`
> - Les commandes `en preparation` et `expedie` n'apparaissent pas dans la liste deroulante
> - Ce filtrage n'est pas testable en unitaire parce que `ELIGIBLE_STATUSES` n'est pas exporte et le filtrage vit dans le corps du composant

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Le client LIB001 a au moins 2 commandes dans les mock : `CMD0000013` (statut `en preparation`) et `CMD0000014` (statut `livre`)

**Etapes**

1. Aller sur `/historique`
2. Reperer la commande `CMD0000014` (statut `livre`) et cliquer sur le bouton "Retour"
3. Dans la modale "Nouvelle demande de retour", ouvrir le selecteur de commande (section "1. Commande concernee")
4. Lire la liste des options disponibles dans le selecteur

**Resultat attendu**

- Le selecteur est pre-rempli avec `CMD0000014`
- La liste deroulante contient uniquement `CMD0000014` (et toute autre commande au statut `livre` si de nouvelles commandes mock sont ajoutees)
- `CMD0000013` (statut `en preparation`) n'apparait pas dans les options
- Aucune commande au statut `expedie` n'apparait dans les options

- [ ] Verifie

---

### SMOKE-076 : Bouton d'envoi desactive sans motif sur un article coche

> ✅ **Ce qu'on verifie :**
> - Le bouton "Envoyer la demande" reste desactive (`disabled`) tant qu'un article est coche sans motif selectionne
> - Des qu'un motif est choisi pour chaque article coche, le bouton s'active
> - Ce garde-fou n'est pas testable en unitaire parce que `allHaveReasons` est calcule dans le corps du composant a partir du state local, non exporte

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Formulaire de retour ouvert (depuis `/historique`, bouton "Retour" sur la commande `CMD0000014`)

**Etapes**

1. Dans la modale "Nouvelle demande de retour", verifier l'etat initial du bouton "Envoyer la demande" (aucun article coche)
2. Cocher un article (par exemple "Houris" de Kamel Daoud)
3. Observer le bouton "Envoyer la demande" (article coche, pas de motif)
4. Cliquer sur un motif pour cet article (par exemple "Invendu")
5. Observer le bouton "Envoyer la demande" (article coche avec motif)

**Resultat attendu**

- Etape 1 : le bouton "Envoyer la demande" est desactive (aucun article selectionne, donc `allHaveReasons` est faux)
- Etape 2 : les tags de motif apparaissent sous l'article coche (Invendu, Defaut d'impression, Mauvaise livraison, Doublon, Autre)
- Etape 3 : le bouton reste desactive, avec une opacite reduite (0.7) et un curseur `not-allowed`
- Etape 4 : le tag du motif selectionne passe en surbrillance (fond vert clair, bordure verte)
- Etape 5 : le bouton "Envoyer la demande" devient actif (opacite pleine, curseur `pointer`, hover fonctionne)

- [ ] Verifie
