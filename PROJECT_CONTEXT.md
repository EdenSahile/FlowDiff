# Contexte projet

Ce fichier est le pont entre le Starter Kit générique et ce projet précis. Il ne contient aucune logique : c'est la liste des réponses dont les agents, skills, rules et hooks de ce kit ont besoin pour cesser d'être génériques et devenir ceux de CE projet.

Ne renseigne que ce qui est réellement utile à ce projet. Une ligne vide ou absente veut dire "ne s'applique pas ici" : un agent qui en a besoin le signale une fois plutôt que de deviner.

## Identité

- `PROJECT_NAME` : FlowDiff
- `OTHER_REPOS` :

## Stack

- `STACK` : Vite 5 + React 18 + TypeScript strict + styled-components v6 + React Router v6
- `FRONTEND` : React 18 + Vite 5
- `BACKEND` : Serverless functions Vercel (Node.js)
- `DATABASE` : Supabase (tables livres, commandes, libraires) + mock data localStorage
- `AUTHENTICATION` : Mock JWT (bcrypt, localStorage)
- `AI_PROVIDER` : Anthropic (Claude, via API serverless /api/aidenia)
- `DEPLOYMENT` : Vercel

## Outillage

- `PACKAGE_MANAGER` : npm
- `LINT_COMMAND` : npm run lint
- `TYPECHECK_COMMAND` : npx tsc --noEmit
- `TEST_COMMAND` : npx vitest run
- `TEST_FRAMEWORK` : Vitest
- `E2E_FRAMEWORK` :
- `BASE_BRANCH` : main

## Suivi du travail (tickets)

- `TICKET_SOURCE` : aucun, tickets decrits en texte libre
- `TICKET_ID_PROPERTY` :
- `TICKET_STATUS_PROPERTY` :
- `TICKET_STATUS_VALUES` :
- `TICKET_BOARD_REF` :

## Architecture (facultatif)

- `ARCHITECTURE_DOC` :
- `API_CONTRACT_PATH` :

## Notes libres

- App B2B exclusive pour libraires (commandes de livres, nouveautes, fonds, top ventes, selections)
- Theme/charte graphique : source de verite dans `src/lib/theme.ts`, jamais hardcoder les couleurs
- Panier et historique partages par `codeClient` (une librairie = un compte), persistent apres deconnexion
- Donnees isolees par `codeClient` (cles localStorage suffixees)
- Les titres a paraitre ne sont PAS commandables via l'app
