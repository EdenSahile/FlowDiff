# Inventaire des tests -- LOT-01

## Informations

- **Lot** : LOT-01 -- Auth : login et gestion de session
- **Source** : `testing/audit-flowdiff.md`, `testing/lots-flowdiff.md`
- **Doctrine** : `docs/testing-strategy.md`
- **Nombre de regles** : 8

## Inventaire

### FLOW-RM-001 -- Login accepte code client OU email (insensible a la casse)

- **Ce qu'on verifie** : `findUser` normalise l'identifiant en minuscules et le compare au `codeClient` et a l'`email` de chaque utilisateur. Les 2 chemins (code client, email) doivent matcher.
- **Verdict** : 🟢
- **Justification** : code a nous. `findUser` est une fonction pure (trim, toLowerCase, comparaison). On controle la liste d'utilisateurs mock en entree, aucune dependance externe.
- **Tests existants** : 2 tests dans `AuthContext.test.tsx` (code client + email).

### FLOW-RM-002 -- Login valide mot de passe via bcrypt.compare

- **Ce qu'on verifie** : apres avoir trouve l'utilisateur, `login` appelle `bcrypt.compare(password, found.passwordHash)` et branche sur le resultat : match -> token + succes, pas match -> erreur.
- **Verdict** : 🟢
- **Justification** : code a nous. Le comportement sous test est le branchement de `login` selon le retour de `bcrypt.compare`, pas le comportement de bcrypt lui-meme. On mocke `bcrypt.compare` pour qu'il renvoie `true` ou `false` et on verifie que notre code reagit correctement.
- **Tests existants** : 1 test dans `AuthContext.test.tsx` (mot de passe incorrect).

### FLOW-RM-003 -- Login echoue si identifiant introuvable

- **Ce qu'on verifie** : si `findUser` renvoie `undefined`, `login` renvoie `{ success: false, error: 'Code client ou email introuvable.' }`.
- **Verdict** : 🟢
- **Justification** : code a nous. Branchement conditionnel apres un lookup sur une liste en memoire. Aucune dependance externe.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-004 -- Login valide les entrees avec Zod (loginSchema)

- **Ce qu'on verifie** : `loginSchema.safeParse(data)` rejette les inputs invalides, et `login` renvoie les erreurs de champ via `getZodErrors`.
- **Verdict** : 🟢
- **Justification** : code a nous. Le schema Zod est defini par nous, la transformation des erreurs (`getZodErrors`) aussi. On teste que notre code renvoie les bonnes erreurs pour des inputs invalides.
- **Tests existants** : 1 test dans `AuthContext.test.tsx` (payload vide).

### FLOW-RM-005 -- Token JWT mock expire apres 8h

- **Ce qu'on verifie** : `createMockToken` pose `exp: Date.now() + 8 * 60 * 60 * 1000` dans le payload. `parseMockToken` renvoie `null` si `exp < Date.now()`.
- **Verdict** : 🟢
- **Justification** : code a nous. Les 2 fonctions (`createMockToken`, `parseMockToken`) sont pures et n'ont aucune dependance externe. On peut controler `Date.now()` via `vi.useFakeTimers` pour verifier l'expiration.
- **Tests existants** : 1 test dans `AuthContext.test.tsx` (token expire nettoye).

### FLOW-RM-006 -- Restauration de session au montage si token valide

- **Ce qu'on verifie** : au montage, le `useEffect` lit le token dans `localStorage`, le parse avec `parseMockToken`, trouve l'utilisateur avec `findUser`, et appelle `setUser`.
- **Verdict** : 🟢
- **Justification** : code a nous. Toute la chaine (lecture localStorage -> parsing -> lookup -> setState) est notre logique. `localStorage` est fourni par jsdom dans l'environnement de test. Aucun comportement de dependance externe a verifier.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-007 -- Token malformed nettoye au montage

- **Ce qu'on verifie** : si `parseMockToken` renvoie `null` (token corrompu ou malformed), le `useEffect` supprime le token de `localStorage`.
- **Verdict** : 🟢
- **Justification** : code a nous. Meme raisonnement que FLOW-RM-006 : c'est un branchement conditionnel dans notre `useEffect`, `localStorage` est mockable dans jsdom.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-008 -- Token valide mais utilisateur introuvable : token nettoye

- **Ce qu'on verifie** : si `parseMockToken` reussit (token structurellement valide et non expire) mais que `findUser` ne trouve aucun utilisateur correspondant au `codeClient` du payload, le `useEffect` supprime le token de `localStorage`.
- **Verdict** : 🟢
- **Justification** : code a nous. Meme raisonnement que FLOW-RM-006 et 007 : branchement conditionnel dans notre code, dependances mockables.
- **Tests existants** : 1 test dans `AuthContext.test.tsx` (« nettoie le token si le codeClient du payload ne correspond à aucun utilisateur connu »).

## Resume

| Verdict | Nombre | Regles |
|---------|--------|--------|
| 🟢 | 8 | FLOW-RM-001, FLOW-RM-002, FLOW-RM-003, FLOW-RM-004, FLOW-RM-005, FLOW-RM-006, FLOW-RM-007, FLOW-RM-008 |
| 🟠 | 0 | -- |
| 🔴 | 0 | -- |

### Ce qui part en test unitaire automatise (-> `unit-test-writer`)

- FLOW-RM-001 : lookup par code client ou email, insensible a la casse
- FLOW-RM-002 : branchement sur le resultat de bcrypt.compare
- FLOW-RM-003 : identifiant introuvable -> erreur
- FLOW-RM-004 : validation Zod des inputs
- FLOW-RM-005 : expiration du token a 8h
- FLOW-RM-006 : restauration de session au montage
- FLOW-RM-007 : nettoyage d'un token malformed au montage
- FLOW-RM-008 : nettoyage du token quand l'utilisateur n'existe plus

### Couverture partielle (unitaire + smoke manuel)

Aucune regle dans cet etat.

### Verification manuelle uniquement (-> `smoke-test-writer`)

Aucune regle dans cet etat.

## Ambiguites et points de revision

Aucune ambiguite relevee dans l'audit pour ce lot. Les 8 regles portent sur du code a nous (fonctions pures, branchements conditionnels, schemas de validation) avec des dependances mockables (localStorage via jsdom, bcrypt.compare via mock).
