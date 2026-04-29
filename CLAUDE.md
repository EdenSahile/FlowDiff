# CLAUDE.md

## ⚠️ RÈGLES ABSOLUES — LIRE EN PREMIER

### Démarrage de session
- Lire CONTEXT.md immédiatement
- Confirmer : "✅ CONTEXT.md lu — je reprends à [Task X]"
- Ne pas attendre d'autres instructions pour continuer

### Quand l'utilisateur dit "continue"
- Lire CONTEXT.md
- Reprendre exactement là où on s'est arrêtés
- Confirmer ce qu'on va faire avant de coder

---

## Règles de travail en session

### Avant tout code
1. Lister les tâches avec `- [ ]` dans CONTEXT.md **avant** de commencer
2. Ne pas écrire une seule ligne de code avant que CONTEXT.md soit mis à jour

### Pendant le/ travail
3. Cocher `- [x]` dès qu'une tâche est terminée (TS clean)
4. S'arrêter après chaque tâche et demander validation avant de passer à la suivante
5. Ne jamais committer sans validation

### Fin de session ou feature terminée
6. Quand toutes les tâches sont [x] et que l'utilisateur le demande :
   - Vider la section "Session en cours"
   - Mettre à jour "État du build"
   - Laisser "Prochaines étapes" vide
   - Ne jamais ajouter de blocs datés dans CLAUDE.md

---

## Gestion des fichiers

- **CLAUDE.md** : contexte projet permanent + phases + décisions 
  techniques durables. Ne contient jamais de blocs session datés.
- **CONTEXT.md** : état vivant. Réécrit par Claude en fin de session 
  ou sur demande. Contient uniquement ce qui est en cours ou à faire.
- Les décisions techniques importantes prises en session → absorbées 
  dans CLAUDE.md, pas conservées sous forme de log.

---


## Contexte du projet

Application B2B **FlowDiff** à destination exclusive des **libraires**, permettant de passer des commandes de livres sur : 
- les titres de fonds déjà parus
- les nouveautés
- les titres à paraître
- Sur les meiilleurs ventes
- Sur des sélections et OP commerciales
  
L'app permet également :
- de voir les flash infos sur les titres, l'app, les auteurs etc..
- de passer des commandes via le site ou via Dilicom (EDI)
- de créer des listes de titres 
- de voir l'historique des commande
- de contacter son représentant ou service commercial
- de voir un dashboard sur la page d'accueil avec plusieurs statistiques

**Cible** : application **desktop** (interface large) ET **mobile responsive** (téléphone).
**Design source** : `/Users/macbookeden/Documents/Projets-code/ux-design-application-libraires.pdf`

---

## Charte graphique

> Palette actuelle — source de vérité : `src/lib/theme.ts` - 

| Rôle | Token | Valeur | Usage |
|------|-------|--------|-------|
| Bleu foncé principal | `primary` / `navy` | `#232f3e` | Fond header, sidebar, CTA primaires, texte titres |
| Bleu hover | `primaryHover` | `#42556c` | Hover CTA primaires |
| Or / accent | `accent` | `#C9A84C` | Liens actifs sidebar, badges "nouveauté", accents |
| Or clair | `accentLight` | `#F7F0DC` | Fonds or très clair |
| Vert pâle | `primaryLight` / `navyLight` | `#E6EFE9` | Surfaces alternées, fond badges |
| Lin (fond page) | `gray.50` | `#F4F4F0` | Fond général de l'application |
| Gris surface | `gray.100` | `#EAEAE6` | Zones neutres |
| Gris bordure | `gray.200` | `#D8D8D4` | Bordures, séparateurs |
| Gris texte 3 | `gray.400` | `#6B6B68` | Placeholders, texte tertiaire (WCAG AA sur blanc) |
| Gris texte 2 | `gray.600` | `#555550` | Texte secondaire |
| Gris texte 1 | `gray.800` | `#111111` | Texte principal |
| Erreur | `error` | `#C0392B` | Messages d'erreur, actions destructrices |
| Blanc | `white` | `#FFFFFF` | Surfaces cards, fond inputs |

