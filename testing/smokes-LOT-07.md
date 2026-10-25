# Smoke tests manuels - LOT-07 : Panier, tunnel de commande

> **Ces scenarios sont ecrits apres l'implementation**, contrairement aux fichiers des LOT-02, 03, 04, 10 et 11, qui precedaient le code (test-first). Les libelles, chemins et numeros de ligne cites ont donc ete releves dans la source le 25 octobre 2026.
> A executer sur l'application lancee en local (`npm run dev`).

---

## Tunnel, validation et transmission

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-050 | 🟢 | 3 etapes dans l'ordre, navigation avant/arriere, derniere etape, libelles | aucun smoke, couvert en unitaire (8 tests, `checkoutSteps.test.ts`) |
| FLOW-RM-051 | 🟢 | Adresse de livraison : rue requise, code postal a 5 chiffres, ville requise | aucun smoke, couvert en unitaire (7 tests, `checkoutSchemas.test.ts`) |
| FLOW-RM-052 | 🟢 | `transmissionSchema` n'accepte que FLOWDIFF ou EDI | aucun smoke, couvert en unitaire |
| FLOW-RM-053 | 🟢 | FLOWDIFF par defaut quand rien n'est stocke | aucun smoke, couvert en unitaire |
| FLOW-RM-054 | 🟢 | Preference de transmission persistee par codeClient | aucun smoke, couvert en unitaire |

## Confirmation de commande

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-055 | 🔴 | Confirmer cree la commande, vide le panier, affiche l'ecran de succes | SMOKE-055 ci-dessous |
| FLOW-RM-056 | 🟠 | Un panier contenant un reliquat declenche le toast « notifie par email » apres confirmation | SMOKE-056 ci-dessous, part unitaire sur `hasReliquatInItems` |
| FLOW-RM-057 | 🔴 | Le message de succes differe entre FLOWDIFF et EDI | SMOKE-057 ci-dessous |

## Options de commande

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-058 | 🔴 | Reference globale et reference par ligne limitees a 35 caracteres | SMOKE-058 ci-dessous |
| FLOW-RM-059 | 🔴 | Livraison standard ou date specifique, jamais anterieure a aujourd'hui | SMOKE-059 ci-dessous |

---

### SMOKE-055 : Confirmer la commande la cree, vide le panier et affiche l'ecran de succes

> ✅ **Ce qu'on verifie :**
> - La commande apparait dans l'historique, au statut « en preparation », avec le bon montant
> - Le panier est vide apres confirmation, badge du panier compris
> - L'ecran de succes remplace le tunnel
> - `handleConfirmOrder` (`src/pages/cart/CartPage.tsx:1178-1204`) est defini dans le corps de `CartPage` et orchestre `addOrder`, `clearCart` et `setPage`. Aucune logique pure n'en est extractible, l'enchainement des 3 effets ne se verifie donc qu'a l'ecran

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Partir d'un panier vide. Si besoin, vider via le bouton « Tout vider » de `/panier`
- Noter le nombre de commandes deja presentes sur `/historique`

**Etapes**

1. Depuis `/fonds`, ajouter au panier « Leurs enfants apres eux » de Nicolas Mathieu, quantite 2
2. Aller sur `/panier` et relever le **Total TTC** du recapitulatif de droite
3. Cliquer sur « Valider la commande »
4. Etape « Votre commande » : cliquer « Suivant : Adresses »
5. Etape « Adresses » : les champs sont pre-remplis depuis l'adresse du compte. Cliquer « Suivant : Mode de transmission »
6. Etape « Mode de transmission » : laisser « Envoyer via FlowDiff » selectionne et cliquer « Envoyer la commande »
7. Observer l'ecran affiche, puis le badge du panier dans l'en-tete
8. Aller sur `/panier`
9. Aller sur `/historique` et ouvrir la commande la plus recente

**Resultat attendu**

- Etape 7 : l'ecran affiche « Commande envoyee ! », la mention « Un recapitulatif vous sera envoye par email » et la mention de demonstration. Le badge du panier a disparu, ou affiche 0
- Etape 8 : `/panier` affiche l'etat vide, pas les 2 exemplaires de « Leurs enfants apres eux »
- Etape 9 : une commande de plus qu'au depart. La plus recente porte :
  - un numero au format `CMD00000XX`, strictement superieur a `CMD0000014`, puisque les numeros jusqu'a 14 sont reserves aux donnees mock (`ORDER_COUNTER_INITIAL`, `src/contexts/OrdersContext.tsx:17`)
  - la date du jour
  - le statut « en preparation »
  - l'adresse de livraison du compte LIB001
  - le Total TTC releve a l'etape 2, au centime
  - 2 exemplaires de « Leurs enfants apres eux »

- [x] Verifie

---

