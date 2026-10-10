# Formulaire d'avis, chantier reporté

Le formulaire « Donner un avis » est **retiré de la démo en ligne**. Son code est conservé ici. Rien dans ce dossier n'est compilé, routé, déployé ni appelable.

Avec ce parcage, le projet n'a plus **aucune** fonction serverless : l'application est un front statique pur.

## Pourquoi il a été parqué

C'était le dernier endpoint public de la démo. Un audit a relevé 4 points, sans aucune fuite de secret, mais qui exposaient le compte Gmail associé :

1. **Aucune limite de débit.** Endpoint d'envoi d'email public et non authentifié : il pouvait être martelé en boucle. Gmail plafonne autour de 500 envois par jour sur un compte gratuit et suspend les comptes jugés abusifs, donc le risque portait sur l'adresse elle-même, pas seulement sur le formulaire.
2. **`page` non plafonné.** Le message était limité à 500 caractères côté serveur, `pageName` ne l'était pas, et il partait dans le sujet et dans le corps.
3. **Interpolation HTML non échappée.** `${pageName}` et `${message}` étaient injectés tels quels dans le HTML de l'email, ce qui permettait d'y glisser du contenu arbitraire arrivant depuis l'adresse d'expédition du projet.
4. **Pièce jointe non plafonnée.** La capture d'écran n'avait aucun contrôle de taille, le seul plafond étant les 4,5 Mo par requête de Vercel.

## Ce que contient ce dossier

| Ici | Emplacement d'origine |
|---|---|
| `api/feedback.ts` | `api/feedback.ts` |
| `src/FeedbackWidget.tsx` | `src/components/ui/FeedbackWidget.tsx` |
| `src/__tests__/FeedbackWidget.test.ts` | `src/components/ui/__tests__/FeedbackWidget.test.ts` |

## Pour le remettre en service

1. Replacer les fichiers à leurs emplacements d'origine, en recréant le dossier `api/`.
2. Réinstaller les dépendances, toutes désinstallées avec le parcage :

   ```
   npm install nodemailer
   npm install -D html2canvas @vercel/node
   ```

   `nodemailer` envoie l'email, `html2canvas` produit la capture d'écran (import dynamique, ligne 405 du widget), `@vercel/node` fournit les types `VercelRequest` et `VercelResponse` de l'endpoint.
3. Dans `src/components/layout/AppLayout.tsx` : remonter l'état `feedbackOpen`, repasser `onFeedbackOpen` à `<Sidebar>` et `<BurgerMenu>`, et remonter `<FeedbackWidget>`. Les 2 composants gardent la prop en optionnel et masquent l'entrée quand elle est absente, donc rien d'autre n'est à toucher chez eux.
4. **Traiter les 4 points ci-dessus avant de redéployer**, en commençant par la limite de débit.
5. Redéclarer les variables d'environnement.

## Variables d'environnement

Utilisées uniquement par ce code, donc retirables de Vercel tant qu'il est parqué :

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FEEDBACK_TO`

`GMAIL_APP_PASSWORD` est un mot de passe d'application Gmail. Tant que le formulaire est parqué, autant le révoquer dans le compte Google plutôt que de le laisser valide sans usage.
