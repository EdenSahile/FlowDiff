# Smoke tests manuels - LOT-04

> **Ces scenarios sont ecrits avant l'implementation (test-first).**
> **Ne les executer qu'une fois l'implementation terminee**, sur l'application lancee en local (`pnpm dev`).

---

## Catalogue : types, statuts et commandabilite

### Classification des titres

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-022 | 🟢 | Les 3 types de titres sont les seuls presents dans les donnees | aucun smoke, couvert en unitaire |
| FLOW-RM-023 | 🟢 | Les 4 univers sont les seuls presents dans les donnees | aucun smoke, couvert en unitaire |

### Statuts de stock et resolution

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-024 | 🟢 | Les 6 statuts de stock sont les seuls presents dans les donnees | aucun smoke, couvert en unitaire |
| FLOW-RM-025 | 🟢 | Les statuts sur_commande/en_reimp sont interdits pour les nouveautes | aucun smoke, couvert en unitaire |
| FLOW-RM-026 | 🟢 | Les titres a paraitre n'ont pas de statut de stock | aucun smoke, couvert en unitaire |

### Commandabilite et ajout au panier

| Regle | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| FLOW-RM-021 | 🟢 | `isOrderable` retourne `true` pour les 3 types dont a-paraitre | aucun smoke, couvert en unitaire |
| FLOW-RM-027 | 🟠 | Titre epuise/rupture : bouton desactive, grise, non cliquable | SMOKE-027 ci-dessous |
| FLOW-RM-028 | 🟠 | BookCard : ajout au panier d'un titre a paraitre via la popin de notes | SMOKE-028 ci-dessous |
| FLOW-RM-029 | 🟠 | BookCardRow : bouton actif pour a-paraitre, inactif pour epuise | SMOKE-029 ci-dessous |
| FLOW-RM-030 | 🟠 | Modale de confirmation pour sur_commande/en_reimp avant ajout | SMOKE-030 ci-dessous |

---

### SMOKE-027 : Titre epuise/rupture = bouton desactive

> ✅ **Ce qu'on verifie :**
> - Le bouton "Ajouter au panier" est visuellement grise et non cliquable pour un titre epuise ou en rupture
> - Le texte affiche est "Epuise" ou "Rupture" (selon le statut), pas "Ajouter au panier"
> - Le test unitaire verifie la presence dans le DOM ; le smoke confirme le rendu visuel reel dans le navigateur

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!

**Etapes**

1. Aller sur `/fonds` et chercher le titre **"La Carte postale"** d'Anne Berest (id `f-lit-berest`, statut `epuise`) ou **"Les Gratitudes"** de Delphine de Vigan (id `f-lit-vigan`, statut `rupture`)
2. Observer le bouton en bas de la BookCard
3. Cliquer sur le bouton

**Resultat attendu**

- Le bouton affiche "Epuise" (pour `f-lit-berest`) ou "Rupture" (pour `f-lit-vigan`) avec l'icone panier
- Le bouton a un fond gris (`gray.200`), un texte gris (`gray.400`) et un curseur `not-allowed`
- Le clic ne produit aucun effet : rien ne s'ajoute au panier, pas de toast, pas de popin
- Sous le bouton, une note en italique est visible : "Cet ouvrage n'est plus disponible" (epuise) ou "Temporairement indisponible" (rupture)
- Le selecteur de quantite (+/-) n'est pas visible

- [ ] Verifie

---

### SMOKE-028 : BookCard permet l'ajout d'un titre a paraitre

> ✅ **Ce qu'on verifie :**
> - Un titre a paraitre dispose d'un bouton "Ajouter au panier" actif dans la BookCard
> - Le clic ouvre une popin d'information ("Titre a paraitre", "Le titre sera enregistre en note"), puis le clic sur OK ajoute effectivement le titre au panier
> - Le test unitaire verifie l'ouverture de la popin dans le DOM ; le smoke confirme le parcours complet jusqu'a l'ajout reel au panier

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Panier vide ou note du contenu actuel

**Etapes**

1. Aller sur `/a-paraitre`
2. Trouver le titre **"Le Sillage de la baleine"** de Francisco Coloane (id `ap-lit-01`, type `a-paraitre`)
3. Cliquer sur le bouton "Ajouter au panier"
4. Dans la popin qui s'ouvre, cliquer sur "OK"

**Resultat attendu**

