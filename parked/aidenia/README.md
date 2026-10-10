# Aidénia, chantier reporté

Le chatbot Aidénia est **retiré de la démo en ligne**. Son code est conservé ici pour une reprise ultérieure. Rien dans ce dossier n'est compilé, routé, déployé ni appelable en production.

## Pourquoi il a été parqué

Sa branche « questions sur les livres » interrogeait Supabase. Le projet Supabase ayant été supprimé et la dépendance `@supabase/supabase-js` retirée du repo, cette partie ne pouvait plus fonctionner. Plutôt que de la réécrire pendant un chantier de nettoyage, le chatbot entier est mis de côté.

## Ce que contient ce dossier

L'arborescence reproduit les emplacements d'origine, pour qu'une remise en service soit un simple déplacement inverse.

| Ici | Emplacement d'origine |
|---|---|
| `api/aidenia.ts` | `api/aidenia.ts` |
| `src/aidenia.config.ts` | `src/aidenia.config.ts` |
| `src/AideniaChat/` | `src/components/AideniaChat/` |
| `scripts/local-api-server.ts` | `scripts/local-api-server.ts` |
| `scripts/ingest.py`, `ingest_url.py`, `setup_pinecone.py` | `scripts/` |
| `docs/aidenia-rag-setup.md` | `docs/aidenia-rag-setup.md` |

`api/aidenia.ts` a été sorti du dossier `api/` parce que Vercel déploie automatiquement tout fichier qui s'y trouve.

## Pour le remettre en service

1. Replacer les fichiers à leurs emplacements d'origine.
2. Réinstaller les dépendances, toutes désinstallées avec le parcage :

   ```
   npm install @anthropic-ai/sdk openai @pinecone-database/pinecone
   npm install -D @vercel/node
   ```

   Ce sont celles qu'importe `api/aidenia.ts`. Il importait aussi `@supabase/supabase-js`, à ne **pas** réinstaller : l'étape 4 ci-dessous consiste précisément à s'en passer.

   Les scripts Python ont leurs propres dépendances, installées avec `pip` et sans rapport avec npm : `pinecone`, `openai`, `python-dotenv`.

3. Remonter `<AideniaChat />` dans `src/components/layout/AppLayout.tsx`.
4. Rétablir le script npm `dev:api` : `tsx --env-file=.env --watch scripts/local-api-server.ts`.
5. Réécrire la branche `type === 'livres'` de `api/aidenia.ts`, qui lit encore Supabase, pour qu'elle lise `src/data/mockBooks` ou la source de données du moment.
6. Redéclarer les variables d'environnement listées ci-dessous.

## Variables d'environnement

Utilisées uniquement par ce code, donc retirables de Vercel tant qu'il est parqué :

- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `ANTHROPIC_API_KEY`

Les scripts Python en ont besoin pour tourner en local : les garder dans `.env`.

Aucune clé n'est écrite en dur dans ce code, vérifié au moment du parcage.
