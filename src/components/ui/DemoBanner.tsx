import styled from 'styled-components'
import { mq } from '@/lib/responsive'

const BannerWrap = styled.aside`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  background: ${({ theme }) => theme.colors.accentLight};
  border-bottom: 1px solid rgba(201, 168, 76, 0.35);
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
  white-space: normal;
  flex-shrink: 0;

  ${mq.md} {
    height: ${({ theme }) => theme.layout.demoBannerHeight};
    padding: 0 16px;
    font-size: 11.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
`

export function DemoBanner() {
  return (
    <BannerWrap role="note" aria-label="Site de démonstration">
      <Dot aria-hidden="true" />
      Site de démonstration — Toutes les données affichées sont fictives et créées à des fins pédagogiques uniquement.
    </BannerWrap>
  )
}
