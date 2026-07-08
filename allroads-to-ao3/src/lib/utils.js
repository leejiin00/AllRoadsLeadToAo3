// Utilitaires partagés entre les pages

export function strHue(str = '') {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h % 360
}

export function ficEnding(f) {
  if (f.good_ending && !f.bad_ending) return 'happy'
  if (f.bad_ending  && !f.good_ending) return 'bad'
  return 'open'
}

export function parseIntField(val) {
  const cleaned = String(val ?? '').replace(/[\s,.]/g, '')
  return parseInt(cleaned) || null
}

export const ENDING_LABEL = { happy: 'happy end ✿', bad: 'bad end', open: 'open end' }
export const ENDING_COLOR = { happy: 'var(--lime-d)', bad: 'var(--primrose)', open: 'var(--ink-mute)' }
export const MEDAL_ICON   = { gold: '🥇', silver: '🥈', bronze: '🥉' }
export const ROLE_LABEL   = { top: '▲ top', bottom: '▼ bottom', switch: '⇅ switch' }
