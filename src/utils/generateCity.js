import Anthropic from '@anthropic-ai/sdk'

export const API_KEY_STORAGE = 'stampbook-anthropic-key'
export const getApiKey  = () => localStorage.getItem(API_KEY_STORAGE) || ''
export const saveApiKey = (k) => localStorage.setItem(API_KEY_STORAGE, k.trim())

const PALETTES = [
  { ink: '#2563a8', accent: '#93c5fd', accentSoft: '#dbeafe', tint: '#eff6ff' },
  { ink: '#7c3aed', accent: '#c4b5fd', accentSoft: '#ede9fe', tint: '#f5f3ff' },
  { ink: '#0f766e', accent: '#5eead4', accentSoft: '#ccfbf1', tint: '#f0fdfa' },
  { ink: '#b45309', accent: '#fcd34d', accentSoft: '#fef3c7', tint: '#fffbeb' },
  { ink: '#be185d', accent: '#f9a8d4', accentSoft: '#fce7f3', tint: '#fdf2f8' },
  { ink: '#15803d', accent: '#86efac', accentSoft: '#dcfce7', tint: '#f0fdf4' },
  { ink: '#b91c1c', accent: '#fca5a5', accentSoft: '#fee2e2', tint: '#fef2f2' },
  { ink: '#0369a1', accent: '#7dd3fc', accentSoft: '#e0f2fe', tint: '#f0f9ff' },
]

function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return Math.abs(h)
}

const SYSTEM = `You are a knowledgeable travel guide. Generate exactly 8 photo quest activities for the requested city.
Return ONLY a JSON array — no markdown, no explanation, no code fences.
Schema: [{"id":"slug","name":"Name","label":"Type","emblem":"symbol","level":"tourist or local","blurb":"sentence"}]
Rules:
- Exactly 4 with level "tourist" (iconic sights, must-see landmarks)
- Exactly 4 with level "local" (neighborhood gems, local favorites)
- id: unique lowercase slug, letters and hyphens only, no spaces
- name: real place or experience name, 2-4 words, max 17 characters total
- label: single category word (Palace, Market, Park, Cafe, Beach, Tower, etc.)
- emblem: exactly one of: ❀ ◆ ✦ ✺ ☼ ❖ ⌂ ✿
- blurb: vivid one sentence, max 54 characters, no quotation marks`

export async function generateCityActivities(cityName, country, apiKey) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    system: SYSTEM,
    messages: [{ role: 'user', content: `${cityName}, ${country}` }],
  })
  const raw = msg.content[0]?.text ?? ''
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Unexpected AI response. Please try again.')
  return JSON.parse(match[0])
}

export function buildCity(cityName, country, activities) {
  const id = `city-${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
  const palette = PALETTES[hashStr(id) % PALETTES.length]
  const short = cityName.replace(/\s+/g, '').slice(0, 5).toUpperCase()
  return {
    id,
    name: cityName,
    short,
    country,
    emblem: activities[0]?.emblem ?? '✦',
    tagline: `Discover the soul of ${cityName}.`,
    ...palette,
    activities,
    isCustom: true,
  }
}

export async function fetchCitiesForCountry(country) {
  const res = await fetch('https://countriesnow.space/api/v1/countries/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country }),
  })
  const data = await res.json()
  if (Array.isArray(data?.data)) return data.data.sort()
  return []
}