### SMOKE-056 : Le toast de reliquat s'affiche apres confirmation

> ✅ **Ce qu'on verifie :**
> - Un panier contenant au moins 1 titre marque en reliquat declenche, apres confirmation, un toast annoncant la notification par email
> - Un panier sans reliquat ne declenche pas ce toast
> - La detection est couverte en unitaire (`hasReliquatInItems`, `src/contexts/CartContext.tsx:152`). L'affichage du toast est un effet de bord de `handleConfirmOrder` (`CartPage.tsx:1201-1203`) et ne se verifie qu'a l'ecran

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Panier vide au depart
- Un titre au statut `en_reimp` est necessaire. Le catalogue en compte 3 (`src/data/mockBooks.ts:1028-1030`) : « Serotonine » de Houellebecq, « Jujutsu Kaisen T.8 », « Homo Deus » (`f-pra-homo`)

**Etapes**

1. Depuis `/fonds`, rechercher « Houellebecq » et cliquer sur le bouton d'ajout au panier de « Serotonine ». Chercher le titre lui-meme ne marche pas : la recherche compare des chaines sans normaliser les accents (`src/services/books.ts:26-34`), « Serotonine » ne trouve donc pas « Sérotonine »
2. Une modale d'alerte stock s'ouvre, le titre etant en reimpression. Lire son contenu et confirmer l'ajout
3. Aller sur `/panier` et verifier que la ligne porte la mention « 🔁 Reliquat : expedition des disponibilite »
4. Derouler le tunnel jusqu'au bout et cliquer « Envoyer la commande »
5. Observer le bas de l'ecran dans les 5 secondes qui suivent
6. Recommencer avec un titre disponible : ajouter « Leurs enfants apres eux » au panier, derouler le tunnel, confirmer, et observer a nouveau

**Resultat attendu**

- Etape 2 : la modale s'ouvre bien. L'ajout sans passer par elle ne pose pas le drapeau de reliquat, la valeur venant de `confirmAdd(book.statut === 'en_reimp')` (`src/components/catalogue/BookCard.tsx:754`)
- Etape 3 : la mention de reliquat est presente sur la ligne du panier
- Etape 5 : un toast apparait, texte « 📧 Vous serez notifie par email des l'expedition des titres en reliquat. »
- Etape 6 : aucun toast de reliquat apres la confirmation de la commande de « Leurs enfants apres eux ». Le toast d'ajout au panier, lui, reste normal et ne doit pas etre confondu avec celui-ci

- [x] Verifie

---

### SMOKE-057 : Le message de succes differe entre FLOWDIFF et EDI

> ✅ **Ce qu'on verifie :**
> - En FLOWDIFF, l'ecran de succes annonce un recapitulatif par email
> - En EDI, il annonce l'accuse de reception Dilicom et affiche le statut EDI initial
> - Les 2 modes offrent la meme action principale et le meme lien vers l'historique. Seul le lien vers les echanges EDI est propre au mode EDI
> - Le branchement est du JSX conditionnel sur `localTransmission` (`CartPage.tsx:1212`), sans logique pure extractible

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Panier vide au depart

**Etapes**