- Etape 3 : une popin modale s'affiche avec le titre "Titre a paraitre" et le texte "Le titre sera enregistre en note et conserve indefiniment"
- Etape 4 : la popin se ferme, un toast "Le Sillage de la baleine" ajoute au panier" apparait, le bouton passe temporairement a "Ajoute au panier" (fond vert) pendant ~2 secondes
- En allant sur `/panier`, le titre est bien present dans le recapitulatif

- [ ] Verifie

---

### SMOKE-029 : BookCardRow autorise l'ajout pour a-paraitre, bloque pour epuise

> ✅ **Ce qu'on verifie :**
> - Dans le composant BookCardRow, les controles de commande (checkbox Select, champ Qty, bouton AM, etoile liste) sont visibles pour un titre a paraitre
> - Ces memes controles sont absents pour un titre epuise ou en rupture
> - Le test unitaire verifie la presence/absence dans le DOM ; le smoke confirme visuellement dans le navigateur

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- **Le composant BookCardRow doit etre integre dans une page de l'application** (voir point remonte ci-dessous)

**Etapes**

1. Naviguer vers une page affichant un BookCardRow avec un titre a paraitre (ex. `ap-lit-01`, "Le Sillage de la baleine")
2. Observer la barre de commande (OrderBar) en bas du composant
3. Naviguer vers une page affichant un BookCardRow avec un titre epuise (ex. `f-lit-berest`, "La Carte postale", statut `epuise`)
4. Observer la barre de commande

**Resultat attendu**

- Etape 2 : la barre de commande affiche le statut "A paraitre" a gauche et les controles a droite (checkbox Select, champ Qty, bouton AM, etoile)
- Etape 4 : la barre de commande affiche le statut du stock mais les controles a droite (Select, Qty, AM, etoile) sont absents

**Point remonte** : BookCardRow n'est importe par aucune page de l'application (`src/pages/`). Ce scenario ne sera pas executable tant que le composant n'est pas integre dans une vue. Si l'integration est prevue dans un autre lot, ajuster les etapes pour indiquer la page concernee.

- [ ] Verifie

---

### SMOKE-030 : Modale de confirmation pour sur_commande/en_reimp

> ✅ **Ce qu'on verifie :**
> - Pour un titre avec le statut `sur_commande` ou `en_reimp`, le clic sur "Ajouter au panier" ouvre une modale de confirmation au lieu d'ajouter directement
> - La confirmation dans la modale ajoute bien le titre au panier
> - Le test unitaire verifie l'apparition de la modale dans le DOM ; le smoke confirme l'interaction complete dans le navigateur

**Preconditions**

- Application lancee en local (`pnpm dev`)
- Connecte avec le compte LIB001 / marie.lecomte@librairie-lira.fr / Libraire123!
- Panier vide ou note du contenu actuel

**Etapes (sur_commande)**

1. Aller sur `/fonds` et chercher le titre **"La Tresse"** de Laetitia Colombani (id `f-lit-colombani`, statut `sur_commande`)
2. Cliquer sur le bouton "Ajouter au panier"
3. Observer la modale qui s'ouvre
4. Cliquer sur "Confirmer la commande"

**Resultat attendu (sur_commande)**

- Etape 3 : une modale s'affiche avec le titre "Titre disponible sur commande speciale" et le message "Cet ouvrage n'est pas en stock. Il sera commande specialement aupres de l'editeur. Delai estime : 7 a 15 jours ouvres."
- Les 2 boutons visibles sont "Confirmer la commande" et "Annuler"
- Etape 4 : la modale se ferme, un toast confirme l'ajout, le titre est present dans `/panier`

**Etapes (en_reimp)**

1. Aller sur `/fonds` et chercher le titre **"Serotonine"** de Michel Houellebecq (id `f-lit-houellebecq`, statut `en_reimp`)
2. Cliquer sur le bouton "Ajouter au panier"
3. Observer la modale qui s'ouvre
4. Cliquer sur "Ajouter en reliquat"

**Resultat attendu (en_reimp)**

- Etape 3 : une modale s'affiche avec le titre "Titre en reimpression" et le message "Cet ouvrage est en cours de reimpression. Il sera enregistre en reliquat et expedie automatiquement des sa disponibilite. Vous recevrez un email de confirmation a l'expedition."
- Les 2 boutons visibles sont "Ajouter en reliquat" et "Annuler"
- Etape 4 : la modale se ferme, un toast confirme l'ajout, le titre est present dans `/panier`

- [ ] Verifie (sur_commande)
- [ ] Verifie (en_reimp)
