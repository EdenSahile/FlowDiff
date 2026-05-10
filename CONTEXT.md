# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 162 tests passants · session 2026-05-09  
**Refonte design pages** : NouveautesPage, AParaitrePage, TopVentesPage, SelectionsPage, FlashInfosPage, HistoriquePage, MonComptePage, RecherchePage, AuteurPage, ContactPage, FacturationPage, ParametresPage, EDIPage, OfficesPage ✅  
**Onboarding** : Tour guidé Driver.js 7 étapes + TooltipInfo métier + "Revoir le tour" ✅  
**Panier** : Récapitulatif HT corrigé — remise appliquée sur base HT (Prix TTC / 1,055) ✅  
**Notifications** : Feed chronologique 3 types, NotificationBell, NotificationsContext, markAsRead ✅  
**Audit Mobile Responsive** : 360px→1400px · `src/lib/responsive.ts` (bp/mq) · 16 pages alignées · 0 scroll horizontal · touch ≥44px ✅  
**LoginPage responsive** : overflow grid corrigé (DemoBanner sorti de SplitPage) · Wordmark prop `responsiveOnDark` (white mobile / navy desktop) ✅  
**Scroll restoration FicheProduitPage** : `useEffect([id])` → `window.scrollTo(0,0)` ✅  
**FicheProduitPage mobile** : scroll horizontal supprimé · touch targets ≥44px · carrousel "Dans la même thématique" ✅  
**BookCard** : ISBN affiché en bold 13px navy sous l'éditeur (layouts défaut + coverFirst) ✅  
**mockBooks** : format → dimensions réelles (155x235, 108x177, 115x175, 220x290, 145x195, 145x215 mm) ✅  
**FicheProduitPage** : dimensions cohérentes avec le format sélectionné (broché/poche) ✅  
**Sidebar** : entrée "Panier" retirée du menu ✅  
**FacturationPage — bouton Payer** : colonne Payer · modal CB/Virement · badge "Payé" · persistance localStorage · portal fix + fix overflow CVV ✅  
**Dashboard — comparaison** : toggle "Année N-1" uniquement (Période préc. supprimée) · anneau intérieur donut supprimé · KPI renommé "Références distinctes commandées" ✅  
**Dashboard — graphique tooltip** : survol courbe verte → ligne verticale + point + bulle navy (date · cumulé · N-1) ✅  
**Dashboard — exports CSV par section** : icône ↓ dans chaque PanelHeader (évolution, répartition, top éditeurs, EDI, nouveautés) + bouton ↓ KPIs + bouton ↓ Actions en attente + bouton global "Exporter CSV" (rapport complet) ✅  
**Dashboard — réinitialiser filtres** : bouton "↺ Réinitialiser" dans la barre de filtres (après vs N-1), visible uniquement quand période ≠ défaut, style lien discret ✅

---

## Session en cours

**Recette fonctionnelle manuelle** — serveur sur http://localhost:5179/

### 1. Authentification
- [x] 1.1 — Ouvrir l'app sans être connecté → redirigé vers Login
- [x] 1.2 — Se connecter avec un mauvais mot de passe → message d'erreur
- [x] 1.3 — Se connecter avec les credentials démo → accès à l'accueil
- [x] 1.4 — Cliquer "Mot de passe oublié" → formulaire affiché
- [x] 1.5 — Page Inscription → formulaire code client + email + mdp
- [x] 1.6 — Se déconnecter via le menu burger → retour sur Login
- [x] 1.7 — Accéder manuellement à `/home` après déco → redirigé Login

### 2. Navigation & layout
- [x] 2.1 — Sidebar desktop → sections + entrées visibles
- [x] 2.2 — Cliquer chaque entrée du menu → bonne page, lien actif en or
- [x] 2.3 — Menu burger → photo librairie + liste options
- [x] 2.4 — Réduire à ~400px → bottom nav, sidebar disparaît
- [x] 2.5 — Scroll longue page → pas de scroll horizontal parasite

### 3. Accueil
- [ ] 3.1 — Charger l'accueil → dashboard stats + raccourcis
- [ ] 3.2 — Cliquer un raccourci → bonne page chargée
- [ ] 3.3 — Bloc nouveautés → livres affichés

