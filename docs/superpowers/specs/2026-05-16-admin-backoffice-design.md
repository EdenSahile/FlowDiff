# Spec — Back-Office FlowDiff Admin (Phase 1)

**Date** : 2026-05-16  
**Statut** : Validé  
**Scope** : Shell admin + 4 modules core (Dashboard, Catalogue, Commandes, Libraires)

---

## 1. Contexte & objectif

FlowDiff est une app B2B pour libraires. Le back-office est l'interface interne des employés FlowDiff pour gérer le catalogue, les commandes, les comptes librairies et suivre l'activité.

Pour la démo : le back-office est accessible en ligne à `/admin`, distinct de l'app libraire, avec sa propre auth et son propre style visuel.

---

## 2. Architecture & Routing

### Localisation
Même repo Vite/React, routes montées en parallèle de l'app libraire. Aucune dépendance entre les deux apps sauf le client Supabase (`src/lib/supabase.ts`).

### Routes
```
/admin                → redirect /admin/dashboard (si auth) ou /admin/login
/admin/login          → page login admin
/admin/dashboard      → KPIs + tableaux synthèse
/admin/catalogue      → gestion livres (CRUD)
/admin/commandes      → gestion commandes
/admin/libraires      → gestion comptes librairie
```

### Fichiers créés
```
src/admin/
  AdminApp.tsx              ← router admin, monté depuis main.tsx
  AdminLayout.tsx           ← sidebar + header wrapper
  AdminRoute.tsx            ← guard de route (auth check)
  context/AdminAuthContext.tsx
  pages/
    AdminLoginPage.tsx
    AdminDashboardPage.tsx
    AdminCataloguePage.tsx
    AdminCommandesPage.tsx
    AdminLibrairesPage.tsx
  components/
    AdminSidebar.tsx
    AdminHeader.tsx
    AdminTable.tsx          ← tableau générique paginé
    AdminModal.tsx          ← wrapper modal
    StatutBadge.tsx
```

### Intégration dans main.tsx
React Router v6 : `<Routes>` racine avec `<Route path="/admin/*" element={<AdminApp />} />` avant `<Route path="/*" element={<App />} />`. `AdminApp` contient son propre `<Routes>` interne. Aucun layout partagé.

---

## 3. Authentification Admin

### Identifiants
- Email : `admin@flowdiff.com`
- Mot de passe : `FlowDiff2024!` (pré-rempli, masqué — type `password`)

### Mécanisme
- localStorage key : `flowdiff_admin_session` (valeur : `{ email, role: 'admin', exp: timestamp+8h }`)
- `<AdminRoute>` vérifie la session + l'expiration ; redirige vers `/admin/login` sinon
- Pas de JWT réel — mock suffisant pour la démo

### AdminAuthContext
```ts
interface AdminAuth {
  isAuthenticated: boolean
  login(email: string, password: string): boolean
  logout(): void
}
```

---

## 4. Style visuel

**Distinct de l'app libraire** pour marquer clairement la séparation.

| Token | Valeur | Usage |
|-------|--------|-------|
| Sidebar bg | `#1a1a2e` | Fond sidebar |
| Accent | `#4361ee` | Boutons primaires, liens actifs sidebar |
| Page bg | `#f8f9fa` | Fond général |
| Surface | `#ffffff` | Cards, tableaux |
| Ligne alternée | `#f1f3f5` | Lignes paires des tableaux |
| Texte principal | `#212529` | Corps |
| Texte secondaire | `#6c757d` | Labels, méta |
| Statut vert | `#2ecc71` | Livré / Actif |
| Statut orange | `#f39c12` | En préparation |
| Statut bleu | `#3498db` | Expédié |
| Statut rouge | `#e74c3c` | Annulé / Bloqué |
| Statut gris | `#95a5a6` | Inconnu |

