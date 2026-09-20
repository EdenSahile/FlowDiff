import { useEffect, useRef } from 'react'
import { createGlobalStyle } from 'styled-components'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useNavigate, useLocation } from 'react-router-dom'

/* ── Driver.js style overrides — navy/or cohérent avec le design ── */
const DriverOverride = createGlobalStyle`
  .driver-popover {
    background: #2D3A4A !important;
    border: 1px solid rgba(212,168,67,0.25) !important;
    border-radius: 12px !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2) !important;
    min-width: 340px !important;
    max-width: 440px !important;
    padding: 20px !important;
  }

  .driver-popover * {
    font-family: 'Open Sans', Arial, sans-serif !important;
  }

  .driver-popover-title {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: #D4A843 !important;
    letter-spacing: 0.01em !important;
    line-height: 1.3 !important;
    margin-bottom: 0 !important;
  }

  .driver-popover-title[style*="block"] + .driver-popover-description {
    margin-top: 8px !important;
  }

  .driver-popover-description {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: rgba(255,255,255,0.80) !important;
    line-height: 1.6 !important;
  }

  .driver-popover-footer {
    margin-top: 16px !important;
    padding-top: 12px !important;
    border-top: 1px solid rgba(255,255,255,0.08) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  .driver-popover-progress-text {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: rgba(255,255,255,0.75) !important;
    letter-spacing: 0.05em !important;
    min-width: 36px !important;
    text-align: left !important;
  }

  .driver-popover-navigation-btns {
    display: flex !important;
    gap: 6px !important;
    flex-grow: 0 !important;
  }

  .driver-popover-footer button {
    font-size: 12px !important;
    font-weight: 600 !important;
    padding: 7px 16px !important;
    border-radius: 6px !important;
    border: 1.5px solid rgba(212,168,67,0.6) !important;
    background: #D4A843 !important;
    color: #2D3A4A !important;
    text-shadow: none !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    transition: background 0.15s !important;

    &:hover, &:focus {
      background: #E0B84A !important;
    }
  }

  .driver-popover-prev-btn {
    background: transparent !important;
    border-color: rgba(255,255,255,0.18) !important;
    color: rgba(255,255,255,0.55) !important;

    &:hover, &:focus {
      background: rgba(255,255,255,0.08) !important;
      color: rgba(255,255,255,0.85) !important;
    }
  }

  .driver-popover-close-btn {
    color: rgba(255,255,255,0.30) !important;
    font-size: 18px !important;
    top: 0 !important;
    right: 0 !important;

    &:hover, &:focus {
      color: rgba(255,255,255,0.80) !important;
      background: transparent !important;
    }
  }

  .driver-popover-arrow {
    border-color: #2D3A4A !important;
  }

  .driver-popover-arrow-side-top {
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    border-left-color: transparent !important;
  }

  .driver-popover-arrow-side-bottom {
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
  }

  .driver-popover-arrow-side-left {
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    border-top-color: transparent !important;
  }

  .driver-popover-arrow-side-right {
    border-left-color: transparent !important;
    border-bottom-color: transparent !important;
    border-top-color: transparent !important;
  }

  .driver-tour-skip {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.18) !important;
    color: rgba(255,255,255,0.45) !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    padding: 7px 12px !important;
    border-radius: 5px !important;
    cursor: pointer !important;
    font-family: 'Open Sans', sans-serif !important;
    transition: color 0.15s, border-color 0.15s !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;

    &:hover {
      color: rgba(255,255,255,0.7) !important;
      border-color: rgba(255,255,255,0.35) !important;
    }
  }
`

const TOUR_STEPS = [
  {
    element: '#tour-search',
    popover: {
      title: 'Recherche',
      description: 'Recherchez un titre, auteur ou ISBN directement ici.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#tour-actions',
    popover: {
      title: 'Actions en attente',
      description: 'Vos alertes prioritaires : offices à valider, commandes à vérifier, erreurs EDI.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#tour-dashboard',
    popover: {
      title: 'Tableau de bord',
      description: 'Suivez vos indicateurs clés : commandes passées, montants, taux de rupture.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#tour-catalogue',
    popover: {
      title: 'Catalogue',
      description: 'Parcourez le catalogue par fonds, nouveautés ou sélections.',
      side: 'right' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#tour-cart',
    popover: {
      title: 'Panier',
      description: 'Votre panier en cours, accessible à tout moment depuis l\'en-tête.',
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '#tour-edi',
    popover: {
      title: 'EDI',
      description: 'Gérez vos flux EDI avec vos distributeurs ici.',
      side: 'right' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#tour-nouveautes',
    popover: {
      title: 'Nouveautés du mois',
      description: 'Découvrez chaque mois les nouvelles parutions disponibles à la commande.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
]

type DriverInstance = ReturnType<typeof driver>

export function OnboardingTour() {
  const { isDone, shouldStart, markDone } = useOnboarding()
  const driverRef = useRef<DriverInstance | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isDoneRef = useRef(isDone)
  const locationRef = useRef(location)
  useEffect(() => {
    isDoneRef.current = isDone
    locationRef.current = location
  })

  function launchDriver() {
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
    }

    const driverObj = driver({
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      allowClose: true,
      steps: TOUR_STEPS,
      onDestroyed: () => {
        markDone()
        driverRef.current = null
      },
      onPopoverRender: (popover) => {
        const skipBtn = document.createElement('button')
        skipBtn.textContent = 'Passer le tour'
        skipBtn.className = 'driver-tour-skip'
        skipBtn.addEventListener('click', () => driverObj.destroy())
        popover.footerButtons.prepend(skipBtn)
      },
    })

    driverRef.current = driverObj

    if (locationRef.current.pathname !== '/') {
      navigate('/')
      setTimeout(() => driverObj.drive(), 600)
    } else {
      setTimeout(() => driverObj.drive(), 300)
    }
  }

  /* Démarrage manuel via resetTour() / startTour() */
  useEffect(() => {
    if (shouldStart) {
      launchDriver()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStart])

  /* Cleanup au démontage définitif */
  useEffect(() => {
    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  return <DriverOverride />
}
