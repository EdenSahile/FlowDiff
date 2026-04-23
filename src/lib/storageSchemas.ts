import { z } from 'zod'

/* ── StoredCart ── */

const cartItemSchema = z.object({
  book: z.object({ id: z.string() }).passthrough(),
  quantity: z.number().int().min(1),
}).passthrough()

export const storedCartSchema = z.object({
  items:    z.array(cartItemSchema).default([]),
  opGroups: z.array(z.unknown()).default([]),
})

/* ── StoredOrders (extras localStorage seulement — pas les mocks) ── */

const storedOrderSchema = z.object({
  id:               z.string(),
  numero:           z.string(),
  date:             z.string(),
  status:           z.enum(['en cours', 'reçu', 'facturé', 'expédié']),
  items:            z.array(z.unknown()),
  subtotalHT:       z.number(),
  remiseAmount:     z.number(),
  netHT:            z.number(),
  tva:              z.number(),
  totalTTC:         z.number(),
  adresseLivraison: z.string(),
  codeClient:       z.string(),
  deliveryMode:     z.enum(['standard', 'specific']),
}).passthrough()

export const storedOrdersSchema = z.array(storedOrderSchema)

/* ── StoredWishlists ── */

const storedWishlistSchema = z.object({
  id:        z.string(),
  name:      z.string(),
  items:     z.array(z.unknown()),
  createdAt: z.string(),
})

export const storedWishlistsSchema = z.array(storedWishlistSchema)
