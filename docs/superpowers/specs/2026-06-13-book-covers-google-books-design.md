# Design — Couvertures réelles via Google Books API

**Date :** 2026-06-13  
**Scope :** `src/components/catalogue/BookCover.tsx`  
**Approche retenue :** Google Books en source principale (avec clé API), Open Library en fallback

---

## Contexte

Le composant `BookCover` existant utilise une chaîne Open Library → Google Books → placeholder SVG navy. En pratique, Open Library a une faible couverture pour les livres français, et Google Books sans clé API est limité à ~100 req/jour — résultat : tous les livres affichent le placeholder bleu.

Les livres viennent désormais de Supabase avec de vrais ISBN-13. Google Books a d'excellentes couvertures pour les livres français récents.

---

## Changements

### 1. Variable d'environnement

```
VITE_GOOGLE_BOOKS_API_KEY=...   (déjà ajoutée dans .env)
```

### 2. `fetchGoogleBooksCover` — ajout de la clé API

```typescript
const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&fields=items(volumeInfo/imageLinks)&maxResults=1${apiKey ? `&key=${apiKey}` : ''}`
```

### 3. Ordre des sources — Google Books en premier

État initial : `'googlebooks'` (au lieu de `'openlibrary'`)

Nouvelle chaîne :
```
googlebooks → openlibrary → failed
```

Le reset sur changement d'ISBN initialise aussi sur `'googlebooks'`.

### 4. Rendu

- Google Books : `fetchGoogleBooksCover(isbn)` via `useEffect`
- Open Library : `<img src="https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg" />` en fallback
- Placeholder SVG navy : affiché si `coverState === 'failed'` (inchangé)

---

## Ce qui ne change pas

- La logique de détection image 1×1 (naturalWidth < 10)
- Le cache module-level `coverCache` / `pendingFetches`
- Le placeholder SVG par univers
- Les props du composant
- Le comportement `fill` (FicheProduitPage)

---

## Fichiers concernés

| Fichier | Changement |
|---------|------------|
| `src/components/catalogue/BookCover.tsx` | Source principale → Google Books, clé API, état initial `'googlebooks'` |
| `.env` | `VITE_GOOGLE_BOOKS_API_KEY` (déjà fait) |
