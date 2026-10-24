# CLAUDE.md

## ⚠️ RÈGLES ABSOLUES, À LIRE EN PREMIER

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

> Palette actuelle, source de vérité : `src/lib/theme.ts`

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

**Règle** : ne jamais hardcoder les couleurs dans les composants : toujours passer par `theme.colors.*`.

---

## Authentification

- Accès **réservé aux libraires uniquement**
- **Inscription** : code client + email professionnel + mot de passe + confirmation
- **Double vérification** : le code client existe-t-il ? + l'email correspond-il à la librairie ?
- **Connexion** : code client ou email + mot de passe + "mot de passe oublié"
- Une fois connecté : interface liée au compte interne (remise personnalisée, adresse de livraison) via AS400 / CRM

---

## Navigation principale

**Bottom bar (mobile) / barre latérale ou top nav (desktop)**, 5 sections :

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
- Commandables via l'app (comme les nouveautés et le fonds)
- Tri par univers puis par programme (tranches 2-4 mois)
- Bouton "Recevoir le catalogue" par email

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

- Les **3 types de titres (fonds, nouveautés, à paraître) sont commandables** directement via l'app
- Les remises sont **personnalisées par librairie** et s'appliquent automatiquement selon la thématique
- Le **numérique a son propre taux de remise**, unique quel que soit l'univers (`REMISE_NUMERIQUE`, `CartContext.tsx`). Sur le papier le taux varie par univers parce qu'il rémunère le stock acheté ferme, les invendus et la mise en place. Rien de tout cela n'existe sur un fichier.
- **Aucun prix ne se calcule.** Le prix d'un livre est fixé par l'éditeur et opposable à tous : loi du 10 août 1981 pour le papier, loi du 26 mai 2011 pour le numérique. Tout prix affiché vient des données. Seule exception admise : la conversion TTC vers HT par le taux de TVA, qui est une opération fiscale, pas un prix.
- L'app est **B2B exclusif** : aucun accès grand public

---

## Décrire une édition, les 4 champs à ne jamais oublier

Quand un titre entre au catalogue (`src/data/mockBooks.ts`), il déclare **4 informations qui ne se déduisent de rien**. Un titre qui les oublie ne casse rien, il devient simplement invisible aux filtres et muet sur sa fiche. TypeScript ne peut pas le signaler, ces champs étant facultatifs : ce sont les tests de `src/data/__tests__/ebookOffers.test.ts` qui montent la garde.

| Champ | Ce qu'il dit | Valeurs |
|---|---|---|
| `reliure` | comment le livre est **fabriqué**, le `ProductForm` de la norme ONIX | `broche`, `relie` |
| `categorie` | le **moment commercial**, laissé vide pour un manga au format tankobon, qui n'est ni l'un ni l'autre | `poche`, `grand format` |
| `format` | les **dimensions**, pour l'affichage seul | `'155 x 235 mm'` |
| `workId` | l'**œuvre**, partagée par ses éditions papier | `'w-mathieu-enfants'` |

Les 2 premiers sont des **axes distincts que le métier ne confond pas**, et les fiches des libraires les présentent séparément, « Support principal » d'un côté, « Infos supplémentaires » de l'autre. Un roman français est presque toujours grand format **et** broché, les 2 à la fois. Le poche n'est pas une taille mais une catégorie portée par une collection : Babel, Folio, Le Livre de Poche, J'ai lu.

Deux règles qui en découlent :

- **Un format de fichier numérique** (`EBOOK_FORMATS`) se déclare dans la liste, et chaque format disponible séparément reçoit **son propre ISBN**, règle posée par ISBN International. Il n'existe pas d'offre « PDF+EPUB » sous un numéro unique.
- **Une édition épuisée remplacée** par une autre porte `replacedById`. Le lien inverse ne se stocke pas, il se déduit en parcourant le catalogue.

---

## Stack technique

> **Stratégie** : **démo front sur données mock, sans backend.** Vite 5 + React 18, stack définitive. Pas de migration Next.js prévue. Le projet ne gagne pas de fonctionnalités, il se maintient au propre.

| Couche | Stack |
|--------|-------|
| Framework | **Vite 5 + React 18** |
| Routing | **React Router v6** |
| Langage | **TypeScript** (strict) |
| Style | **Styled-components v6** |
| Auth | **Mock JWT** (localStorage, bcrypt cost 12) |
| Données | **Fichiers mock** dans `src/data/`, en mémoire, aucun appel réseau |
| Persistance | **localStorage**, isolé par `codeClient` |
| Base de données | **aucune.** Prisma reste installé, son schéma n'est branché sur rien |
| API serveur | **aucune.** Pas de dossier `api/`, rien à déployer côté serveur |
| Validation | **Zod** (tous les inputs) |
| Tests | **Vitest** (jsdom) |
| Déploiement | **Vercel**, https://flowdiff-demo-app.vercel.app |

### Il n'y a pas de backend

**Aucune base de données, aucune fonction serverless, aucun endpoint.** L'application est un front statique pur : tout ce qu'elle affiche vient de fichiers embarqués dans le bundle, et tout ce qu'elle retient vit dans le `localStorage` du navigateur.