### 4. Catalogue Fonds
- [ ] 4.1 — Charger Fonds → grille de livres
- [ ] 4.2 — Filtrer par thématique → liste filtrée
- [ ] 4.3 — Cliquer un livre → fiche produit ouvre
- [ ] 4.4 — ISBN visible en bold sur les cards
- [ ] 4.5 — Ajouter depuis la card → badge panier incrémenté

### 5. Fiche produit
- [ ] 5.1 — Titre, auteur, ISBN, couverture visibles
- [ ] 5.2 — Choisir format broché/poche → dimensions mises à jour
- [ ] 5.3 — Modifier la quantité → compteur actif
- [ ] 5.4 — Ajouter au panier → toast + badge incrémenté
- [ ] 5.5 — Scroll bas → carrousel "Dans la même thématique"
- [ ] 5.6 — Revenir + ouvrir autre fiche → page scrollée en haut

### 6. Recherche
- [ ] 6.1 — Taper un titre → résultats apparaissent
- [ ] 6.2 — Taper un auteur → résultats filtrés
- [ ] 6.3 — Recherche avancée → champs supplémentaires
- [ ] 6.4 — Recherche vide → pas de crash

### 7. Nouveautés & À paraître
- [ ] 7.1 — Aller sur Nouveautés → sous-onglets "Du mois" / "À paraître"
- [ ] 7.2 — Basculer sur "À paraître" → aucun bouton Ajouter
- [ ] 7.3 — Filtrer par univers → liste filtrée
- [ ] 7.4 — "Recevoir le catalogue" → action déclenchée

### 8. Top Ventes
- [ ] 8.1 — Charger la page → badges TOP 1, 2…
- [ ] 8.2 — Changer de thématique → liste mise à jour
- [ ] 8.3 — Ajouter depuis Top Ventes → panier incrémenté

### 9. Sélections
- [ ] 9.1 — Charger la page → sélections thématiques
- [ ] 9.2 — Indicateur "Offre spéciale" (point vert) visible
- [ ] 9.3 — Cliquer une sélection → détail affiché

### 10. Flash Infos
- [ ] 10.1 — Charger la page → infos par univers
- [ ] 10.2 — Filtrer par catégorie → liste filtrée
- [ ] 10.3 — Flash info avec image → rendu correct
- [ ] 10.4 — Ajouter au panier depuis Flash Info → panier incrémenté

### 11. Panier & commande
- [ ] 11.1 — Ouvrir panier avec articles → récap HT / remise / TTC
- [ ] 11.2 — Modifier quantité → totaux recalculés
- [ ] 11.3 — Supprimer un article → totaux mis à jour
- [ ] 11.4 — Choisir date de livraison → date enregistrée
- [ ] 11.5 — Valider → résumé affiché
- [ ] 11.6 — Confirmer → commande envoyée, panier vidé
- [ ] 11.7 — Panier vide → badge disparaît

### 12. Historique
- [ ] 12.1 — Charger Historique → liste des commandes
- [ ] 12.2 — Dupliquer une commande → articles ajoutés au panier

### 13. Mon Compte / Paramètres / Contact
- [ ] 13.1 — Mon Compte → infos librairie affichées
- [ ] 13.2 — Paramètres → préférences notifications par univers
- [ ] 13.3 — Contact → formulaire vers représentant
- [ ] 13.4 — CGV → page texte affichée

### 14. Facturation
- [ ] 14.1 — Charger Facturation → liste des factures
- [ ] 14.2 — Cliquer "Payer" → modal CB / Virement
- [ ] 14.3 — Payer par CB → badge "Payé" + persisté après refresh
- [ ] 14.4 — Payer par virement → idem

### 15. EDI & Offices
- [ ] 15.1 — Page EDI → interface envoi commande Dilicom
- [ ] 15.2 — Page Offices → offices disponibles affichés

### 16. Mobile (375px)
- [ ] 16.1 — Bottom nav présente, 5 onglets
- [ ] 16.2 — Sidebar absente
- [ ] 16.3 — Fiche produit → pas de scroll horizontal
- [ ] 16.4 — Panier → lisible sans zoom
- [ ] 16.5 — Login → formulaire centré, pas d'overflow

---

## Session en cours — Exports CSV Dashboard ✅

Toutes les tâches terminées.

---

## Prochaines étapes

Corriger les bugs remontés lors de la recette fonctionnelle.
