#!/usr/bin/env node
/*
  Redimensionne et recompresse les couvertures de public/covers/.

  Cible : hauteur 480 px, qualite 80. Le plus grand affichage du catalogue est
  160x240 (FicheProduitPage), donc 480 couvre le 2x des ecrans a haute densite.

  Deux garde-fous, parce que sips agrandit volontiers une image plus petite que
  la cible, ce qui ajoute des octets sans ajouter de detail :
    - on saute les images deja a la bonne hauteur ou plus petites ;
    - on ne remplace l'originale que si le resultat est reellement plus leger.

  Le script est donc idempotent : le relancer ne degrade pas les images deja
  traitees. Il depend de `sips`, fourni par macOS.
*/

import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, renameSync, rmSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const DOSSIER = 'public/covers'
const HAUTEUR_CIBLE = 480
const QUALITE = 80

function hauteurDe(fichier) {
  const sortie = execFileSync('sips', ['-g', 'pixelHeight', fichier], { encoding: 'utf8' })
  return Number(sortie.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
}

const temp = mkdtempSync(join(tmpdir(), 'covers-'))
const fichiers = readdirSync(DOSSIER).filter(f => f.toLowerCase().endsWith('.jpg'))

let octetsAvant = 0
let octetsApres = 0
let reduites = 0
let ignorees = 0

for (const nom of fichiers) {
  const chemin = join(DOSSIER, nom)
  const tailleAvant = statSync(chemin).size
  octetsAvant += tailleAvant

  if (hauteurDe(chemin) <= HAUTEUR_CIBLE) {
    octetsApres += tailleAvant
    ignorees++
    continue
  }

  const sortie = join(temp, nom)
  execFileSync('sips', [
    '-Z', String(HAUTEUR_CIBLE),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(QUALITE),
    chemin, '--out', sortie,
  ], { stdio: 'ignore' })

  const tailleApres = statSync(sortie).size
  if (tailleApres < tailleAvant) {
    renameSync(sortie, chemin)
    octetsApres += tailleApres
    reduites++
  } else {
    octetsApres += tailleAvant
    ignorees++
  }
}

rmSync(temp, { recursive: true, force: true })

const mo = o => (o / 1024 / 1024).toFixed(1)
const gain = Math.round(100 - (octetsApres * 100) / octetsAvant)
console.log(`${fichiers.length} couvertures : ${reduites} reduites, ${ignorees} laissees telles quelles`)
console.log(`${mo(octetsAvant)} Mo -> ${mo(octetsApres)} Mo (-${gain} %)`)
