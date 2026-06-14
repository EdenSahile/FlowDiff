# Aidénia — Documentation technique RAG

## Vue d'ensemble

Aidénia utilise une architecture RAG (Retrieval-Augmented Generation) pour répondre aux questions à partir de documents FlowDiff (CGV, FAQ, catalogue PDF). Le pipeline combine trois services :

- **Notre code** (`scripts/ingest.py`) — découpage (chunking) des documents en morceaux de 500 mots
- **OpenAI** (`text-embedding-3-small`) — vectorisation (transformation texte → vecteur numérique) des chunks et des questions
- **Pinecone** — stockage et recherche vectorielle
- **Anthropic Claude** (`claude-sonnet-4-6`) — génération de la réponse finale

---

## Architecture du pipeline

```
Document PDF
  → pdfplumber (extraction texte)
  → chunk_text() 500 mots / chevauchement 50 mots
  → OpenAI embeddings (1536 dimensions)
  → Pinecone upsert (vecteur + métadonnées)

Question libraire
  → classify() → 'rag'
  → OpenAI embed la question
  → Pinecone query top_k=3
  → 3 chunks les plus proches récupérés
  → Injectés dans le prompt Claude
  → Réponse générée en français
```

---

## Pipeline RAG production — avec outils spécialisés

Ce que nous avons implémenté est une version minimale et manuelle. En production, chaque étape est prise en charge par des outils dédiés qui gèrent les cas complexes (PDF multi-colonnes, tableaux, images scannées, etc.).

### Vue complète d'un pipeline RAG professionnel

```
INGESTION (offline — fait une fois par document)
─────────────────────────────────────────────────────────
Source (PDF, URL, Word, HTML, base de données...)
  │
  ▼
[1. CHARGEMENT]
  Outil : LangChain Loaders / LlamaIndex Readers / Unstructured.io
  Rôle  : lire le document source et en extraire le texte brut,
           en préservant la structure (titres, tableaux, listes)
  │
  ▼
[2. NETTOYAGE]
  Outil : Unstructured.io / code custom
  Rôle  : supprimer les en-têtes/pieds de page répétés, les artefacts
           d'encodage, normaliser les espaces et caractères spéciaux
  │
  ▼
[3. CHUNKING]
  Outil : LangChain RecursiveCharacterTextSplitter / LlamaIndex SentenceSplitter
  Rôle  : découper intelligemment — d'abord par paragraphes, puis par
           phrases, puis par mots (stratégie récursive). Respecte la
           sémantique du texte mieux qu'un simple split par mots.
  Params : chunk_size=500 tokens, chunk_overlap=50 tokens
  │
  ▼
[4. ENRICHISSEMENT DES MÉTADONNÉES]
  Outil : code custom / LlamaIndex Metadata Extractors
  Rôle  : ajouter source, numéro de page, titre de section, date,
           auteur — permettra de filtrer et citer les sources précisément
  │
  ▼
[5. VECTORISATION (EMBEDDING)]
  Outil : OpenAI text-embedding-3-small ou text-embedding-3-large
  Rôle  : transformer chaque chunk en vecteur de 1536 ou 3072 dimensions
           qui représente le sens sémantique du texte
  │
  ▼
[6. STOCKAGE]
  Outil : Pinecone / Weaviate / Qdrant / pgvector (Supabase)
  Rôle  : stocker les vecteurs + métadonnées + texte original
           pour pouvoir les retrouver par similarité
  │
  ▼
[Index vectoriel prêt]


QUERY (en temps réel — à chaque question du libraire)
─────────────────────────────────────────────────────────
Question utilisateur
  │
  ▼
[7. VECTORISATION DE LA QUESTION]
  Outil : OpenAI (même modèle que pour les chunks — obligatoire)
  Rôle  : transformer la question en vecteur dans le même espace
           sémantique que les chunks indexés
  │
  ▼
[8. RECHERCHE VECTORIELLE]
  Outil : Pinecone query / Supabase pgvector
  Rôle  : calculer la similarité cosinus entre le vecteur de la question
           et tous les vecteurs stockés, retourner les top_k plus proches
  Params : top_k=3 à 5 selon la complexité des questions
  │
  ▼
[9. RERANKING (optionnel mais recommandé)]
  Outil : Cohere Rerank / Colbert / BGE-Reranker
  Rôle  : réordonner les chunks récupérés avec un second modèle plus
           précis — la recherche vectorielle est rapide mais imprécise,
           le reranking affine la pertinence avant injection dans Claude
  │
  ▼
[10. CONSTRUCTION DU PROMPT]
  Outil : LangChain PromptTemplate / code custom
  Rôle  : injecter les chunks + la question dans un prompt structuré
           avec instructions système, citations de source, garde-fous
  │
  ▼
[11. GÉNÉRATION]
  Outil : Claude claude-sonnet-4-6 / GPT-4o / Gemini...
  Rôle  : générer une réponse en langage naturel en s'appuyant
           UNIQUEMENT sur le contexte fourni (pas d'hallucination)
  │
  ▼
Réponse finale avec sources citées
```