**Règle** : ne jamais hardcoder les couleurs dans les composants — toujours passer par `theme.colors.*`.

---

## Authentification

- Accès **réservé aux libraires uniquement**
- **Inscription** : code client + email professionnel + mot de passe + confirmation
- **Double vérification** : le code client existe-t-il ? + l'email correspond-il à la librairie ?
- **Connexion** : code client ou email + mot de passe + "mot de passe oublié"
- Une fois connecté : interface liée au compte interne (remise personnalisée, adresse de livraison) via AS400 / CRM

---

## Navigation principale

**Bottom bar (mobile) / barre latérale ou top nav (desktop)** — 5 sections :

| Onglet | Contenu |
|--------|---------|
| Accueil | recherche + raccourcis + Nouveautés |
| Nouveautés | Titres du mois + À paraître |
| Fonds | Titres déjà parus, commandables |
| Top Ventes | Meilleures ventes par thématique |
| Sélections | Sélections éditoriales thématiques |

En permanence : **Panier** (droite, avec badge quantité) +  à gauche du panier, la **Barre de recherche** et **recherche Avancée**

---

## Écrans et fonctionnalités

### Accueil
- Raccourcis page
- Nouveautés


### Nouveautés
- Sous-onglets : **Nouveautés du mois** / **À paraître**
- Tri par univers : BD/Mangas, Jeunesse, Littérature, Adulte-pratique
- Pages intérieures : carrousel de visuels + bouton "Recevoir par email"
- Bande annonce : lecteur vidéo intégré

### À paraître (sous Nouveautés)
- **Consultation catalogue uniquement — aucune commande possible**
- Tri par univers puis par programme (tranches 2-4 mois)
- Bouton "Recevoir le catalogue" par email
- Commande uniquement via représentant commercial

### Fonds
- Titres déjà parus, commandables directement
- Recherche + filtre par thématique (Adulte-pratique, BD/Mangas/Comics, Jeunesse, Littérature)

### Top Ventes
- Classement par thématique avec badges TOP 1, TOP 2…

### Sélections
- Sélections "Nos héros" (vignettes couverture par série)
- Thématiques saisonnières : Saint-Valentin, fêtes des mères, rentrée…
- Indicateur "Offre spéciale" (point vert)
- Tri par univers

### Flash Infos
- Classées par univers : BD/Mangas, Jeunesse, Littérature, Pratique
- Catégories : Auteurs, Fonds, Nouveautés, BookFlow
- Contenu : vidéo ou image + texte + lien + possibilité d'ajouter au panier directement

### Panier
- Code client affiché automatiquement
- Récap en haut : Montant HT, Remise (%), Net HT, TVA 5,5%, Total TTC, nb articles
- Date de livraison : délai habituel (1-3 jours) ou date spécifique
- Remises appliquées automatiquement par thématique (liaison AS400/CRM)
- Modification quantité / suppression avant validation
- Après validation : résumé de commande → bouton "Confirmer" pour envoi

### Menu Burger
- Photo + nom librairie en en-tête
- Mon compte | Mon historique | Contact | Inscription Newsletter | Paramètres | Aide | CGV | Se déconnecter
- **Mon historique** : liste des commandes passées + duplication en 1 clic
- **Contact** : envoi email vers représentant ou service clients
- **Paramètres** : préférences notifications par univers
- **Aide** : lien vers onboarding
- Réseaux sociaux en pied : Site web, Facebook, Instagram, YouTube

---

## Règles métier importantes

- Les **titres à paraître ne sont PAS commandables** via l'app — consultation catalogue uniquement
- Les **titres de fonds et nouveautés du mois sont commandables** directement
- Les remises sont **personnalisées par librairie** et s'appliquent automatiquement selon la thématique
- L'app est **B2B exclusif** : aucun accès grand public

