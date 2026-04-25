import styled, { css } from 'styled-components'

const bannerBase = css`
  position: fixed;
  left: 0;
  right: 0;
  z-index: 98;
  height: ${({ theme }) => theme.layout.demoBannerHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.accentLight};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BannerTop = styled.aside`
  ${bannerBase}
  top: ${({ theme }) => theme.layout.mobileHeaderHeight};
  border-bottom: 1px solid rgba(201, 168, 76, 0.35);

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: ${({ theme }) => theme.layout.headerHeight};
    left: ${({ theme }) => theme.layout.sidebarWidth};
  }
`

const BannerBottom = styled.aside`
  ${bannerBase}
  bottom: 0;
  border-top: 1px solid rgba(201, 168, 76, 0.35);
`

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
`

interface DemoBannerProps {
  position?: 'top' | 'bottom'
}

export function DemoBanner({ position = 'top' }: DemoBannerProps) {
  const Banner = position === 'bottom' ? BannerBottom : BannerTop
  return (
    <Banner role="note" aria-label="Site de démonstration">
      <Dot aria-hidden="true" />
      Site de démonstration — Toutes les données affichées sont fictives et créées à des fins pédagogiques uniquement.
    </Banner>
  )
}
