# Strategie de test

Ce document decrit **ce qu'il faut tester, comment le tester et quand le tester**. Il dit aussi a quel moment les subagents `unit-test-writer` et `smoke-test-writer`, ainsi que le skill `write-code`, s'appliquent, et a quel moment non.

| Question | Reponse |
|---|---|
| **Que** faut-il tester ? | les regles metier du ticket |
| **Comment** ? | test unitaire automatise 🟢, smoke test manuel 🔴, ou les deux 🟠 |
| **Quand** ? | avant le code, toujours |

Le "que" et le "quand" tiennent en une section chacun. Tout le reste du document detaille le "comment", parce que c'est le seul des 3 qui se retranche ticket par ticket.

## Que faut-il tester ?

**Les tests se derivent des regles metier du ticket, jamais du code existant.** Le ticket dit ce que le systeme doit faire ; c'est lui la source, et il n'y a pas d'autre inventaire a chercher. Un test qui ne remonte a aucune regle du ticket n'a rien a verifier.

Corollaire : **on peut ecrire les tests avant que la moindre ligne de code existe**, puisque la spec est deja tranchee dans le ticket. C'est ce qui rend le test-first possible ici, et c'est pour ca que tout ce document parle de tests ecrits avant l'implementation.

## L'idee principale

Ne pas partir par reflexe sur "j'ecris d'abord des tests unitaires, puis j'implemente pour les faire passer". C'est le cas le plus **frequent**, pas la regle universelle. Certaines regles ne se testent pas en unitaire, les forcer dans ce moule fait ecrire des tests qui mockent exactement ce qu'on voulait verifier.

Donc, une seule question de tri : **cette regle est-elle testable en unitaire, ou non ?** La reponse peut etre "les deux a la fois", c'est le troisieme etat, 🟠 (voir plus bas).

## Pourquoi ce tri, et pas des niveaux de test

Le niveau d'un test est un **niveau de zoom** : le test unitaire regarde une fonction, le end-to-end regarde le parcours complet, et le test d'integration se situe entre les deux. Reconnaitre un bon d'un mauvais test a ce niveau de zoom, les mettre en place, les brancher en CI/CD, est tout un savoir-faire en soi que ce document ne couvre pas.

Ici, on garde les niveaux et on abandonne leur **automatisation** systematique. Automatiser un zoom plus large demande un environnement complet a monter et a maintenir, et ce cout ne disparait pas parce que l'IA ecrit les tests.

On automatise donc **le test unitaire**, le moins couteux a faire tourner, et tout ce qui demande un zoom plus large se **verifie a la main**, sous forme de smoke. On y perd la non-regression : un smoke passe aujourd'hui ne previent de rien dans 6 mois.

> La profondeur (les niveaux integration / e2e, bons vs mauvais tests, la mise en place, la CI/CD) est **hors perimetre ici**, chaque projet la traite selon sa propre maturite.

## La question de tri, par paquet de regles

Pour chaque regle (on suit le decoupage du ticket) : **testable en unitaire ?** Trois verdicts possibles :

- **🟢 Oui** : test unitaire **automatise**, ecrit en **test-first** : test rouge d'abord, puis implementation jusqu'au vert.
- **🔴 Non** : **verification manuelle** (smoke) : le scenario s'ecrit avant l'implementation (subagent `smoke-test-writer`, fichier `testing/smokes-<TICKET_ID>.md`), puis s'execute a la main apres.
- **🟠 Partiel** : **les deux**. Le test unitaire couvre une tranche precise (notre logique) mais laisse une tranche reelle, distincte, qu'aucune ligne manuelle ne couvre deja : typiquement un mapping qui mocke une **forme d'erreur de la dependance** qu'aucun smoke ne vient confirmer. Un 🟠 = une ligne unitaire (test-first) **plus** un smoke manuel a ajouter.

## Comment savoir si c'est unitaire

La question a se poser : **qu'est-ce que je verifie exactement ?**

- **Du code a moi** : une transformation, un calcul, une decision, une validation. Meme s'il appelle une dependance externe, on la **mocke** et on teste la logique autour -> **unitaire**.
- **Le comportement reel d'une dependance et son branchement** : le compte se cree vraiment, la donnee se pose, une contrainte de la base rejette le doublon. Le mocker reviendrait a mocker exactement ce qu'on teste -> **pas unitaire, verification manuelle**.

Presence d'une dependance externe ≠ non-testable en unitaire. Ce qui rend non-unitaire, c'est que **le comportement sous test est celui de la dependance elle-meme**, pas une logique a nous.

## Definitions

- **Test unitaire** : isole une fonction / un module, dependances externes mockees, tourne en memoire, deterministe et rapide.
- **Verification manuelle (smoke)** : un humain execute le parcours a la main (appel d'API, action dans l'interface) et verifie que le parcours critique tient debout. "Smoke" = grossier, on regarde juste si ca marche du tout, pas une suite exhaustive.

## Exemple applique, une to-do list

L'exemple est volontairement pris **en dehors de tout projet precis** : la doctrine vaut pour n'importe quelle base de code, et l'illustrer avec un ticket reel donnerait son tri deja fait.

Le ticket decoupe la fonctionnalite en paquets de regles. Chaque regle est classee sur les trois etats :

| Paquet de regles (ticket) | Ce qu'on verifie | Verdict | Comment |
|---|---|---|---|
| Creation d'une tache | titre obligatoire et <= 200 caracteres, validation (🟢) ; la tache est reellement ecrite en base et ressort avec son id (🔴) | 🟢 / 🔴 | Unitaire test-first + manuel |
| Titre unique dans une liste | normalisation du titre avant comparaison (🟢) ; mapping d'une erreur de contrainte d'unicite vers un code d'erreur metier, dont la forme mockee n'est confirmee par aucun smoke (🟠) ; la contrainte d'unicite qui arbitre 2 creations en concurrence (🔴) | 🟢 / 🟠 / 🔴 | Unitaire test-first + smoke + manuel |
| Rappel envoye a l'echeance | la date de declenchement calculee a partir de l'echeance et du fuseau (🟢) ; mapping d'un refus du service d'emailing, forme d'erreur mockee qu'aucun smoke ne confirme (🟠) ; l'email part vraiment et le service l'accepte (🔴) | 🟢 / 🟠 / 🔴 | Unitaire test-first + smoke + manuel |
| Compteur de taches restantes | le calcul du nombre de taches non terminees | 🟢 | Unitaire, test-first |

Les 2 🟠 ne sont pas le meme cas : le premier mocke la forme d'une erreur de la **base**, le second celle d'une erreur d'un **service tiers**. Dans les deux, le test unitaire couvre notre mapping et laisse dehors une tranche reelle qu'aucun smoke ne couvre deja, d'ou le smoke a ajouter.

A retenir : un meme paquet de regles peut melanger les trois etats. On ne classe pas "pour le paquet", on classe **par ce qu'on verifie**, regle par regle.
