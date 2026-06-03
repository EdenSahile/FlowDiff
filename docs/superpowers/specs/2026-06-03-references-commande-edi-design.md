# Spec : Références de commande sur les ORDERS EDI

**Date** : 2026-06-03  
**Statut** : Approuvé

---

## Contexte

Un libraire doit pouvoir associer une **référence interne** à une commande (ex: numéro de bon de commande, nom de projet, affectation par rayon) pour la retrouver dans son propre système de gestion. Cette référence doit apparaître dans le message EDIFACT ORDERS transmis à Dilicom et être visible dans l'historique.

---

## Périmètre

- **Deux modes** disponibles en toggle dans l'étape Panier :
  - **Référence globale** — une seule référence pour toute la commande
  - **Référence par article** — une référence différente par titre

- **Saisie** : dans l'étape Panier, section dédiée sous la liste des articles  
- **Transmission** : incluse dans le message EDIFACT ORDERS (segment `RFF+CR`)  
- **Affichage** : badge discret `Réf: XXX` dans la liste des commandes (HistoriquePage)

---

## Types et données

### `src/data/mockOrders.ts`
```ts
interface OrderItem {
  // ... champs existants ...
  referenceLigne?: string   // référence par article (mode par-article)
}

interface Order {
  // ... champs existants ...
  referenceCommande?: string   // référence globale
}
```

### `src/lib/ediUtils.ts`
```ts
interface ORDERSLine {
  // ... champs existants ...
  referenceLigne?: string   // référence par article
}

interface ORDERSPayload {
  // ... champs existants ...
  referenceGlobale?: string   // référence globale
}
```

---

## CartPage — UI (étape `'cart'`)

### Section "Référence commande"
Placée sous la liste des articles (avant le récapitulatif). Card avec titre "Référence commande" + sous-titre "(optionnel)".

### Toggle de mode
Deux pills / boutons radio : `Référence globale` | `Par article`  
Valeur par défaut : `global`.

### Mode global
Un seul `<input type="text" maxLength={35}>` — limite EDIFACT.  
Placeholder : `Ex: BC-2026-0412, Rayon-Littérature…`

### Mode par article
Un input de référence sous chaque ligne d'article dans la liste du panier.  
Le champ est identifié par `getItemKey(book)` (clé déjà utilisée dans CartContext).  
Les articles dans les OP groups ont aussi leur propre champ.

### State local (dans CartPage)
```ts
const [refMode, setRefMode] = useState<'global' | 'par-ligne'>('global')
const [refGlobale, setRefGlobale] = useState('')
const [refsParLigne, setRefsParLigne] = useState<Record<string, string>>({})
```

---

## handleConfirmOrder — passage des références

```ts
addOrder({
  // champs existants...
  referenceCommande: refMode === 'global' ? (refGlobale.trim() || undefined) : undefined,
  items: items.map(({ book, quantity }) => ({
    ...buildItemFields(book, quantity),
    referenceLigne: refMode === 'par-ligne'
      ? (refsParLigne[getItemKey(book)]?.trim() || undefined)
      : undefined,
  })),
})
```

---

## Template EDIFACT ORDERS (`src/lib/ediUtils.ts`)

### Référence globale
Segment `RFF+CR:<ref>'` inséré **après les NAD, avant les lignes LIN** :
```
NAD+BY+301234XXXXXXX::9'
NAD+SU+GLN-DIFFUSEUR::9'
RFF+CR:BC-2026-0412'        ← nouveau si referenceGlobale présent
LIN+1++9782070360024:EN'
QTY+21:3'
```

### Référence par article
Segment `RFF+CR:<ref>'` inséré **après chaque `QTY+21`** dans les lignes :
```
LIN+1++9782070360024:EN'
QTY+21:3'
RFF+CR:RAYON-LITTERATURE'  ← nouveau si referenceLigne présente sur cette ligne
LIN+2++9782809491739:EN'
QTY+21:5'
                            ← pas de RFF si pas de référence sur cette ligne
```

Le compte `UNT` est recalculé automatiquement (somme de tous les segments générés).

---

## HistoriquePage — badge référence

Dans la liste des commandes, après `<OrderNumero>`, afficher si `order.referenceCommande` est défini :
```tsx
{order.referenceCommande && (
  <RefBadge>Réf : {order.referenceCommande}</RefBadge>
)}
```

Style : pilule fond `theme.colors.navyLight`, texte `theme.colors.navy`, font 11px, padding `2px 8px`.

---

## Données mock

Ajouter `referenceCommande` sur au moins une commande mock (`mockOrders.ts`) pour que le badge soit visible en dev :
- `CMD0000013` : `referenceCommande: 'BC-2026-0412'`

---

## Contraintes

- `maxLength={35}` sur tous les inputs de référence (limite segment EDIFACT)
- Champs totalement optionnels — aucune validation de format
- Si la référence est vide après trim, ne pas inclure le segment `RFF+CR` dans le template

---

## Fichiers modifiés

1. `src/data/mockOrders.ts` — types + données mock
2. `src/lib/ediUtils.ts` — types + template ORDERS
3. `src/pages/cart/CartPage.tsx` — UI section référence + state + handleConfirmOrder
4. `src/pages/historique/HistoriquePage.tsx` — badge RefBadge
