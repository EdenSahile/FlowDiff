# Inventaire des tests : LOT-03 (Auth : logout, routes protegees et isolation)

## Perimetre

Logout (ce qui est supprime vs conserve), protection des routes, securite anti open-redirect, isolation des donnees par codeClient.

---

### Logout

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-016 | Logout supprime `bookflow_token` et `bookflow_wishlist_username_${codeClient}`, met `user` a `null` | 🟢 | Logique a nous : `localStorage.removeItem` sur des cles connues + `setUser(null)`. jsdom fournit un localStorage fonctionnel, pas de dependance externe dont on teste le comportement reel. | Unitaire, test-first |
| FLOW-RM-016 | Logout conserve panier (`bookflow_cart_*`) et historique (`bookflow_orders_*`) | 🟢 | Meme raisonnement : on verifie que `logout()` ne touche pas a certaines cles localStorage. Pas de dependance externe. | Unitaire, test-first |

**Tests existants** : 2 tests dans `src/contexts/__tests__/AuthContext.test.tsx` (describe `logout`) couvrent deja ces 2 cas. A verifier si la couverture est suffisante ou si des cas limites manquent (ex. logout sans user connecte, absence de la cle wishlist).

---

### Routes protegees

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-017 | `ProtectedRoute` redirige vers `/login` quand `user` est `null` | 🟢 | Composant React dont la seule dependance (`useAuth`) est mockable. On rend dans un `MemoryRouter`, on verifie que le `Navigate` pointe vers `/login`. | Unitaire, test-first |
| FLOW-RM-017 | `ProtectedRoute` passe `location.pathname + location.search` dans `state.from` | 🟢 | Meme principe : on positionne une route initiale dans le `MemoryRouter` et on verifie la valeur du `state` de la redirection. | Unitaire, test-first |
| FLOW-RM-017 | `ProtectedRoute` rend `<Outlet />` quand `user` existe | 🟢 | Mock de `useAuth` avec un user non-null, verification que le contenu enfant est rendu. | Unitaire, test-first |
| FLOW-RM-017 | `ProtectedRoute` rend `null` pendant le chargement (`isLoading=true`) | 🟢 | Mock de `useAuth` avec `isLoading=true`, verification que rien n'est rendu. | Unitaire, test-first |

**Tests existants** : aucun.

---

### Redirection post-login securisee (anti open-redirect)

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-018 | `getSafeRedirectPath` accepte un chemin interne valide (`/catalogue`, `/catalogue?tri=titre`) | 🟢 | Fonction pure, aucune dependance. | Unitaire, test-first |
| FLOW-RM-018 | `getSafeRedirectPath` retourne le repli si la cible est absente, vide, ou non-string | 🟢 | Fonction pure. | Unitaire, test-first |
| FLOW-RM-018 | `getSafeRedirectPath` rejette les URLs protocol-relative (`//evil.com`), backslash (`/\evil.com`), schemas (`https:`, `javascript:`, `data:`) | 🟢 | Fonction pure, regex deterministes. | Unitaire, test-first |
| FLOW-RM-018 | `getSafeRedirectPath` accepte un repli personnalise | 🟢 | Fonction pure. | Unitaire, test-first |

**Tests existants** : 10 tests dans `src/lib/__tests__/authUtils.test.ts` (describe `getSafeRedirectPath`). Couverture deja large. A verifier s'il manque des vecteurs (encodage URL, caracteres de controle Unicode).

---

### Isolation des donnees par codeClient

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-020 | Chaque context genere une cle localStorage suffixee par `codeClient` : `cartKey`, `ordersKey`, `storageKey` (wishlists), `rdvKey`, `messagesKey`/`paramsKey` (EDI) | 🟢 | Fonctions pures (concatenation de chaines). On les appelle avec 2 codeClient differents et on verifie que les cles sont distinctes. | Unitaire, test-first |
| FLOW-RM-020 | Un context recharge les bonnes donnees quand `codeClient` change (changement d'utilisateur) | 🟠 | La generation de cle est testable en unitaire (couvert ci-dessus). Mais le scenario complet (login A, ajouter au panier, logout, login B, verifier que le panier de B est vide) traverse plusieurs contexts React et leur cycle de vie. Le test unitaire mocke la forme de l'etat auth, mais aucun smoke ne confirme que le rechargement reel fonctionne de bout en bout. | Unitaire (cles) + smoke manuel (scenario multi-utilisateurs) |
| FLOW-RM-020 | Le fallback `'guest'` est utilise quand aucun user n'est connecte, separant les donnees invitees des donnees librairie | 🟢 | Les fonctions de cle renvoient `prefix_guest` quand `codeClient` est `undefined`. Testable en appelant `cartKey(undefined)` et en verifiant la sortie. | Unitaire, test-first |

**Tests existants** : aucun.

**Note** : `OnboardingContext` utilise une cle fixe (`onboarding_done`) non suffixee par `codeClient`. Ce n'est pas un bug fonctionnel (l'onboarding est lie a l'appareil, pas a la librairie), mais c'est une exception au pattern d'isolation.

---

## Recap

### Unitaire automatise (unit-test-writer)

- FLOW-RM-016 : logout supprime token + wishlist username, conserve panier et historique (2 tests existants, completer si cas limites manquants)
- FLOW-RM-017 : `ProtectedRoute` redirige vers `/login` avec `state.from`, rend `<Outlet />` si connecte, rend `null` si loading (4 cas, aucun test existant)
- FLOW-RM-018 : `getSafeRedirectPath` valide/rejette les cibles de redirection (10 tests existants, completer si vecteurs manquants)
- FLOW-RM-020 : fonctions de cle localStorage suffixees par `codeClient` + fallback `guest` (aucun test existant)

### Couverture partielle : unitaire + smoke manuel

- FLOW-RM-020 (rechargement des donnees lors d'un changement d'utilisateur) : le test unitaire verifie que les cles sont differentes par `codeClient`. Le smoke verifie le scenario reel : login LIB001 -> ajouter un livre au panier -> logout -> login LIB002 -> verifier que le panier est vide.

### Verification manuelle uniquement (smoke-test-writer)

Aucune regle de ce lot ne releve de la verification manuelle seule.