1. Ajouter 1 titre disponible au panier, par exemple « Leurs enfants apres eux »
2. Derouler le tunnel jusqu'a l'etape « Mode de transmission », laisser « Envoyer via FlowDiff » et confirmer
3. Relever mot pour mot le texte de l'ecran de succes et le nombre de boutons
4. Ajouter de nouveau 1 titre au panier et derouler le tunnel jusqu'a la meme etape
5. Selectionner « Envoyer via EDI » (carte portant l'etiquette « Dilicom ») et confirmer
6. Relever mot pour mot le texte de l'ecran de succes et le nombre de boutons

**Resultat attendu**

- Etape 3, en FLOWDIFF :
  - titre « Commande envoyee ! »
  - « Votre commande a bien ete transmise via FlowDiff. Un recapitulatif vous sera envoye par email. »
  - la mention de demonstration
  - **1 seul bouton plein**, « Retour a l'accueil »
  - **1 lien souligne** sous le bouton, « Voir mes commandes », qui mene a `/historique`
  - aucune mention de Dilicom ni de statut EDI, et aucun lien vers les echanges EDI
- Etape 6, en EDI :
  - meme titre « Commande envoyee ! »
  - « Commande transmise via Dilicom (EDI). Vous recevrez un accuse de reception automatique. »
  - « Statut EDI initial : **En attente d'envoi** »
  - la mention de demonstration
  - **le meme bouton plein unique**, « Retour a l'accueil »
  - **2 liens soulignes**, « Voir mes commandes » puis « Voir les echanges EDI », qui menent a `/historique` et `/edi`
  - aucune mention de recapitulatif par email
- Dans les 2 modes : un seul element a l'aspect d'un bouton. Si 2 boutons pleins se font face, la hierarchie est cassee

- [x] Verifie

---

### SMOKE-058 : Les references de commande sont limitees a 35 caracteres

> ✅ **Ce qu'on verifie :**
> - Le champ « Ref. commande » (reference globale) refuse le 36e caractere
> - Le champ « Ref. » de chaque ligne refuse le 36e caractere
> - La valeur tronquee est bien celle enregistree sur la commande
> - La limite est portee par l'attribut HTML `maxLength={35}` (`CartPage.tsx:1505` pour la globale, `1584` pour la ligne). Aucun schema Zod ne la double, donc rien a tester en unitaire
> - La valeur 35 n'est pas arbitraire : c'est la longueur d'un segment de texte libre en EDIFACT, celle qui decoupe aussi les titres longs dans les messages ORDERS (FLOW-RM-090, LOT-11)

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- 1 titre disponible dans le panier, par exemple « Leurs enfants apres eux »
- Preparer une chaine de 40 caracteres, par exemple `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCD`, et savoir que ses 35 premiers caracteres sont `ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678`

**Etapes**

1. Aller sur `/panier`
2. Coller la chaine de 40 caracteres dans le champ « Ref. commande », en haut de la liste des titres
3. Compter les caracteres effectivement saisis, puis essayer d'en taper 1 de plus au clavier
4. Coller la meme chaine dans le champ « Ref. » de la ligne « Leurs enfants apres eux », sous le titre
5. Compter de nouveau les caracteres effectivement saisis
6. Derouler le tunnel et confirmer la commande
7. Aller sur `/historique`, ouvrir la commande et lire la reference de commande et la reference de ligne

**Resultat attendu**

- Etapes 2 et 3 : le champ contient exactement 35 caracteres, `ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678`. La frappe supplementaire n'ajoute rien, et aucun message d'erreur n'apparait, la limite etant silencieuse
- Etapes 4 et 5 : meme comportement sur la reference de ligne
- Etape 7 : la commande porte la reference globale tronquee a 35 caracteres, et la ligne « Leurs enfants apres eux » porte sa propre reference, elle aussi tronquee a 35. Les 2 references sont distinctes et ne se melangent pas

- [x] Verifie

---

### SMOKE-059 : Livraison standard ou date specifique, jamais dans le passe

> ✅ **Ce qu'on verifie :**
> - « Delai habituel (1-3 jours ouvres) » est le choix par defaut
> - Choisir « Date specifique » fait apparaitre un selecteur de date
> - Aucune date anterieure a aujourd'hui n'est selectionnable
> - Tant qu'aucune date n'est choisie, le bouton « Valider la commande » reste desactive
> - La contrainte est le `min={today}` passe au `DatePicker` (`CartPage.tsx:1741`), qui desactive les jours et les mois passes par `pointer-events: none`. Il n'y a ni validation metier ni message d'erreur a tester en unitaire

**Preconditions**

- Application lancee en local (`npm run dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- 1 titre disponible dans le panier, par exemple « Leurs enfants apres eux »
- Noter la date du jour

**Etapes**

1. Aller sur `/panier` et descendre jusqu'au bloc « Date de livraison »
2. Observer lequel des 2 boutons radio est coche a l'arrivee
3. Cocher « Date specifique » et observer ce qui apparait, ainsi que l'etat du bouton « Valider la commande »
4. Ouvrir le calendrier et essayer de cliquer sur un jour anterieur a aujourd'hui dans le mois courant
5. Revenir au mois precedent et essayer d'y cliquer sur un jour
6. Choisir une date posterieure a aujourd'hui, puis observer le bouton « Valider la commande »
7. Derouler le tunnel, confirmer, puis ouvrir la commande sur `/historique`

**Resultat attendu**

- Etape 2 : « Delai habituel (1-3 jours ouvres) » est coche, « Date specifique » ne l'est pas
- Etape 3 : un champ « Date souhaitee » apparait, vide, au format JJ/MM/AAAA. Le bouton « Valider la commande » est desactive tant que la date est vide
- Etape 4 : les jours anterieurs a aujourd'hui sont grises et ne repondent pas au clic. Le jour du jour, lui, reste selectionnable, la contrainte etant « a partir d'aujourd'hui » et non « apres aujourd'hui »
- Etape 5 : le mois precedent est entierement grise, aucun de ses jours ne repond au clic
- Etape 6 : la date choisie s'affiche au format JJ/MM/AAAA et le bouton « Valider la commande » redevient actif
- Etape 7 : la commande porte la date de livraison choisie. Avec le choix par defaut, elle n'en porte aucune, `deliveryDate` ne valant quelque chose que pour le mode `specific`

- [x] Verifie
