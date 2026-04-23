import { z } from 'zod'
import { CART_LIMIT } from '@/contexts/CartContext'

export const contactSchema = z.object({
  sujet:   z.string().trim().min(2, 'Sujet trop court (2 caractères min.)').max(200, 'Sujet trop long (200 caractères max.)'),
  message: z.string().trim().min(10, 'Message trop court (10 caractères min.)').max(2000, 'Message trop long (2000 caractères max.)'),
})

export const newsletterSchema = z.object({
  email:    z.string().email('Adresse email invalide').trim().toLowerCase(),
  selected: z.array(z.string()).min(1, 'Choisissez au moins une newsletter'),
})

export const wishlistNameSchema = z
  .string()
  .trim()
  .min(1, 'Le nom ne peut pas être vide')
  .max(50, 'Nom trop long (50 caractères max.)')

export const cartQtySchema = z
  .number()
  .int()
  .min(1, 'Quantité minimum : 1')
  .max(CART_LIMIT, `Quantité maximum : ${CART_LIMIT}`)
