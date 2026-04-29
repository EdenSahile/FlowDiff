# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 146 tests passants · dernière session 2026-04-29  
Feature dashboard complète : sélecteur de période, comparaison N-1, 7 KPI cards dynamiques, graphique, donut, top éditeurs.  
Feature personnalisation drawer complète : toggle visibilité, réordonnancement drag & drop (desktop) + flèches (mobile), reset, persistance localStorage.  
Fixes UX drawer : touch targets 44px, icônes SVG (IconGrip, IconLayout), section labels visuels, scroll page background pendant drawer ouvert.  
Feature réordonnancement sections HomePage complète : flèches ↑↓ au survol de chaque section (Actions · Tableau de bord · Panneaux principaux · Panneaux du bas), persistance localStorage.  
Feature Feedback Widget complète : FAB bottom-right, panel slide-up, détection de page, envoi via Vercel serverless + Gmail SMTP (nodemailer), 16 tests unitaires.  
Fixes UX Feedback Widget : icône FAB → croix ✕ droite quand panel ouvert (suppression rotate parasite), bouton ✕ dans le header du panel, bouton Envoyer toujours actif (min. caractères supprimé), spacing sections HomePage 2rem → 2.5rem.  
Feature Capture d'écran Feedback Widget : html2canvas (dynamic import), capture au clic FAB + spinner, miniature 80×60px cliquable → lightbox plein écran, screenshot JPEG 0.65 joint en pièce jointe dans le mail (api/feedback.ts).

---

## Session en cours

_(aucune session en cours)_

---

## Prochaines étapes

_(aucune étape définie)_
