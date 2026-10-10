import { describe, it, expect } from 'vitest'
import { getPageName, isFeedbackValid } from '@/components/ui/FeedbackWidget'

describe('getPageName', () => {
  it("retourne 'Accueil' pour /", () => {
    expect(getPageName('/')).toBe('Accueil')
  })

  it("retourne 'Nouveautés' pour /nouveautes", () => {
    expect(getPageName('/nouveautes')).toBe('Nouveautés')
  })

  it("retourne 'Fonds' pour /fonds", () => {
    expect(getPageName('/fonds')).toBe('Fonds')
  })

  it("retourne 'Top Ventes' pour /top-ventes", () => {
    expect(getPageName('/top-ventes')).toBe('Top Ventes')
  })

  it("retourne 'Sélections' pour /selections", () => {
    expect(getPageName('/selections')).toBe('Sélections')
  })

  it("retourne 'Flash Infos' pour /flash-infos", () => {
    expect(getPageName('/flash-infos')).toBe('Flash Infos')
  })

  it("retourne 'Panier' pour /panier", () => {
    expect(getPageName('/panier')).toBe('Panier')
  })

  it("retourne 'Mon Compte' pour /mon-compte", () => {
    expect(getPageName('/mon-compte')).toBe('Mon Compte')
  })

  it("retourne 'Historique' pour /historique", () => {
    expect(getPageName('/historique')).toBe('Historique')
  })

  it("retourne 'Fiche produit' pour une URL avec sous-chemin /produit/", () => {
    expect(getPageName('/produit/978-2-07-036822-8')).toBe('Fiche produit')
  })

  it("retourne 'Page inconnue' pour une route non reconnue", () => {
    expect(getPageName('/xyz-inconnu')).toBe('Page inconnue')
  })
})

describe('isFeedbackValid', () => {
  it('accepte une chaîne vide', () => {
    expect(isFeedbackValid('')).toBe(true)
  })

  it('accepte un message court', () => {
    expect(isFeedbackValid('court')).toBe(true)
  })

  it('accepte un message de longueur normale', () => {
    expect(isFeedbackValid('Ce site est très bien fait !')).toBe(true)
  })

  it('refuse un message trop long (> 500 caractères)', () => {
    expect(isFeedbackValid('a'.repeat(501))).toBe(false)
  })

  it('accepte un message de 500 caractères exactement', () => {
    expect(isFeedbackValid('a'.repeat(500))).toBe(true)
  })
})
