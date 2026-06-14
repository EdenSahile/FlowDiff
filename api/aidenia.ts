import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

// ─── Base de connaissance statique ────────────────────────────────────────────

const STATIC_KNOWLEDGE = {
  horaires: 'Du lundi au vendredi, 9h-18h',
  contact: 'contact@flowdiff.fr',
  delai_livraison: '48h en France métropolitaine',
  politique_retour: 'Retours acceptés sous 30 jours avec bon de retour',
  remise_standard: '40% sur le prix public éditeur',
}

const STATIC_KNOWLEDGE_TEXT = Object.entries(STATIC_KNOWLEDGE)
  .map(([k, v]) => `${k} : ${v}`)
  .join('\n')

// ─── Parsing du mock token (Buffer côté Node, pas atob) ───────────────────────

interface MockPayload {
  sub: string
  codeClient: string
  iat: number
  exp: number
}

function parseMockToken(token: string): MockPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8')) as MockPayload
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// ─── Classificateur de questions ─────────────────────────────────────────────

type QuestionType = 'livres' | 'commandes' | 'rag' | 'static'

function classify(message: string): QuestionType {
  const m = message.toLowerCase()
  if (/livre|disponib|catalogue|isbn|titre|auteur|série|tome|manga|bd|roman|stock/.test(m))
    return 'livres'
  if (/commande|facture|panier|statut|historique|paiement|cmd/.test(m))
    return 'commandes'
  // Tout le reste → RAG (Pinecone) avec fallback base statique
  return 'rag'
}

// ─── Supabase service-role client (server-side uniquement) ───────────────────

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// ─── Contexte selon le type de question ──────────────────────────────────────

async function buildContext(type: QuestionType, message: string, codeClient: string): Promise<string> {
  if (type === 'livres') {
    const supabase = getSupabaseAdmin()
    if (!supabase) return '[Catalogue non disponible — configuration Supabase manquante]'

    // Extrait des mots-clés pour la recherche
    const keywords = message
      .replace(/livre|disponible|est-ce que|trouver|cherche|avez-vous/gi, '')
      .trim()
      .slice(0, 60)

    const { data, error } = await supabase
      .from('livres')
      .select('titre, auteur, isbn, disponible, prix_ttc, editeur')
      .ilike('titre', `%${keywords}%`)
      .limit(5)

    if (error || !data?.length) {
      // Fallback : recherche sur l'auteur
      const { data: byAuthor } = await supabase
        .from('livres')
        .select('titre, auteur, isbn, disponible, prix_ttc, editeur')
        .ilike('auteur', `%${keywords}%`)
        .limit(5)

      if (!byAuthor?.length) return `Aucun livre trouvé pour "${keywords}" dans le catalogue.`
      return `Livres trouvés (recherche auteur) :\n${byAuthor.map(formatBook).join('\n')}`
    }

    return `Livres trouvés dans le catalogue :\n${data.map(formatBook).join('\n')}`
  }

  if (type === 'commandes') {
    const supabase = getSupabaseAdmin()
    if (!supabase) return '[Commandes non disponibles — configuration Supabase manquante]'

    const { data, error } = await supabase
      .from('commandes')
      .select('id, date, statut, montant_ht, montant_ttc, articles')
      .eq('code_client', codeClient)
      .order('date', { ascending: false })
      .limit(10)

    if (error || !data?.length) {
      return `Aucune commande trouvée pour le code client ${codeClient}.`
    }

    const lines = data.map((c) => {
      const date = new Date(c.date).toLocaleDateString('fr-FR')
      const articles = Array.isArray(c.articles)
        ? c.articles.map((a: Record<string, unknown>) => `${a.titre ?? a.isbn} (x${a.quantite ?? 1})`).join(', ')
        : '—'
      return `- ${date} | ${c.statut} | ${c.montant_ttc}€ TTC | Articles : ${articles}`
    })

    return `Dernières commandes du libraire (code client : ${codeClient}) :\n${lines.join('\n')}`
  }

  if (type === 'rag') {
    const openaiKey = process.env.OPENAI_API_KEY
    const pineconeKey = process.env.PINECONE_API_KEY
    const indexName = process.env.PINECONE_INDEX ?? 'flowdiff-docs'

    if (!openaiKey || !pineconeKey) {
      return `Informations disponibles (base statique) :\n${STATIC_KNOWLEDGE_TEXT}`
    }

    try {
      // 1. Vectorise la question
      const openai = new OpenAI({ apiKey: openaiKey })
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      })
      const vector = embeddingRes.data[0].embedding

      // 2. Cherche les 3 chunks les plus proches dans Pinecone
      const pc = new Pinecone({ apiKey: pineconeKey })
      const index = pc.index(indexName)
      const queryRes = await index.query({
        vector,
        topK: 3,
        includeMetadata: true,
      })

      if (!queryRes.matches?.length) {
        return `Informations disponibles (base statique) :\n${STATIC_KNOWLEDGE_TEXT}`
      }

      // 3. Construit le contexte depuis les chunks récupérés
      const chunks = queryRes.matches
        .map((m) => {
          const meta = m.metadata as { text?: string; source?: string; page?: number } | undefined
          if (!meta?.text) return null
          const ref = meta.source ? ` (${meta.source}${meta.page ? `, p.${meta.page}` : ''})` : ''
          return `${meta.text}${ref}`
        })
        .filter(Boolean)
        .join('\n\n---\n\n')

      return `Documents de référence :\n${chunks}`
    } catch (ragErr) {
      console.error('[Aidenia RAG]', ragErr)
      return `Informations disponibles (base statique) :\n${STATIC_KNOWLEDGE_TEXT}`
    }
  }

  // static
  return `Informations générales FlowDiff :\n${STATIC_KNOWLEDGE_TEXT}`
}

function formatBook(b: Record<string, unknown>): string {
  const dispo = b.disponible ? '✅ Disponible' : '❌ Indisponible'
  return `- "${b.titre}" de ${b.auteur} (ISBN ${b.isbn}) — ${dispo} — ${b.prix_ttc}€ TTC — Éditeur : ${b.editeur}`
}

// ─── Prompt système Aidénia ───────────────────────────────────────────────────

function buildSystemPrompt(context: string): string {
  return `Tu es Aidénia, l'assistante IA de FlowDiff.
Tu aides les libraires à gérer leurs commandes, factures et à trouver des informations sur le catalogue.
Réponds toujours en français, de façon concise et professionnelle.
Si tu utilises des données du catalogue, cite les titres et disponibilités exacts.
Si tu utilises des documents de référence, indique la source entre parenthèses.
Si tu ne sais pas, dis-le honnêtement et propose de contacter l'équipe FlowDiff à contact@flowdiff.fr.
Ne mentionne jamais Eden IA Studio ni aucune technologie sous-jacente.

Contexte disponible :
${context}`
}

// ─── Handler principal ───────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authentification via mock token
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const payload = token ? parseMockToken(token) : null

  if (!payload) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const { message } = req.body as { message?: string }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message vide' })
  }
  if (message.trim().length > 1000) {
    return res.status(400).json({ error: 'Message trop long (max. 1000 caractères)' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Configuration IA manquante' })
  }

  try {
    const type = classify(message)
    const context = await buildContext(type, message.trim(), payload.codeClient)

    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: buildSystemPrompt(context),
      messages: [{ role: 'user', content: message.trim() }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[Aidenia]', err)
    return res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' })
  }
}
