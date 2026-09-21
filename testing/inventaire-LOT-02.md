# Inventaire des tests -- LOT-02

## Informations

- **Lot** : LOT-02 -- Auth : inscription et schemas de validation
- **Source** : `testing/audit-flowdiff.md`, `testing/lots-flowdiff.md`
- **Doctrine** : `docs/testing-strategy.md`
- **Nombre de regles** : 8

## Inventaire

### FLOW-RM-009 -- Inscription : code client doit exister dans VALID_CLIENT_CODES

- **Ce qu'on verifie** : `register()` cherche le code client dans le tableau `VALID_CLIENT_CODES` et renvoie une erreur `fieldErrors.codeClient` si le code n'existe pas.
- **Verdict** : 🟢
- **Justification** : c'est du code a nous (lookup dans un tableau local + decision de rejet). Aucune dependance externe, la logique est entierement testable en unitaire.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-010 -- Inscription : email doit correspondre au code client

- **Ce qu'on verifie** : apres avoir trouve le code client, `register()` compare l'email fourni (en lowercase) a l'email stocke dans `VALID_CLIENT_CODES` et renvoie une erreur `fieldErrors.email` si ca ne correspond pas.
- **Verdict** : 🟢
- **Justification** : comparaison de chaines + decision de rejet, du code a nous. Testable en unitaire.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-011 -- Inscription : un seul compte par code client par session

- **Ce qu'on verifie** : `register()` verifie que `sessionUsersRef.current` ne contient pas deja un utilisateur avec le meme `codeClient`, et renvoie une erreur si le compte existe deja.
- **Verdict** : 🟢
- **Justification** : lookup dans un tableau en memoire + decision de rejet, du code a nous. Testable en unitaire.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-012 -- Inscription : mot de passe hashe bcrypt cost 12

- **Ce qu'on verifie** : 2 choses distinctes.
  1. Notre code appelle `bcrypt.hash(password, BCRYPT_COST)` avec `BCRYPT_COST = 12` : c'est notre logique, on peut mocker `bcrypt.hash` et verifier que le cost factor passe est bien 12.
  2. Le hash produit encode reellement un cost 12 : c'est le comportement de bcryptjs lui-meme, le mocker reviendrait a mocker ce qu'on teste.
- **Verdict** : 🟠
- **Justification** : la tranche 1 (notre code passe le bon argument) est unitaire. La tranche 2 (le hash produit a bien un cost 12) est le comportement reel de la dependance, qu'aucun smoke existant ne couvre. Il faut un smoke manuel pour confirmer que le hash stocke apres inscription encode bien `$2a$12$` (ou equivalent).
- **Tests existants** : partiels. Le succes de l'inscription est teste, mais le cost factor du hash n'est pas verifie.

### FLOW-RM-013 -- Inscription reussie connecte automatiquement l'utilisateur

- **Ce qu'on verifie** : apres une inscription reussie, `register()` appelle `setUser()` avec les donnees de l'utilisateur et stocke un token JWT dans `localStorage`.
- **Verdict** : 🟢
- **Justification** : c'est du code a nous (appel de `setUser` + `localStorage.setItem`). On peut mocker bcrypt pour isoler le chemin de succes et verifier l'etat apres l'appel. Testable en unitaire.
- **Tests existants** : 1 test dans `AuthContext.test.tsx`.

### FLOW-RM-014 -- Mot de passe : min 8 chars, 1 majuscule, 1 chiffre, 1 special

- **Ce qu'on verifie** : le schema Zod `registerSchema` rejette les mots de passe qui ne respectent pas les 4 contraintes (longueur, majuscule, chiffre, caractere special) et accepte ceux qui les respectent toutes.
- **Verdict** : 🟢
- **Justification** : on teste notre definition de schema (les regles qu'on a declarees dans Zod), pas le moteur regex de Zod. On appelle `registerSchema.safeParse()` avec des entrees valides et invalides, sans mock. C'est du code a nous.
- **Tests existants** : indirects via AuthContext (pas de tests unitaires du schema isole).

### FLOW-RM-015 -- Code client : min 3, max 20, trimmed, uppercased

- **Ce qu'on verifie** : le schema Zod `registerSchema` applique les contraintes de longueur (min 3, max 20), le trim et la mise en majuscules sur le champ `codeClient`.
- **Verdict** : 🟢
- **Justification** : meme raisonnement que FLOW-RM-014. On teste notre definition de schema, pas Zod. On appelle `safeParse()` et on verifie les rejets (trop court, trop long) et les transformations (trim, uppercase).
- **Tests existants** : aucun.

### FLOW-RM-019 -- Confirmation mot de passe doit correspondre (registerSchema)

- **Ce qu'on verifie** : le `refine` du schema Zod rejette les donnees quand `password !== confirmPassword`, avec une erreur sur le champ `confirmPassword`.
- **Verdict** : 🟢
- **Justification** : c'est du code a nous (la fonction de comparaison dans le refine). On appelle `safeParse()` avec des mots de passe qui matchent et d'autres qui ne matchent pas. Testable en unitaire.
- **Tests existants** : indirects via AuthContext (pas de tests unitaires du schema isole).

## Resume

| Verdict | Nombre | Regles |
|---------|--------|--------|
| 🟢 | 7 | FLOW-RM-009, FLOW-RM-010, FLOW-RM-011, FLOW-RM-013, FLOW-RM-014, FLOW-RM-015, FLOW-RM-019 |
| 🟠 | 1 | FLOW-RM-012 |
| 🔴 | 0 | -- |

### Ce qui part en test unitaire automatise (unit-test-writer)

- FLOW-RM-009 : rejet si code client inconnu
- FLOW-RM-010 : rejet si email ne correspond pas au code client
- FLOW-RM-011 : rejet si compte deja cree pour ce code client en session
- FLOW-RM-013 : l'utilisateur est connecte apres inscription reussie
- FLOW-RM-014 : validation du mot de passe (4 contraintes)
- FLOW-RM-015 : validation et transformation du code client (min/max/trim/uppercase)
- FLOW-RM-019 : rejet si confirmation mot de passe ne correspond pas

### Couverture partielle : unitaire + smoke manuel (FLOW-RM-012)

- **Unitaire** : verifier que notre code passe `12` comme cost factor a `bcrypt.hash`.
- **Smoke manuel** : apres une inscription, inspecter le hash stocke et verifier qu'il commence par `$2a$12$` (ou `$2b$12$`), ce qui confirme que bcryptjs a bien applique le cost 12.

### Ce qui se verifie a la main (smoke-test-writer)

Aucune regle purement manuelle dans ce lot.