Typographie : Open Sans (même que l'app libraire, via `theme.typography.fontFamily`).

**Desktop uniquement** — pas de responsive mobile requis pour le back-office.

---

## 5. Modèles de données Supabase

### Table `commandes`
```sql
CREATE TABLE commandes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_client  text NOT NULL,
  librairie    text NOT NULL,
  date         timestamptz NOT NULL DEFAULT now(),
  statut       text NOT NULL CHECK (statut IN ('en_preparation','expedie','livre','annule')),
  montant_ht   numeric(10,2) NOT NULL,
  montant_ttc  numeric(10,2) NOT NULL,
  articles     jsonb NOT NULL DEFAULT '[]'
);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SELECT public" ON commandes FOR SELECT USING (true);
```

Structure d'un article dans `articles` :
```json
{ "isbn": "9782070736737", "titre": "L'Étranger", "quantite": 2, "prix_ttc": 8.50 }
```

### Table `libraires`
```sql
CREATE TABLE libraires (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_client text UNIQUE NOT NULL,
  nom         text NOT NULL,
  email       text NOT NULL,
  ville       text NOT NULL,
  telephone   text,
  remise      numeric(5,2) NOT NULL DEFAULT 35.0,
  statut      text NOT NULL CHECK (statut IN ('actif','bloque')) DEFAULT 'actif',
  reliquat    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE libraires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SELECT public" ON libraires FOR SELECT USING (true);
```

### Seed (données mock cohérentes avec mockUsers)

**Libraires** : LIB001 (Les Temps Modernes, Paris, remise 35%, actif), LIB002 (L'Écume des Pages, Lyon, remise 30%, actif), LIB003 (Mollat, Bordeaux, remise 40%, actif).

**Commandes** : 8 commandes réparties sur les 3 librairies, statuts variés (2 en_preparation, 2 expedie, 3 livre, 1 annule), dates couvrant les 30 derniers jours, montants entre 120€ et 850€.

### CRUD admin (clé anon + RLS permissive pour la démo)
Les mutations (INSERT, UPDATE, DELETE) utilisent le même client Supabase anon (`src/lib/supabase.ts`). Pour la démo, les policies RLS autorisent toutes les opérations :

```sql
CREATE POLICY "ALL public demo" ON commandes FOR ALL USING (true);
CREATE POLICY "ALL public demo" ON libraires FOR ALL USING (true);
```

En production, remplacer par des policies basées sur un rôle authentifié Supabase Auth.

---

## 6. Modules UI

### 6.1 Dashboard (`/admin/dashboard`)

**KPI Cards** (row de 4) :
- CA du mois (somme montant_ttc commandes du mois en cours, statut ≠ annule)
- Commandes en attente (statut = en_preparation)
- Livres au catalogue (count table livres)
- Librairies actives (count table libraires statut = actif)

**Tableau "Commandes récentes"** : 5 dernières commandes (date, librairie, montant, statut badge, lien "Voir →" vers /admin/commandes).

**Tableau "Top livres commandés"** : top 5 ISBN par volume (agrégé depuis articles JSONB), colonnes : Titre · Auteur · Quantité totale.

### 6.2 Catalogue (`/admin/catalogue`)

**Tableau paginé** (20 lignes/page) depuis Supabase `livres` :
- Colonnes : Image mini (40×60) · Titre · Auteur · ISBN · Prix TTC · Disponibilité badge · Actions (Modifier / Supprimer)
- Filtre : select type (tous/fonds/nouveaute/a_paraitre) + input recherche (titre, auteur, ISBN)

**Modal Ajouter/Modifier** :
- Champs : titre, auteur, isbn, prix_ttc, type, thematique, editeur, disponibilite (select), description, image_url
- Validation Zod avant submit
- Insert/Update dans Supabase

**Supprimer** : bouton rouge avec confirmation dialog inline ("Supprimer ce livre ?") avant DELETE.

### 6.3 Commandes (`/admin/commandes`)

**Tableau** depuis Supabase `commandes` :
- Colonnes : Date · Code client · Librairie · Montant TTC · Statut (select inline) · Actions (Détail)
- Filtre : select statut + input recherche librairie

**Select statut inline** : `<select>` dans la colonne statut, change le statut directement dans Supabase via UPDATE. Flow autorisé : en_preparation → expedie → livre (annule accessible depuis n'importe quel statut).

**Modal Détail** :
- Infos commande (librairie, date, statuts)
- Tableau des articles : Titre · ISBN · Quantité · Prix unit. · Sous-total
- Total HT, TVA 5.5%, Total TTC

### 6.4 Libraires (`/admin/libraires`)

**Tableau** depuis Supabase `libraires` :
- Colonnes : Code client · Nom · Ville · Email · Remise % · Statut badge · Reliquat badge · Actions (Modifier)

**Modal Modifier** :
- Champs éditables : nom, email, ville, telephone, remise (input number), statut (select actif/bloqué), reliquat (checkbox)
- UPDATE dans Supabase

---

## 7. Composants partagés Admin

### `AdminTable`
```tsx
interface AdminTableProps<T> {
  columns: { key: keyof T; label: string; render?: (val, row) => ReactNode }[]
  data: T[]
  loading: boolean
  onSort?: (key: keyof T) => void
}
```
Gère : chargement (skeleton rows), tableau vide ("Aucun résultat"), alternance lignes.

### `AdminModal`
Wrapper : fond overlay, fermeture Esc + clic extérieur, max-width 600px, header titre + bouton ×.

### `StatutBadge`
Badge coloré selon le statut : reçoit `statut: string`, retourne `<span>` stylé selon la map de couleurs.

---

## 8. Services Supabase Admin

Nouveau fichier `src/admin/services/adminServices.ts` :
```ts
// Commandes
getAllCommandes(): Promise<Commande[]>
updateCommandeStatut(id: string, statut: StatutCommande): Promise<void>

// Libraires
getAllLibraires(): Promise<Libraire[]>
updateLibraire(id: string, data: Partial<Libraire>): Promise<void>

// Livres (complète src/services/books.ts)
addLivre(data: LivreInsert): Promise<void>
updateLivre(id: string, data: Partial<LivreInsert>): Promise<void>
deleteLivre(id: string): Promise<void>
```

---

## 9. Ce qui n'est PAS dans cette phase

- Factures & paiements (Phase 2)
- Retours (Phase 2)
- Flash Infos / éditorial (Phase 2)
- Offices / Sélections (Phase 2)
- Responsive mobile du back-office
- Auth admin avec vrai JWT/Supabase Auth
- Permissions granulaires par rôle

---

## 10. Critères de succès

- [ ] `/admin/login` accessible avec identifiants pré-remplis masqués
- [ ] Les 4 modules affichent des données réelles depuis Supabase
- [ ] CRUD catalogue fonctionnel (add/edit/delete livre)
- [ ] Changement de statut commande persiste dans Supabase
- [ ] Modification librairie (remise, statut) persiste dans Supabase
- [ ] Dashboard KPIs calculés depuis vraies données
- [ ] Style clairement distinct de l'app libraire
- [ ] Build TS clean, 0 erreur
