# Design — Template ORDRSP EDIFACT production

**Date :** 2026-06-03  
**Scope :** `src/lib/ediUtils.ts` — fonction ORDRSP dans `EDIFACT_TEMPLATES`  
**Standards :** EANCOM D96A EAN008, EDItEUR Trade Book Supply, Dilicom

---

## Contexte

Le template ORDRSP actuel présente plusieurs non-conformités par rapport au standard EDIFACT book trade :
- `UNA` absente
- `UNH` sans `documentRef` ni `:EAN008`
- `UNB`/`UNZ` avec référence `1` fixe au lieu de `documentRef`
- `BGM` code `4` hardcodé — doit être dynamique selon le statut global
- Pas de `PIA` par ligne (ISBN présent dans ORDERS et INVOIC, absent dans ORDRSP)
- Pas de `RFF+LI` par ligne (référence au numéro de ligne de la commande originale)
- Constantes NAD textuelles au lieu de `SUPPLIER_GLN` / `BUYER_GLN`

---

## Structure globale

```
UNA:+.? '
UNB+UNOC:3+DiffuseurGLN:14+ClientGLN:14+date:time+documentRef'
UNH+documentRef+ORDRSP:D:96A:UN:EAN008'
BGM+231+documentRef+{bgmCode}'
DTM+137:date:102'
RFF+ON:orderId'
NAD+SE+DiffuseurGLN::9'
NAD+BY+ClientGLN::9'
[FTX+ZZZ+++motifRefus']       ← uniquement si globalStatus = REJECTED
{lignes}
UNS+S'
UNT+N+documentRef'
UNZ+1+documentRef'
```

### BGM code dynamique

| `globalStatus` | Code BGM | Signification EDIFACT |
|----------------|----------|-----------------------|
| `ACCEPTED`     | `29`     | Accepté sans modification |
| `PARTIAL`      | `4`      | Accepté avec modifications (quantités partielles) |
| `REJECTED`     | `27`     | Non accepté |

### Segments header

- **UNB** : sender = `SUPPLIER_GLN` (diffuseur), receiver = `BUYER_GLN` (libraire), interchange ref = `documentRef`
- **UNH** : message ref = `documentRef`, type = `ORDRSP:D:96A:UN:EAN008`
- **BGM+231** : `231` = Purchase order response (code message EDIFACT), suivi du `documentRef` et du code fonction
- **DTM+137** : date du message (date de réponse), format `:102` (CCYYMMDD)
- **RFF+ON** : numéro de la commande ORDERS originale (`orderId`)
- **NAD+SE** : `SUPPLIER_GLN::9` — diffuseur (émetteur de la réponse)
- **NAD+BY** : `BUYER_GLN::9` — libraire (destinataire)
- **FTX+ZZZ** : motif de refus global, uniquement si `globalStatus = REJECTED` et `rejectionReason` présent

---

## Structure par ligne

### Ligne acceptée (`ACCEPTED`)

```
LIN+N++EAN:EN'
PIA+5+EAN:IB'
RFF+LI:N'
QTY+21:qtyRequested'
QTY+1:qtyConfirmed'
```

### Ligne en reliquat (`BACKORDERED`)

```
LIN+N++EAN:EN'
PIA+5+EAN:IB'
RFF+LI:N'
QTY+21:qtyRequested'
QTY+1:qtyConfirmed'
QTY+83:backorderQty'
[DTM+358:YYYYMMDD:102']
[FTX+ZZZ+++note']
```

### Ligne rejetée (`REJECTED`)

```
LIN+N++EAN:EN'
PIA+5+EAN:IB'
RFF+LI:N'
QTY+21:qtyRequested'
QTY+1:0'
[FTX+ZZZ+++note']
```

### Qualificateurs QTY

| Qualificateur | Signification |
|---------------|---------------|
| `21` | Quantité commandée (buyer's order) |
| `1`  | Quantité confirmée (supplier confirms delivery) |
| `83` | Quantité en reliquat (backorder) |

### DTM+358

Date estimée de livraison du reliquat. Format `YYYYMMDD:102`. Conditionnel — uniquement si `estimatedDelivery` présent dans le payload.

### PIA+5+EAN:IB

`IB` = ISBN — qualificateur standard pour les livres en EDIFACT D96A.  
Cohérent avec le template ORDERS existant (`PIA+5+ean:IB'`).

### RFF+LI:N

Référence au numéro de ligne de la commande ORDERS originale. Permet au libraire de matcher chaque ligne de réponse avec sa ligne de commande sans ambiguïté (même quand plusieurs ISBN sont identiques ou que l'ordre change).

---

## UNT — comptage des segments

`UNT` compte tous les segments de `UNH` à `UNT` inclus (UNB et UNA exclus).

Implémentation : construire un tableau `seg` à partir de `UNH` (sans UNB), puis pousser `UNT+${seg.length + 1}+documentRef'` en dernier.

---

## Interfaces TypeScript

Aucune modification. `ORDRSPPayload` et `ORDRSPLine` couvrent déjà tous les champs nécessaires :

```typescript
interface ORDRSPLine {
  lineNumber: number        // → RFF+LI
  ean: string               // → LIN + PIA
  qtyRequested: number      // → QTY+21
  qtyConfirmed: number      // → QTY+1
  status: ORDRSPLineStatus  // → logique BGM + QTY+1=0 si REJECTED
  backorderQty?: number     // → QTY+83
  estimatedDelivery?: string // → DTM+358
  note?: string             // → FTX+ZZZ
}
```

---

## Fichiers concernés

| Fichier | Changement |
|---------|------------|
| `src/lib/ediUtils.ts` | Réécriture de la fonction `ORDRSP` dans `EDIFACT_TEMPLATES` |
| `src/pages/edi/__tests__/ediUtils.test.ts` | Mise à jour du test ORDRSP existant + nouveaux cas |

`mockEDIMessages.ts` et `EDIContext.tsx` : aucune modification nécessaire (payloads déjà conformes, MOCK_EDI_VERSION incrémenté à v8 en session courante).

---

## Exemple de message complet (PARTIAL)

```
UNA:+.? '
UNB+UNOC:3+DiffuseurGLN:14+ClientGLN:14+20260426:1433+ACK-0000007'
UNH+ACK-0000007+ORDRSP:D:96A:UN:EAN008'
BGM+231+ACK-0000007+4'
DTM+137:20260426:102'
RFF+ON:CMD0000007'
NAD+SE+DiffuseurGLN::9'
NAD+BY+ClientGLN::9'
LIN+1++9782070360024:EN'
PIA+5+9782070360024:IB'
RFF+LI:1'
QTY+21:5'
QTY+1:5'
LIN+2++9782075017346:EN'
PIA+5+9782075017346:IB'
RFF+LI:2'
QTY+21:3'
QTY+1:1'
QTY+83:2'
DTM+358:20260512:102'
FTX+ZZZ+++Rupture partielle — 2 ex. en réassort semaine 19'
UNS+S'
UNT+21+ACK-0000007'
UNZ+1+ACK-0000007'
```
