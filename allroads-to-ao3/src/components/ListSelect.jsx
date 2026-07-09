import { useState, useRef, useEffect } from 'react'

/**
 * ListSelect — champ liste stylisé avec panel de choix.
 *
 * Props:
 *   value        — valeur sélectionnée (string | null)
 *   onChange     — (value) => void
 *   options      — [{ value, label, icon? }]
 *   placeholder  — texte si rien de sélectionné
 *   nullable     — affiche "× effacer" quand une valeur est choisie
 *   combobox     — true: le trigger est un input texte libre avec suggestions
 *   label        — libellé mono au-dessus (optionnel, sinon géré par le parent)
 */
export default function ListSelect({
  value,
  onChange,
  options = [],
  placeholder = 'sélectionner…',
  nullable = false,
  combobox = false,
  label,
}) {
  const [open, setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function down(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', down)
    return () => document.removeEventListener('mousedown', down)
  }, [open])

  const q = combobox ? (value ?? '') : search
  const filtered = q.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(q.toLowerCase()) ||
        o.value.toLowerCase().includes(q.toLowerCase())
      )
    : options

  const selected = options.find(o => o.value === value)

  /* ── COMBOBOX : trigger = input texte ── */
  if (combobox) {
    const trimmed = (value ?? '').trim()
    const exactMatch = options.some(o => o.value.toLowerCase() === trimmed.toLowerCase())
    const showAdd = trimmed.length > 0 && !exactMatch

    return (
      <div ref={ref} style={{ position: 'relative' }}>
        {label && (
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>
            {label}
          </div>
        )}
        <input
          value={value ?? ''}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1.4px solid var(--ink)',
            fontFamily: 'var(--f-hand)', fontSize: 19, color: 'var(--ink)',
            outline: 'none', paddingBottom: 4,
          }}
        />
        {open && (filtered.length > 0 || showAdd) && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60,
            background: '#fffaf0', borderRadius: 8,
            border: '1.4px solid rgba(29,26,22,.12)',
            boxShadow: '0 8px 24px rgba(0,0,0,.13)',
            maxHeight: 200, overflowY: 'auto',
          }}>
            {filtered.map(opt => (
              <button key={opt.value} type="button"
                onMouseDown={e => { e.preventDefault(); onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: opt.value === value ? 'rgba(242,151,160,.13)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${opt.value === value ? 'var(--ink)' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                {opt.icon && (
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 22 }}>
                    {opt.icon}
                  </span>
                )}
                <span style={{ fontFamily: 'var(--f-hand)', fontSize: 17, color: 'var(--ink)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
            {showAdd && (
              <button type="button"
                onMouseDown={e => { e.preventDefault(); setOpen(false) }}
                style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'transparent', border: 'none',
                  borderLeft: '3px solid transparent',
                  borderTop: filtered.length > 0 ? '1px solid rgba(29,26,22,.07)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--lime-d)', letterSpacing: '.05em' }}>
                  + ajouter
                </span>
                <span style={{ fontFamily: 'var(--f-hand)', fontSize: 16, color: 'var(--ink)', fontStyle: 'italic' }}>
                  "{trimmed}"
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  /* ── SELECT FIXE : trigger = bouton stylisé ── */
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={() => { setOpen(p => !p); setSearch('') }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,250,240,.95)',
          border: '1.4px solid rgba(29,26,22,.15)',
          borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,.06)', textAlign: 'left',
        }}>
        {selected?.icon && (
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 26 }}>
            {selected.icon}
          </span>
        )}
        <span style={{
          flex: 1, fontFamily: 'var(--f-hand)', fontSize: 16,
          color: selected ? 'var(--ink)' : 'var(--ink-mute)',
        }}>
          {selected?.label ?? placeholder}
        </span>
        {/* chevron */}
        <svg width="11" height="11" viewBox="0 0 12 12"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0, opacity: .5 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 60,
          background: '#fffaf0', borderRadius: 10,
          border: '1.4px solid rgba(29,26,22,.12)',
          boxShadow: '0 8px 28px rgba(0,0,0,.14)',
          overflow: 'hidden', minWidth: 180,
        }}>
          {/* Barre de recherche (si >4 options) */}
          {options.length > 4 && (
            <div style={{
              padding: '9px 14px', borderBottom: '1px solid rgba(29,26,22,.07)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <input autoFocus value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="rechercher…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontFamily: 'var(--f-hand)',
                  fontSize: 15, color: 'var(--ink-mute)',
                }}
              />
              <svg width="11" height="11" viewBox="0 0 12 12"
                onClick={() => setOpen(false)}
                style={{ transform: 'rotate(180deg)', flexShrink: 0, opacity: .4, cursor: 'pointer' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {/* Effacer */}
            {nullable && value && (
              <button type="button"
                onClick={() => { onChange(null); setOpen(false) }}
                style={{
                  width: '100%', padding: '8px 14px',
                  display: 'flex', alignItems: 'center',
                  background: 'none', border: 'none',
                  borderLeft: '3px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--f-mono)', fontSize: 9,
                  color: 'var(--ink-mute)', letterSpacing: '.15em',
                }}>
                × effacer
              </button>
            )}
            {filtered.map(opt => {
              const isSel = opt.value === value
              return (
                <button key={opt.value} type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  style={{
                    width: '100%', padding: '11px 14px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: isSel ? 'rgba(242,151,160,.14)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${isSel ? 'var(--ink)' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background .1s',
                  }}>
                  {opt.icon !== undefined && (
                    <span style={{
                      flexShrink: 0, width: 28, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>
                      {opt.icon}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--f-hand)', fontSize: 17,
                    color: 'var(--ink)', fontWeight: isSel ? 600 : 400, flex: 1,
                  }}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
