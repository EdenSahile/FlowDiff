# Smoke tests -- LOT-02

> Ces scenarios s'ecrivent **avant** l'implementation (test-first) mais s'executent **apres**.
> Ne rien executer tant que le code n'est pas en place.

## Auth : inscription et schemas de validation

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-009 | 🟢 | Rejet si code client inconnu | aucun smoke, couvert en unitaire |
| FLOW-RM-010 | 🟢 | Rejet si email ne correspond pas au code client | aucun smoke, couvert en unitaire |
| FLOW-RM-011 | 🟢 | Rejet si compte deja cree pour ce code client en session | aucun smoke, couvert en unitaire |
| FLOW-RM-012 | 🟠 | Le hash stocke apres inscription encode un cost factor 12 | smoke ci-dessous |
| FLOW-RM-013 | 🟢 | L'utilisateur est connecte apres inscription reussie | aucun smoke, couvert en unitaire |
| FLOW-RM-014 | 🟢 | Validation du mot de passe (4 contraintes) | aucun smoke, couvert en unitaire |
| FLOW-RM-015 | 🟢 | Validation et transformation du code client | aucun smoke, couvert en unitaire |
| FLOW-RM-019 | 🟢 | Rejet si confirmation mot de passe ne correspond pas | aucun smoke, couvert en unitaire |

---

### FLOW-RM-012 -- Verification du cost factor bcrypt apres inscription

> ✅ **Ce qu'on verifie :**
> - Le hash produit par bcryptjs lors d'une inscription reelle encode bien un cost factor 12 (prefixe `$2a$12$` ou `$2b$12$`).
> - Le test unitaire verifie que notre code passe `12` a `bcrypt.hash`, mais seul un smoke confirme que la librairie bcryptjs produit effectivement un hash avec ce cost. Mocker bcrypt dans un test auto reviendrait a tester le mock, pas la librairie.

#### Preconditions

- L'application tourne en local (`npm run dev`).
- Aucun compte n'a ete cree pour le code client `LIB001` dans la session en cours (recharger la page si besoin, les comptes sont en memoire).
- Les React DevTools sont installees dans le navigateur, ou un `console.log` temporaire est ajoute dans `src/contexts/AuthContext.tsx` apres l'appel `await bcrypt.hash(...)` (aux alentours de la ligne 162) pour afficher le hash produit. Exemple : `console.log('hash:', hashedPassword)`.

#### Etapes

1. Ouvrir l'application dans le navigateur et naviguer vers la page d'inscription.
2. Remplir le formulaire avec les donnees suivantes :
   - Code client : `LIB001`
   - Email : `marie.lecomte@librairie-lira.fr`
   - Mot de passe : `NouveauMdp123!`
   - Confirmation : `NouveauMdp123!`
3. Soumettre le formulaire et ouvrir la console du navigateur (F12 > Console) pour lire le hash affiche.

#### Resultat attendu

Le hash affiche dans la console commence par `$2a$12$` ou `$2b$12$`. Les 2 premiers segments (`$2a$` ou `$2b$` puis `12$`) confirment respectivement l'algorithme bcrypt et le cost factor 12.

Si le prefixe est different (par exemple `$2a$04$` ou `$2a$10$`), cela signifie que la constante `BCRYPT_COST` ne vaut pas 12 ou que l'appel ne la transmet pas correctement.

- [ ] Le hash stocke commence par `$2a$12$` ou `$2b$12$`