### Ce qu'on a implémenté vs pipeline complet

| Étape | Pipeline complet | Notre implémentation |
|---|---|---|
| Chargement | LangChain/Unstructured | `pdfplumber` (texte brut uniquement) |
| Nettoyage | Unstructured.io | aucun |
| Chunking | RecursiveCharacterTextSplitter | `split()` par mots (basique) |
| Métadonnées | source + page + section + date | source + page uniquement |
| Embedding | text-embedding-3-small | text-embedding-3-small ✅ |
| Stockage | Pinecone | Pinecone ✅ |
| Reranking | Cohere Rerank | aucun |
| Prompt | LangChain template | prompt manuel ✅ |
| Génération | Claude | Claude ✅ |

**Conclusion :** notre implémentation couvre les étapes essentielles et fonctionne pour des PDFs simples (texte linéaire). Elle sera insuffisante pour des documents complexes (tableaux, colonnes multiples, PDF scannés) ou un volume élevé de documents.

---

## Prérequis

### Comptes et clés API

| Service | Coût | Où créer |
|---|---|---|
| OpenAI | ~0 $ en démo (0,02 $/million tokens) | platform.openai.com → API Keys |
| Pinecone | Gratuit (plan Starter : 1 index, 100k vecteurs) | app.pinecone.io → API Keys |
| Anthropic | Clé existante réutilisable ou nouvelle par projet | console.anthropic.com → API Keys |

> **Bonne pratique** : créer une clé Anthropic par projet pour isoler la consommation et pouvoir révoquer sans impact sur les autres apps.

### Variables d'environnement (`.env`)

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
# PINECONE_INDEX=flowdiff-docs  ← optionnel, "flowdiff-docs" est la valeur par défaut dans le code
```

### Dépendances Python (ingestion)

```bash
pip install pdfplumber openai pinecone python-dotenv
```

> ⚠️ Le package s'appelle `pinecone` (pas `pinecone-client` qui est déprécié).

### Dépendances Node.js (API)

```bash
npm install openai @pinecone-database/pinecone
```

---

## Procédure d'ingestion d'un document

### 1. Créer l'index Pinecone (une seule fois)

```bash
python scripts/setup_pinecone.py
```

Crée l'index `flowdiff-docs` (dimension 1536, metric cosine). Idempotent — ne fait rien si l'index existe déjà.

### 2. Déposer le PDF

Placer le fichier dans `public/docs/` :

```
public/
  docs/
    cgv_flowdiff.pdf
    faq.pdf
    ...
```

### 3. Lancer l'ingestion

```bash
python scripts/ingest.py --file public/docs/cgv_flowdiff.pdf --source "CGV FlowDiff"
```

Sortie attendue :
```
📄 Lecture de cgv_flowdiff.pdf…
   3 pages extraites
   3 chunks créés
🔢 Vectorisation avec OpenAI…
📌 Connexion à Pinecone…
🚀 Upsert dans 'flowdiff-docs'…
  Upsert lot 1 (3 vecteurs)