---

## Stack technique

> **Stratégie** : **Vite 5 + React 18** — stack définitif pour le projet test Vercel. Pas de migration Next.js prévue. L'application reste en SPA avec mock auth et données locales.

| Couche | Stack |
|--------|-------|
| Framework | **Vite 5 + React 18** |
| Routing | **React Router v6** |
| Langage | **TypeScript** (strict) |
| Style | **Styled-components v6** |
| Auth | **Mock JWT** (localStorage, bcrypt cost 12) |
| BDD | **Prisma ORM** installé (non branché — données mock) |
| Validation | **Zod** (tous les inputs) |
| Tests | **Vitest** (jsdom) |
| Déploiement | **Vercel** (build Vite, projet test) |
---

## Sécurité — règles non négociables

- Mots de passe hashés avec **bcrypt** (cost factor 12 en prod, 4 en dev pour performance)
- Mock JWT avec expiration 8h — token en localStorage (acceptable pour projet test)
- Toute donnée entrante validée avec **Zod** avant traitement
- **Un compte par librairie** — le panier et l'historique sont partagés entre tous les utilisateurs d'un même `codeClient` et persistent après déconnexion
- Les données sont isolées par `codeClient` (clés localStorage suffixées) — deux librairies différentes ne se voient pas
- Variables d'environnement dans `.env` — jamais dans le code, `.env` dans `.gitignore`
- **Prisma** exclusivement si BDD branchée — jamais de SQL brut avec interpolations

---

## Phases de développement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Setup projet + structure + `.env` + Prisma schema | ✅ Fait |
| 1bis | **Migration React/Vite** — remplacement Next.js par Vite + React Router | ✅ Fait |
| 2 | Layout global (nav bottom mobile / sidebar desktop) + design system | ✅ Fait |
| 3 | Authentification mock (inscription + connexion + mot de passe oublié) | ✅ Fait |
| 4 | Accueil (recherche) | ✅ Fait |
| 5 | Catalogue Fonds + Nouveautés (liste, filtres, fiche produit) | ✅ Fait |
| 6 | Panier + commande | ✅ Fait |
| 7 | Flash Infos | ✅ Fait |
| 8 | Menu Burger + Mon compte + Historique | ✅ Fait |
| 9 | ~~Scanner caméra (lecture code-barres réelle)~~ — **supprimé** | 🚫 Annulé |
| 10 | ~~PWA — vite-plugin-pwa (manifest + service worker + icônes)~~ — **annulé** | 🚫 Annulé |
| 11 | Tests + recette fonctionnelle | ✅ Fait (Vitest — computeTotals + isOrderable) |
| 12 | ~~Migration Next.js 14~~ — **annulé**, projet reste sur Vite (test Vercel) | 🚫 Annulé |
| 13 | ~~Recette finale + déploiement Vercel~~ — **annulé** | 🚫 Annulé |


---

## Skills actifs — invocation automatique

Les skills suivants sont installés via les plugins `superpowers` et `code-review`.
Claude doit les invoquer automatiquement selon le contexte, sans attendre une demande explicite.

### Quand invoquer quoi

| Contexte | Skill à invoquer |
|----------|-----------------|
| Début d'une nouvelle phase ou feature | `/test-driven-development` |
| Avant de déclarer une tâche terminée | `/verification-before-completion` |
| Avant un commit ou une PR | `/requesting-code-review` |
| Bug détecté ou comportement inattendu | `/systematic-debugging` |
| Plan d'implémentation d'une phase | `/writing-plans` |
| Fin d'une phase de développement | `/finishing-a-development-branch` |

### Règle générale
Ne jamais marquer une phase comme ✅ dans le tableau des phases sans avoir exécuté
`/verification-before-completion` au préalable.