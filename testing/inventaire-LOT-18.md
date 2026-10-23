# Inventaire LOT-18 : utilitaires et schemas transverses

> 12 regles au lot, plus 1 ouverte par cet inventaire (FLOW-RM-135). 11 sont du code pur et exporte, donc entierement unitaires. 2 sont hors du build actif.
>
> Particularite du lot : il ne part pas de zero. Les 4 modules ont deja 51 tests. Le travail porte sur la completude, pas sur la creation.

### Regles export CSV

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-123 | Export CSV : BOM UTF-8 en tete de fichier | :green_circle: | `exportToCSV` (`csv.ts:10`) n'a pas de valeur de retour, elle construit un `Blob` et declenche un clic. Le contenu reste observable en espionnant le constructeur `Blob`, technique deja en place dans `csv.test.ts:25` | Unitaire, espion sur `global.Blob` |
| FLOW-RM-124 | Export CSV : separateur point-virgule | :green_circle: | Meme mecanisme. Le separateur est une constante locale, le comportement s'observe sur le contenu du `Blob` | Unitaire, espion sur `global.Blob` |
| FLOW-RM-125 | Export CSV : echappement des guillemets doubles | :green_circle: | La fonction `escape` n'est pas exportee, mais son effet est observable sur le contenu produit | Unitaire, espion sur `global.Blob` |
| FLOW-RM-126 | `buildDashboardCSV` : mapping des statuts | :green_circle: | Fonction exportee (`exportCSV.ts:24`) qui renvoie une chaine. Aucun DOM, aucune dependance externe. Le cas le plus simple du lot | Unitaire, assertion directe sur la chaine |

### Regles schemas de storage

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-127 | `storedCartSchema` : quantite >= 1 et entiere, `book.id` requis | :green_circle: | Schema Zod exporte (`storageSchemas.ts:10`). `safeParse` sur un objet litteral, rien a monter | Unitaire, `safeParse` |
| FLOW-RM-128 | `storedOrdersSchema` : `status` et `deliveryMode` limites a leurs valeurs | :green_circle: | Schema Zod exporte (`storageSchemas.ts:35`) | Unitaire, `safeParse` |
| FLOW-RM-129 | `storedWishlistsSchema` : `id`, `name`, `createdAt` requis | :green_circle: | Schema Zod exporte (`storageSchemas.ts:46`) | Unitaire, `safeParse` |

### Regles schemas de formulaires

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-130 | `contactSchema` : sujet 2-200, message 10-2000, les 2 trimes | :green_circle: | Schema Zod exporte (`formSchemas.ts:4`) | Unitaire, `safeParse` |
| FLOW-RM-131 | `newsletterSchema` : email valide, au moins 1 newsletter | :green_circle: | Schema Zod exporte (`formSchemas.ts:9`) | Unitaire, `safeParse` |
| FLOW-RM-132 | `cartQtySchema` : entier entre 1 et `CART_LIMIT` | :green_circle: | Schema Zod exporte (`formSchemas.ts:20`). Importe `CART_LIMIT` depuis `CartContext`, un simple `export const` sans dependance au provider | Unitaire, `safeParse` |

### Regles hors du build actif

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-133 | Feedback widget : limite 500 caracteres | :no_entry: | Le composant est dans `parked/feedback/`, hors du build et hors de `tsconfig.json`. Il n'y a rien a tester tant qu'il n'est pas rebranche | Reporte, aucun test |
| FLOW-RM-134 | Feedback widget : detection automatique du nom de page | :no_entry: | Idem | Reporte, aucun test |

---

## Ce que couvrent deja les tests existants

51 tests repartis sur 4 fichiers. Le tableau liste, regle par regle, ce qui manque.

| Fichier | Regles visees | Trous constates |
|---|---|---|
| `csv.test.ts`, 4 tests | FLOW-RM-123, 124, 125 | Une valeur contenant le separateur `;` n'est pas testee, alors que c'est le cas d'echappement qui casse le plus souvent un CSV francais. Une valeur contenant un retour a la ligne non plus. Le nom du fichier telecharge n'est jamais verifie : le 1er test controle seulement que le clic a eu lieu, donc l'ajout de l'extension `.csv` quand elle manque n'est couvert par rien. Le separateur de lignes CRLF n'est pas verifie |
| `exportCSV.test.ts`, 7 tests | FLOW-RM-126 | `buildKPIOnlyCSV` (`exportCSV.ts:65`) est exportee, pure, et n'a **aucun** test. C'est la 2e fonction pure du module. Elle doit produire le bloc KPI sans la section « Detail des commandes » |
| `storageSchemas.test.ts`, 19 tests | FLOW-RM-127, 128, 129 | `opGroups` absent doit valoir `[]` par defaut, seul le defaut de `items` est teste. Les champs optionnels `transmissionMode` et `ediStatus` ne sont jamais testes, ni en valeur valide ni en valeur refusee. `storedOrdersSchema` et `storedWishlistsSchema` attendent un tableau, un objet seul doit etre refuse, ce n'est pas teste |
| `formSchemas.test.ts`, 21 tests | FLOW-RM-130, 131, 132 | Les bornes exactes ne sont testees que du cote refus : 201 et 2001 caracteres sont refuses, mais 2, 200, 10 et 2000 ne sont jamais acceptes explicitement. Le trim de `contactSchema` est teste par un cas qui passerait aussi sans trim, il ne prouve rien. Le trim de l'email de `newsletterSchema` et celui de `wishlistNameSchema` ne sont pas testes du tout, ni sur l'acceptation ni sur la valeur de sortie |

Les decomptes annonces par `lots-flowdiff.md` sont justes pour les schemas de storage : 7 + 6 + 6 = 19, c'est bien ce que contient le fichier.