✅ Ingestion terminée — 3 chunks depuis 'CGV FlowDiff'
```

### 4. Ingestion depuis une URL

```bash
python scripts/ingest_url.py --url https://example.com/faq --source "FAQ FlowDiff"
```

---

## Lancer l'environnement de développement local

`vercel dev` est instable en local pour ce projet (voir section Problèmes). La solution retenue est deux serveurs parallèles :

**Terminal 1 — Serveur API local (port 4000) :**
```bash
npx tsx --env-file=.env scripts/local-api-server.ts
```

**Terminal 2 — Frontend Vite (port 5173) :**
```bash
npm run dev
```

Accéder à l'app sur **http://localhost:5173** — Vite proxifie automatiquement `/api/*` vers le port 4000 (configuré dans `vite.config.ts`).

---

## Classificateur de questions

`api/aidenia.ts` classe chaque question pour décider quelle source interroger :

| Type | Mots-clés déclencheurs | Source |
|---|---|---|
| `livres` | livre, disponible, catalogue, isbn, titre, auteur, manga, bd, roman... | Supabase table `livres` |
| `commandes` | commande, facture, panier, statut, historique, paiement... | Mock local (Supabase à venir) |
| `rag` | Tout le reste | Pinecone → fallback base statique |

> Le type `rag` est le **défaut** — tout ce qui n'est pas clairement livres ou commandes passe par Pinecone.

---

## Problèmes rencontrés et solutions

### 1. Package Pinecone déprécié

**Problème :** `pip install pinecone-client` installe une version qui lève une exception au démarrage :
```
Exception: The official Pinecone python package has been renamed from
`pinecone-client` to `pinecone`.
```

**Solution :**
```bash
pip uninstall pinecone-client
pip install pinecone
```

---

### 2. `vercel dev` instable en local

**Problème :** `vercel dev` sur ce projet Vite causait soit une page blanche, soit une connexion qui tournait dans le vide. Causes identifiées :
- Le `outputDirectory: "dist"` dans `vercel.json` pointait sur le build prod absent en dev
- Conflits de ports (3000 puis 3001 déjà occupés)
- Le `devCommand` se liait au port 5173 mais Vite prenait 5174 quand 5173 était occupé

**Solution retenue :** remplacer `vercel dev` par deux serveurs indépendants :
1. `scripts/local-api-server.ts` — mini serveur HTTP qui importe et exécute les handlers Vercel
2. Proxy Vite dans `vite.config.ts` : `/api/*` → `http://localhost:4000`

---

### 3. Variables d'environnement non chargées dans le serveur local

**Problème :** le serveur API local (`local-api-server.ts`) ne chargeait pas le `.env` correctement — `process.loadEnvFile` n'existe que depuis Node 20.6, et le fallback manuel ne se déclenchait pas si `ANTHROPIC_API_KEY` était déjà dans l'environnement système.

Résultat : les clés `OPENAI_API_KEY` et `PINECONE_API_KEY` étaient `undefined` → fallback sur la base statique silencieux.

**Solution :**
```bash
npx tsx --env-file=.env scripts/local-api-server.ts
```

Le flag `--env-file` de Node.js charge le `.env` avant l'exécution du script, indépendamment de la version de Node.

---

### 4. Classificateur trop restrictif → RAG non déclenché

**Problème :** la question "quelle est votre adresse ?" était classifiée `static` (aucun mot-clé RAG correspondant), alors que l'adresse est dans les CGV indexées dans Pinecone. Aidénia répondait "je n'ai pas cette information".

**Solution :** rendre `rag` le type par défaut — tout ce qui n'est pas explicitement livres ou commandes passe par Pinecone :

```typescript
// Avant
if (/cgv|condition|retour|délai|remise|politique|tarif|règle/.test(m)) return 'rag'
return 'static'

// Après
return 'rag' // Pinecone par défaut, fallback base statique si vide
```

---

## Structure des fichiers

```
api/
  aidenia.ts              ← Route serverless principale
scripts/
  ingest.py               ← Ingestion PDF → Pinecone
  ingest_url.py           ← Ingestion URL → Pinecone
  setup_pinecone.py       ← Création de l'index
  local-api-server.ts     ← Serveur local pour dev (remplace vercel dev)
public/
  docs/                   ← PDFs à ingérer (non commités)
  assets/
    aidenia-avatar.png
src/
  aidenia.config.ts       ← Config white-label (couleurs, nom client)
  data/
    aidenia-knowledge.json ← Base statique (horaires, contact, remises)
  components/
    AideniaChat/
      AideniaChat.tsx
      AideniaChat.styles.ts
      useAidenia.ts
```