C'est la propriété la plus importante du projet, et la source des erreurs passées quand elle n'était pas écrite ici.

Supabase a été câblé le 16 mai 2026, puis le projet a été supprimé côté Supabase : le plan gratuit met en pause après 7 jours d'inactivité, puis supprime au bout de 90 jours. Tout a été retiré du repo depuis.

- **Catalogue** : `src/services/books.ts` lit `MOCK_BOOKS`. Chemin unique, aucun appel réseau, aucun repli.
- **Panier, commandes, comptes** : `localStorage`.
- **Couvertures** : fichiers servis depuis `public/covers/{isbn}.jpg`. 40 titres sur 44 en ont une, les 4 autres affichent le placeholder dessiné.

### Code conservé mais hors du build

Deux ensembles existent dans le repo sans être compilés ni atteignables. Ne pas les rebrancher sans décision explicite.

| Quoi | Où | Pourquoi |
|---|---|---|
| Back-office `/admin/*` | `src/admin/`, non routé | dépendait d'un backend. Ses services échouent si on les appelle, et ses identifiants ont été retirés de la source |
| Chatbot Aidénia | `parked/aidenia/` | sa recherche de livres passait par Supabase. Voir son README pour le réveiller |
| Formulaire d'avis | `parked/feedback/` | dernier endpoint public, envoi d'email sans limite de débit. Voir son README, qui liste les 4 points à corriger avant tout redéploiement |

---

## Sécurité, règles non négociables

- **Jamais d'identifiant ni de secret dans `src/`.** Tout ce qui est importé par l'app finit en clair dans le bundle, qui est public. Vaut aussi pour un `defaultValue` de formulaire et pour les variables `VITE_*`, inlinées à la compilation.
- **Un contrôle d'accès fait dans le navigateur ne protège rien.** Il cache un écran, il ne garde pas une donnée : l'endpoint reste appelable directement. Toute vraie protection se fait côté serveur.
- Mots de passe hashés avec **bcrypt** (cost factor 12 en prod, 4 en dev pour performance)
- Mock JWT avec expiration 8h, token en localStorage, acceptable pour un projet de démonstration
- Toute donnée entrante validée avec **Zod** avant traitement
- **Un compte par librairie** : le panier et l'historique sont partagés entre tous les utilisateurs d'un même `codeClient` et persistent après déconnexion
- Les données sont isolées par `codeClient`, via des clés localStorage suffixées, donc deux librairies ne se voient pas
- Variables d'environnement dans `.env`, jamais dans le code, `.env` dans `.gitignore`
- **Prisma** exclusivement si une base est un jour branchée, jamais de SQL brut avec interpolations

---

## Phases de développement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Setup projet + structure + `.env` + Prisma schema | ✅ Fait |
| 1bis | **Migration React/Vite** : remplacement Next.js par Vite + React Router | ✅ Fait |
| 2 | Layout global (nav bottom mobile / sidebar desktop) + design system | ✅ Fait |
| 3 | Authentification mock (inscription + connexion + mot de passe oublié) | ✅ Fait |
| 4 | Accueil (recherche) | ✅ Fait |
| 5 | Catalogue Fonds + Nouveautés (liste, filtres, fiche produit) | ✅ Fait |
| 6 | Panier + commande | ✅ Fait |
| 7 | Flash Infos | ✅ Fait |
| 8 | Menu Burger + Mon compte + Historique | ✅ Fait |
| 9 | ~~Scanner caméra (lecture code-barres réelle)~~, **supprimé** | 🚫 Annulé |
| 10 | ~~PWA avec vite-plugin-pwa (manifest, service worker, icônes)~~, **annulé** | 🚫 Annulé |
| 11 | Tests + recette fonctionnelle | ✅ Fait (Vitest) |
| 12 | ~~Migration Next.js 14~~, **annulé**, le projet reste sur Vite | 🚫 Annulé |
| 13 | Déploiement Vercel | ✅ Fait (https://flowdiff-omega.vercel.app) |


---

## Sous-agents, règle obligatoire

Les sous-agents démarrent à froid : ils ne lisent pas CLAUDE.md, ni CONTEXT.md, ni les hooks.
Ils ne savent **que** ce qui est dans leur `prompt`.

### Ce que le prompt de chaque sous-agent doit toujours contenir

1. **Stack technique** : Vite 5 + React 18 + TypeScript strict + styled-components v6 + React Router v6
2. **Règles de style** : jamais hardcoder les couleurs, toujours `theme.colors.*` via `src/lib/theme.ts`
3. **Règles de travail** : cocher `[x]` dans CONTEXT.md dès qu'une tâche est terminée, s'arrêter et remonter le résultat
4. **Section "Session en cours"** de CONTEXT.md : tâches et statut actuel
5. **Sa mission précise** : fichiers concernés, chemins exacts, ce qu'il doit faire et ne pas faire
6. **Contraintes spécifiques** à sa tâche (ex: ne pas toucher au design, TS doit rester clean)

### Règle
Ne jamais spawner un sous-agent avec un prompt vague. Un sous-agent mal briefé produit du code incorrect ou casse ce qui existe.

---

## Skills actifs, invocation automatique

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