**En revanche le lot oublie un schema.** `wishlistNameSchema` (`formSchemas.ts:14`) est exporte, utilise, et couvert par 5 tests, mais il ne porte aucun identifiant FLOW-RM : les regles 130, 131 et 132 couvrent `contactSchema`, `newsletterSchema` et `cartQtySchema`, pas celui-la. Sa regle, « nom de liste trime, 1 a 50 caracteres », n'est donc tracee nulle part dans la matrice. 134 etant le dernier identifiant utilise, elle est traitee ici sous **FLOW-RM-135**, a reporter dans `lots-flowdiff.md` et dans la matrice de tracabilite.

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-135 | `wishlistNameSchema` : nom trime, 1 a 50 caracteres | :green_circle: | Schema Zod exporte (`formSchemas.ts:14`) | Unitaire, `safeParse` |

## Pieges a signaler

1. **Le trim de `newsletterSchema` etait casse. Confirme par le test, corrige.** `formSchemas.ts:10` ecrivait `z.string().email().trim().toLowerCase()`, dans cet ordre : Zod applique les etapes dans l'ordre d'ecriture, donc la validation d'email tombait **avant** le retrait des espaces. Un email saisi avec une espace parasite etait refuse au lieu d'etre nettoye. Le test ecrit depuis la regle attendue a echoue au 1er passage, ce qui a confirme le bug ; l'ordre est passe a `.trim().toLowerCase().email()`.

   **Le meme defaut existait dans `src/lib/authUtils.ts`**, sur `registerSchema` et `forgotPasswordSchema`. Hors perimetre du LOT-18, ces 2 schemas relevent des LOT-01 et 02, mais la correction a ete demandee et faite dans la meme branche. Un 3e cas a ete trouve a cette occasion : `loginSchema.identifier` ecrivait `.min(1).trim()`, donc un identifiant fait uniquement d'espaces passait la validation avant de devenir une chaine vide. Les 3 sont corriges et couverts par 6 tests, dans un commit separe de celui du lot.

   **Lecon a retenir au-dela de ces cas** : dans un schema Zod, toute etape de nettoyage (`.trim()`, `.toLowerCase()`, `.toUpperCase()`) doit s'ecrire **avant** les validations qui portent sur la valeur nettoyee (`.min()`, `.max()`, `.email()`, `.regex()`). Zod applique les etapes dans l'ordre d'ecriture, et l'inverse produit un refus sur une saisie valide, ou l'acceptation d'une valeur qui deviendra vide.

   **Balayage complet effectue** : les 4 fichiers qui importent Zod dans `src/` ont ete passes en revue (`authUtils.ts`, `formSchemas.ts`, `storageSchemas.ts`, `checkoutSchemas.ts`). 7 champs portaient ce defaut, repartis sur 4 schemas, tous corriges et couverts :

   | Schema | Fichier | Champs corriges |
   |---|---|---|
   | `newsletterSchema` | `src/lib/formSchemas.ts` | `email` |
   | `registerSchema` | `src/lib/authUtils.ts` | `email` |
   | `forgotPasswordSchema` | `src/lib/authUtils.ts` | `email` |
   | `loginSchema` | `src/lib/authUtils.ts` | `identifier` |
   | `addressSchema` | `src/pages/cart/checkoutSchemas.ts` | `rue`, `codePostal`, `ville` |

   Restent sains : `storageSchemas.ts` (aucune chaine a nettoyer, ce sont des schemas de relecture de localStorage), `transmissionSchema` (un `enum`), `contactSchema`, `wishlistNameSchema` et `cartQtySchema` (ordre deja correct), et le `codeClient` de `registerSchema`, corrige avant cette session par le commit `9302fd1`.
2. **`storedWishlistSchema` n'est pas en `passthrough`**, contrairement a `cartItemSchema` et `storedOrderSchema`. Les cles inconnues d'une liste sont donc silencieusement supprimees a la relecture du localStorage. **Verifie, sans consequence aujourd'hui** : l'interface `Wishlist` (`WishlistContext.tsx:12`) ne declare que `id`, `name`, `items` et `createdAt`, les 4 champs que le schema valide, et `items` est un `z.array(z.unknown())` qui laisse passer le detail de chaque item. Rien de reel n'est perdu. Un test verrouille cette traversee sans perte, pour que l'ajout futur d'un champ a `Wishlist` fasse apparaitre le probleme.
3. **2 fonctions d'echappement coexistent** : `escape` dans `csv.ts:4` et `cell` dans `exportCSV.ts:17`. Meme regle, 2 implementations. Les tester separement, et ne pas supposer que corriger l'une corrige l'autre.
4. **Les 8 fonctions `export*CSV` de `exportCSV.ts` ne renvoient rien** et partagent la meme coquille DOM (`Blob`, `createObjectURL`, `a.click()`). Elles sont hors perimetre : leur coquille est deja couverte par les tests de `csv.ts`, et les tester une par une n'apporterait que de la redondance.

---

## Recap

**Unitaire automatise** : les 10 regles FLOW-RM-123 a 132, plus FLOW-RM-135 ouverte par cet inventaire. Toutes ont deja des tests, aucune n'est complete. Le travail consiste a ajouter les cas manquants listes plus haut, pas a reecrire l'existant.

**Couverture partielle (unitaire + smoke)** : aucune. Le lot ne contient aucune regle qui demande un oeil humain : tout est du code pur ou observable par espion.

**Verification manuelle** : aucune. Donc **pas de fichier `smokes-LOT-18.md`**, contrairement aux autres lots.

**Reporte** : FLOW-RM-133 et 134, le FeedbackWidget etant parque hors du build.
