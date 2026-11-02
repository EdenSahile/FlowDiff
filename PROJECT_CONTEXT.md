# Contexte projet

Ce fichier est le pont entre le Starter Kit générique et ce projet précis. Il ne contient aucune logique : c'est la liste des réponses dont les agents, skills, rules et hooks de ce kit ont besoin pour cesser d'être génériques et devenir ceux de CE projet.

Ne renseigne que ce qui est réellement utile à ce projet. Une ligne vide ou absente veut dire "ne s'applique pas ici" : un agent qui en a besoin le signale une fois plutôt que de deviner.

## Identité

- `PROJECT_NAME` : FlowDiff
- `OTHER_REPOS` :

## Stack

- `STACK` : Vite 5 + React 18 + TypeScript strict + styled-components v6 + React Router v6
- `FRONTEND` : React 18 + Vite 5
- `BACKEND` : aucun backend actif ; front statique uniquement
- `DATABASE` : aucune base active ; catalogue mock embarqué et données utilisateur en localStorage
- `AUTHENTICATION` : Mock JWT (bcrypt, localStorage)
- `AI_PROVIDER` : aucun fournisseur actif ; le chatbot Aidénia est mis de côté dans `parked/aidenia/` et hors build
- `DEPLOYMENT` : configuration Vercel statique présente ; aucun déploiement ou service serveur à supposer actif

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

- Démonstrateur B2B pour libraires d'un diffuseur-distributeur fictif (catalogue, commandes, top ventes, sélections)
- Theme/charte graphique : source de verite dans `src/lib/theme.ts`, jamais hardcoder les couleurs
- Panier et historique partages par `codeClient` (une librairie = un compte), persistent apres deconnexion
- Donnees isolees par `codeClient` (cles localStorage suffixees)
- Les titres à paraître sont commandables et leur type est conservé sur la ligne de commande.
- Le panier crée des commandes « Site FlowDiff » uniquement. La page EDI simule séparément des commandes externes et leurs messages ; aucune connexion Dilicom n'est active.
- Les couvertures sont des fichiers locaux dans `public/covers`. AS400/CRM, envoi d'email et paiement réel ne sont pas intégrés.
