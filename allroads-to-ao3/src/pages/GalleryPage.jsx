import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Page, Header, Tape, BloodDrop, StarMark, FloralCluster, Doodle, Sticker, RatingIcon, RatingFlower, RatingPeach } from '../components/JournalShared'
import { supabase } from '../lib/supabase'
import TagInput from '../components/TagInput'
import ListSelect from '../components/ListSelect'
import ImageUpload from '../components/ImageUpload'
import HigurumaMascot from '../components/HigurumaMascot'
import buttImg from '../assets/butt.png'
import { strHue, ficEnding, parseIntField, ENDING_LABEL, ENDING_COLOR, MEDAL_ICON, ROLE_LABEL } from '../lib/utils'
import { useAuth } from '../lib/AuthContext'

import fi1   from '../assets/foldericon/1.png'
import fi1f  from '../assets/foldericon/1f.png'
import fi2   from '../assets/foldericon/2.png'
import fi2f  from '../assets/foldericon/2f.png'
import fi3   from '../assets/foldericon/3.png'
import fi3f  from '../assets/foldericon/3f.png'
import fi4   from '../assets/foldericon/4.png'
import fi4f  from '../assets/foldericon/4f.png'
import fi5   from '../assets/foldericon/5.png'
import fi5f  from '../assets/foldericon/5f.png'
import fi7   from '../assets/foldericon/7.png'
import fi8   from '../assets/foldericon/8.png'
import fi9   from '../assets/foldericon/9.png'
import fi10  from '../assets/foldericon/10.png'
import fi11  from '../assets/foldericon/11.png'
import fi13  from '../assets/foldericon/13.png'

const FOLDER_ICONS = [fi1, fi1f, fi2, fi2f, fi3, fi3f, fi4, fi4f, fi5, fi5f, fi7, fi8, fi9, fi10, fi11, fi13]

function folderIcon(name) {
  return FOLDER_ICONS[strHue(name) % FOLDER_ICONS.length]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const TAPE_KINDS = ['check', 'dots', 'clean', 'grid']
const ROTS = [-3, 2, -2, 3, -1, 1]

function cardGradient(name) {
  const h = strHue(name)
  return `linear-gradient(160deg, hsl(${h},52%,80%), hsl(${(h + 45) % 360},48%,55%))`
}

// ── Dossier univers ────────────────────────────────────────────────────────────
function UniverseFolder({ name, count, onClick }) {
  const [hov, setHov] = useState(false)
  const icon = folderIcon(name)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8, width: '100%',
        transform: hov ? 'translateY(-6px) scale(1.04)' : 'none',
        transition: 'transform .18s ease',
      }}>
      <img
        src={icon}
        alt={name}
        style={{
          width: 110, height: 'auto',
          filter: hov ? 'drop-shadow(0 8px 16px rgba(60,40,20,.30))' : 'drop-shadow(0 3px 6px rgba(60,40,20,.15))',
          transition: 'filter .18s',
          pointerEvents: 'none',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div className="handwriting" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.2, wordBreak: 'break-word' }}>
          {name}
        </div>
        <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginTop: 2 }}>
          {count} fic{count !== 1 ? 's' : ''}
        </div>
      </div>
    </button>
  )
}

// ── Couverture de livre ────────────────────────────────────────────────────────
const RATINGS = [
  { key: 'no_sex',   title: 'Pas de contenu sexuel', icon: (s) => <RatingFlower size={s} /> },
  { key: 'vanilla',  title: 'Contenu vanilla',       icon: (s) => <RatingPeach  size={s} /> },
  { key: 'explicit', title: 'Contenu explicite',      icon: (s) => <img src={buttImg} alt="explicit" style={{ width: s, height: s, objectFit: 'contain' }} /> },
]

function BookCover({ fic, onCoverChange, onRatingChange, canEdit }) {
  const h = strHue(fic.work_name || '')
  const hasCover = Boolean(fic.image_url)
  const coverBg = hasCover
    ? { backgroundImage: `url(${fic.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(180deg, hsl(${h},52%,72%) 0%, hsl(${(h + 60) % 360},48%,42%) 100%)` }
  const [hov, setHov] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadErr(null)
    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `${fic.id}-cover.${ext}`
    const { error: upErr } = await supabase.storage.from('fanfiction-covers').upload(path, file, { upsert: true })
    if (upErr) {
      setUploadErr(upErr.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('fanfiction-covers').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('fanfictions').update({ image_url: publicUrl }).eq('id', fic.id)
      if (dbErr) setUploadErr(dbErr.message)
      else onCoverChange?.(fic.id, publicUrl)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position: 'relative', transform: hov ? 'translateY(-6px) rotate(0.5deg)' : 'rotate(-0.3deg)', transition: 'transform .18s ease' }}>

        <Link to={`/fic/${fic.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ display: 'flex', borderRadius: '2px 4px 4px 2px', overflow: 'hidden',
            boxShadow: hov
              ? '6px 6px 20px rgba(60,40,20,.32), inset -5px 0 10px rgba(0,0,0,.18)'
              : '3px 4px 12px rgba(60,40,20,.2), inset -5px 0 10px rgba(0,0,0,.12)',
            transition: 'box-shadow .18s',
          }}>
            <div style={{ width: 11, background: `hsl(${h},55%,38%)`, flexShrink: 0 }} />
            <div style={{ width: 132, height: 188, ...coverBg, position: 'relative', overflow: 'hidden' }}>
              {!hasCover && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '12px 10px',
                  background: 'linear-gradient(to top, rgba(0,0,0,.58) 0%, transparent 55%)',
                }}>
                  <div className="handwriting" style={{ fontSize: 15, color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
                    {fic.work_name}
                  </div>
                  {fic.author_name && (
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.1em', color: 'rgba(255,255,255,.78)', marginTop: 4 }}>
                      {fic.author_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Bouton upload cover */}
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            position: 'absolute', bottom: 6, right: 6,
            width: 26, height: 26, borderRadius: '50%',
            background: uploading ? 'var(--lime)' : 'rgba(255,250,240,.92)',
            border: '1.2px solid rgba(29,26,22,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.18)',
            opacity: hov || uploading ? 1 : 0,
            transition: 'opacity .15s',
            fontSize: 13, lineHeight: 1,
          }}
          title="changer la couverture"
        >
          {uploading ? '…' : '📷'}
        </button>
        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      <div style={{ marginTop: 7, paddingLeft: 11, maxWidth: 143 }}>
        <div className="handwriting" style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fic.work_name}
        </div>

        {/* Boutons content rating */}
        <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
          {RATINGS.map(r => {
            const active = fic.content_rating === r.key
            return (
              <button
                key={r.key}
                title={r.title}
                onClick={() => canEdit && onRatingChange?.(fic.id, active ? null : r.key)}
                style={{
                  width: 26, height: 26, borderRadius: '50%', padding: 3,
                  border: active ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.18)',
                  background: active ? 'rgba(255,250,240,.95)' : 'rgba(255,250,240,.6)',
                  cursor: canEdit ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,.15)' : 'none',
                  transition: 'border .15s, box-shadow .15s',
                  opacity: !fic.content_rating || active ? 1 : 0.45,
                }}
              >
                {r.icon(16)}
              </button>
            )
          })}
        </div>

        {uploadErr && (
          <div className="mono" style={{ fontSize: 8, color: 'var(--primrose)', letterSpacing: '.08em', marginTop: 4, wordBreak: 'break-all' }}>
            ✕ {uploadErr}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Carte polaroid (vue intérieure univers) ────────────────────────────────────
function FicCard({ fic, i, onRatingChange, canEdit, onTagClick, activeTag, onEdit }) {
  const tapeKind = TAPE_KINDS[i % TAPE_KINDS.length]
  const rot = ROTS[i % ROTS.length]
  const tags = fic.tags ?? []
  const bg = fic.image_url
    ? { backgroundImage: `url(${fic.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: cardGradient(fic.universe_name) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Link to={`/fic/${fic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', height: 320, display: 'flex', justifyContent: 'center' }}>
          <Tape kind={tapeKind} color={i % 2 === 0 ? 'var(--primrose)' : 'var(--lime)'} rot={i % 2 === 0 ? -8 : 6}
            style={{ top: -10, left: 30, fontSize: 11, padding: '4px 12px' }}>
            {fic.ship_name ?? fic.work_name ?? '—'}
          </Tape>
          <div style={{ transform: `rotate(${rot}deg)`, background: '#fffaf0', padding: '10px 10px 14px', width: 230, boxShadow: '0 12px 24px rgba(60,40,20,.18), 0 2px 0 rgba(0,0,0,.04)' }}>
            <div style={{ width: '100%', height: 170, ...bg, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 10 }}>
              {fic.medal && (
                <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 20 }}>{MEDAL_ICON[fic.medal]}</span>
              )}
              <span className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'rgba(255,250,240,.92)', background: 'rgba(0,0,0,.28)', padding: '3px 6px' }}>
                {(fic.universe_name ?? '—').toUpperCase()}
              </span>
            </div>
            <div style={{ marginTop: 12, padding: '0 4px' }}>
              <div className="handwriting" style={{ fontSize: 22, lineHeight: 1.05, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {fic.work_name ?? '—'}
              </div>
              {fic.author_name && (
                <div className="mono" style={{ fontSize: 8, letterSpacing: '.15em', color: 'var(--ink-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fic.author_name}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 6 }}>
                {(fic.is_switch || fic.top_char?.length || fic.bottom_char?.length) ? (
                  <span className="mono" style={{ fontSize: 7, letterSpacing: '.1em', color: 'var(--ink-mute)', background: 'rgba(29,26,22,.07)', padding: '1px 5px', borderRadius: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                    {fic.is_switch
                      ? '⇅ switch'
                      : [
                          fic.top_char?.length    && `▲ ${Array.isArray(fic.top_char) ? fic.top_char.join(' & ') : fic.top_char}`,
                          fic.bottom_char?.length && `▼ ${Array.isArray(fic.bottom_char) ? fic.bottom_char.join(' & ') : fic.bottom_char}`,
                        ].filter(Boolean).join(' / ')
                    }
                  </span>
                ) : <span />}
                <span className="mono" style={{ fontSize: 8, letterSpacing: '.15em', color: 'var(--ink-mute)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {ficEnding(fic) === 'bad' ? <BloodDrop size={9} /> : ficEnding(fic) === 'open' ? <StarMark size={9} /> : null}
                  {ENDING_LABEL[ficEnding(fic)]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Boutons content rating */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {RATINGS.map(r => {
          const active = fic.content_rating === r.key
          return (
            <button
              key={r.key}
              title={r.title}
              onClick={() => canEdit && onRatingChange?.(fic.id, active ? null : r.key)}
              style={{
                width: 30, height: 30, borderRadius: '50%', padding: 4,
                border: active ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.18)',
                background: active ? 'rgba(255,250,240,.98)' : 'rgba(255,250,240,.65)',
                cursor: canEdit ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,.18)' : 'none',
                transition: 'border .15s, box-shadow .15s, opacity .15s',
                opacity: !fic.content_rating || active ? 1 : 0.4,
              }}
            >
              {r.icon(18)}
            </button>
          )
        })}
      </div>

      {/* Tags cliquables — 2 visibles + +X pour le reste */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, maxWidth: 230, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {tags.slice(0, 2).map(t => (
            <button key={t} onClick={() => onTagClick?.(t)}
              style={{
                background: activeTag === t ? 'var(--ink)' : 'var(--pinktone)',
                color: activeTag === t ? 'var(--paper)' : 'var(--ink)',
                border: 'none', borderRadius: 2, padding: '1px 7px',
                fontFamily: 'var(--f-hand)', fontSize: 12, cursor: 'pointer',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90,
                transition: 'background .15s, color .15s',
              }}>
              {t}
            </button>
          ))}
          {tags.length > 2 && (
            <span style={{
              background: 'rgba(29,26,22,.08)', color: 'var(--ink-mute)',
              borderRadius: 2, padding: '1px 7px',
              fontFamily: 'var(--f-mono)', fontSize: 10, whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center',
            }}>
              +{tags.length - 2}
            </span>
          )}
        </div>
      )}

    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20

const EMPTY_FIC = {
  work_name: '', author_name: '', universe_name: '', ships: [], link: '', image_url: '',
  summary: '', my_review: '', tags: [],
  rating: '', word_count: '', chapter_count: '', read_count: '',
  good_ending: false, bad_ending: false, content_rating: '',
  top_char: [], bottom_char: [], is_switch: false, medal: '', completed: false,
}

function buildPayload(fic) {
  return {
    work_name:     fic.work_name.trim()     || null,
    author_name:   fic.author_name.trim()   || null,
    universe_name: fic.universe_name.trim() || null,
    ship_name:     fic.ships?.length ? fic.ships.join(' & ') : null,
    link:          fic.link.trim()          || null,
    image_url:     fic.image_url.trim()     || null,
    summary:       fic.summary.trim()       || null,
    my_review:     fic.my_review.trim()     || null,
    tags:          fic.tags.length ? fic.tags : null,
    rating:        parseFloat(String(fic.rating).replace(',', '.')) || null,
    top_char:      fic.top_char?.length   ? fic.top_char   : null,
    bottom_char:   fic.bottom_char?.length ? fic.bottom_char : null,
    is_switch:     fic.is_switch ?? false,
    medal:         fic.medal || null,
    word_count:    parseIntField(fic.word_count),
    chapter_count: parseIntField(fic.chapter_count),
    read_count:    parseIntField(fic.read_count),
    good_ending:   fic.good_ending,
    bad_ending:    fic.bad_ending,
    content_rating: fic.content_rating || null,
    completed:     fic.completed ?? false,
  }
}

function field(state, setState, key, label, opts = {}) {
  const listId = `dl-${key}`
  return (
    <div key={key} style={opts.full ? { gridColumn: '1 / -1' } : {}}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>{label}</div>
      {opts.textarea ? (
        <textarea
          value={state[key]} rows={3}
          onChange={e => setState(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder ?? ''}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.4px dotted var(--ink)', fontFamily: 'var(--f-hand)', fontSize: 17, color: 'var(--ink)', outline: 'none', resize: 'none', paddingBottom: 4 }}
        />
      ) : (
        <>
          <input
            type={opts.type ?? 'text'}
            value={state[key]}
            list={opts.suggestions?.length ? listId : undefined}
            onChange={e => setState(f => ({ ...f, [key]: e.target.value }))}
            placeholder={opts.placeholder ?? ''}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.4px ${opts.dotted ? 'dotted' : 'solid'} var(--ink)`, fontFamily: opts.mono ? 'var(--f-mono)' : 'var(--f-hand)', fontSize: opts.mono ? 12 : 19, color: 'var(--ink)', outline: 'none', paddingBottom: 4 }}
          />
          {opts.suggestions?.length > 0 && (
            <datalist id={listId}>
              {opts.suggestions.map(s => <option key={s} value={s} />)}
            </datalist>
          )}
        </>
      )}
    </div>
  )
}

function FicForm({ state, setState, onSubmit, status, submitLabel, tapeLabel, tapeColor = 'var(--primrose)', onCancel, knownUniverses = [], knownShipsByUniverse = {} }) {
  const [shipInput, setShipInput] = useState('')
  const universeShips = (knownShipsByUniverse[state.universe_name] ?? []).filter(s => !state.ships.includes(s))
  const shipInputTrimmed = shipInput.trim()
  const shipIsNew = shipInputTrimmed.length > 0 && !universeShips.includes(shipInputTrimmed) && !state.ships.includes(shipInputTrimmed)
  return (
    <div className="card" style={{ padding: '28px 28px 22px', position: 'relative', transform: 'rotate(-0.2deg)', marginBottom: 28 }}>
      <Tape kind="dots" color={tapeColor} rot={-2} style={{ top: -12, left: 44, fontSize: 10, padding: '3px 12px' }}>{tapeLabel}</Tape>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 28px', marginTop: 12 }}>
        {field(state, setState, 'work_name',     'TITRE',          { placeholder: 'nom de la fic…' })}
        {field(state, setState, 'author_name',   'AUTEUR·RICE',    { placeholder: 'nom sur AO3…' })}
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>UNIVERS</div>
          <ListSelect combobox value={state.universe_name} onChange={val => setState(f => ({ ...f, universe_name: val }))}
            options={knownUniverses.map(u => ({ value: u, label: u }))} placeholder="JJK, ATLA, HP…" />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>SHIP(S)</div>
          <TagInput value={state.ships} onChange={ships => setState(f => ({ ...f, ships }))} placeholder="A/B, C/D…" onInputChange={setShipInput} />
          {(universeShips.length > 0 || shipIsNew) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {universeShips.map(s => (
                <button key={s} type="button"
                  onClick={() => setState(f => ({ ...f, ships: [...new Set([...f.ships, s])] }))}
                  style={{ background: 'transparent', border: '1px dashed rgba(29,26,22,.3)', borderRadius: 2, padding: '1px 7px', fontFamily: 'var(--f-hand)', fontSize: 13, cursor: 'pointer', color: 'var(--ink)', opacity: .65 }}>
                  + {s}
                </button>
              ))}
              {shipIsNew && (
                <button type="button"
                  onClick={() => { setState(f => ({ ...f, ships: [...new Set([...f.ships, shipInputTrimmed])] })); setShipInput('') }}
                  style={{ background: 'var(--lime-d)', border: 'none', borderRadius: 2, padding: '1px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>+</span> ajouter "{shipInputTrimmed}"
                </button>
              )}
            </div>
          )}
        </div>
        {field(state, setState, 'link', 'LIEN AO3', { placeholder: 'https://archiveofourown.org/…', mono: true })}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>IMAGE DE COUVERTURE</div>
          <ImageUpload value={state.image_url} onChange={url => setState(f => ({ ...f, image_url: url }))} bucket="fanfiction-covers" />
        </div>
        {field(state, setState, 'rating',        'NOTE',           { placeholder: '8.5' })}
        {field(state, setState, 'word_count',    'NOMBRE DE MOTS', { placeholder: '94 300' })}
        {field(state, setState, 'chapter_count', 'CHAPITRES',      { placeholder: '22' })}
        {field(state, setState, 'read_count',    'FOIS LU',        { placeholder: '1' })}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>TAGS</div>
          <TagInput value={state.tags} onChange={tags => setState(f => ({ ...f, tags }))} />
        </div>
        {/* ENDING · CONTENU · MÉDAILLE — 3 listes compactes côte à côte */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>ENDING</div>
            <ListSelect
              value={state.good_ending && !state.bad_ending ? 'happy' : state.bad_ending && !state.good_ending ? 'bad' : 'open'}
              onChange={val => setState(f => ({ ...f, good_ending: val === 'happy', bad_ending: val === 'bad' }))}
              options={[
                { value: 'happy', label: 'happy end ✿' },
                { value: 'bad',   label: 'bad end',     icon: <BloodDrop size={16} /> },
                { value: 'open',  label: 'open end',    icon: <StarMark  size={16} /> },
              ]}
            />
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>CONTENU</div>
            <ListSelect
              value={state.content_rating || null}
              onChange={val => setState(f => ({ ...f, content_rating: val ?? '' }))}
              nullable
              options={[
                { value: 'no_sex',   label: 'No Sex',       icon: <RatingIcon kind="no_sex"   size={18} /> },
                { value: 'vanilla',  label: 'Sex Vanilla',  icon: <RatingIcon kind="vanilla"  size={18} /> },
                { value: 'explicit', label: 'Sex Hardcore', icon: <RatingIcon kind="explicit" size={18} /> },
              ]}
            />
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>MÉDAILLE</div>
            <ListSelect
              value={state.medal || null}
              onChange={val => setState(f => ({ ...f, medal: val ?? '' }))}
              nullable
              options={[
                { value: 'gold',   label: '🥇 Or' },
                { value: 'silver', label: '🥈 Argent' },
                { value: 'bronze', label: '🥉 Bronze' },
              ]}
            />
          </div>
        </div>
        {/* Terminée */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>TERMINÉE</div>
          <span className="handwriting" style={{ fontSize: 16, color: 'var(--ink-mute)', opacity: state.completed ? 0.4 : 1, transition: 'opacity .2s' }}>non</span>
          <button type="button"
            onClick={() => setState(f => ({ ...f, completed: !f.completed }))}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
              background: state.completed ? 'var(--lime-d)' : 'rgba(29,26,22,.15)',
              transition: 'background .2s', position: 'relative', flexShrink: 0,
            }}>
            <div style={{
              position: 'absolute', top: 4, left: state.completed ? 22 : 4,
              width: 14, height: 14, borderRadius: '50%',
              background: 'white', transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            }} />
          </button>
          <span className="handwriting" style={{ fontSize: 16, color: 'var(--lime-d)', opacity: state.completed ? 1 : 0.4, transition: 'opacity .2s' }}>oui</span>
        </div>

        {/* Switch + Top/Bottom — visible uniquement si contenu sexuel */}
        {(state.content_rating === 'vanilla' || state.content_rating === 'explicit') && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', alignSelf: 'flex-start', userSelect: 'none' }}>
              <div onClick={() => setState(f => ({ ...f, is_switch: !f.is_switch }))}
                style={{
                  width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                  border: '1.5px solid rgba(29,26,22,.35)',
                  background: state.is_switch ? 'var(--ink)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background .15s',
                }}>
                {state.is_switch && <span style={{ color: 'var(--paper)', fontSize: 12, lineHeight: 1, fontWeight: 700 }}>✓</span>}
              </div>
              <span className="handwriting"
                onClick={() => setState(f => ({ ...f, is_switch: !f.is_switch }))}
                style={{ fontSize: 17, color: state.is_switch ? 'var(--ink)' : 'var(--ink-mute)', transition: 'color .15s' }}>
                ⇅ Switch
              </span>
            </label>
            {!state.is_switch && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 140px' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>▲ TOP</div>
                  <TagInput value={state.top_char} onChange={chars => setState(f => ({ ...f, top_char: chars }))} placeholder="personnage(s)…" />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>▼ BOTTOM</div>
                  <TagInput value={state.bottom_char} onChange={chars => setState(f => ({ ...f, bottom_char: chars }))} placeholder="personnage(s)…" />
                </div>
              </div>
            )}
          </div>
        )}

        {field(state, setState, 'summary',   'RÉSUMÉ',    { full: true, textarea: true, placeholder: 'résumé de la fic…' })}
        {field(state, setState, 'my_review', 'MA REVIEW', { full: true, textarea: true, placeholder: 'mes impressions…', dotted: true })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: status === 'saved' ? 'var(--lime-d)' : status === 'error' ? 'var(--primrose)' : 'transparent', transition: 'color .3s' }}>
          {status === 'saved' ? '✓ sauvegardé' : status === 'error' ? '✕ erreur' : '·'}
        </span>
        {onCancel && (
          <button onClick={onCancel} className="btn-stamp btn-stamp--ghost" style={{ padding: '10px 16px', fontSize: 13 }}>× annuler</button>
        )}
        <button onClick={onSubmit} className="btn-stamp" style={{ padding: '10px 22px', fontSize: 13 }}>
          {status === 'saving' ? '⟳ …' : submitLabel}
        </button>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const location = useLocation()
  const session = useAuth()
  const [fics,              setFics]              = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState(null)
  const [selectedUniverse,  setSelectedUniverse]  = useState(null)
  const [search,            setSearch]            = useState('')
  const [globalSearch,      setGlobalSearch]      = useState('')
  const [showAllFics,       setShowAllFics]       = useState(false)
  const [sortRating,        setSortRating]        = useState(null)
  const [filterRating,      setFilterRating]      = useState(null)
  const [filterNoteMin,     setFilterNoteMin]     = useState(null)
  const [filterNoteMax,     setFilterNoteMax]     = useState(null)
  const [openFilter,        setOpenFilter]        = useState(null)
  const [filterTag,         setFilterTag]         = useState(null)
  const [filterEnding,      setFilterEnding]      = useState(null)
  const [filterShip,        setFilterShip]        = useState(null)
  const [filterCompleted,   setFilterCompleted]   = useState(null)
  const [page,              setPage]              = useState(1)
  const [showAddForm,       setShowAddForm]       = useState(false)
  const [newFic,            setNewFic]            = useState(EMPTY_FIC)
  const [addStatus,         setAddStatus]         = useState('idle')
  const [editId,            setEditId]            = useState(null)
  const [editFic,           setEditFic]           = useState(EMPTY_FIC)
  const [editStatus,        setEditStatus]        = useState('idle')
  const [filterTopChar,     setFilterTopChar]     = useState(null)
  const [filterBottomChar,  setFilterBottomChar]  = useState(null)

  useEffect(() => {
    supabase.from('fanfictions').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else {
          setFics(data || [])
          const target = location.state?.openUniverse
          if (target) setSelectedUniverse(target)
        }
        setLoading(false)
      })
  }, [location])

  async function addFic() {
    if (!newFic.work_name.trim()) return
    setAddStatus('saving')
    const payload = { ...buildPayload(newFic) }
    const { data, error } = await supabase.from('fanfictions').insert(payload).select().single()
    if (error) { setAddStatus('error'); console.error(error); return }
    setFics(prev => [data, ...prev])
    setAddStatus('saved')
    setTimeout(() => {
      setNewFic(EMPTY_FIC)
      setShowAddForm(false)
      setAddStatus('idle')
    }, 1200)
  }

  // Regroupement par univers
  const universeMap = fics.reduce((acc, fic) => {
    const u = fic.universe_name || '—'
    if (!acc[u]) acc[u] = []
    acc[u].push(fic)
    return acc
  }, {})
  const universes = Object.keys(universeMap).sort()
  const knownUniverses = universes.filter(u => u !== '—')
  const knownShipsByUniverse = fics.reduce((acc, f) => {
    if (!f.universe_name || !f.ship_name) return acc
    f.ship_name.split(' & ').forEach(s => {
      if (!acc[f.universe_name]) acc[f.universe_name] = []
      if (!acc[f.universe_name].includes(s)) acc[f.universe_name].push(s)
    })
    return acc
  }, {})

  // Fics de l'univers sélectionné, filtrées + triées
  const universeFics = selectedUniverse ? (universeMap[selectedUniverse] || []) : []
  const filtered = universeFics.filter(fic => {
    if (filterRating && fic.content_rating !== filterRating) return false
    if (filterNoteMin !== null && (fic.rating ?? -Infinity) < filterNoteMin) return false
    if (filterNoteMax !== null && (fic.rating ?? Infinity) > filterNoteMax) return false
    if (filterTag && !(fic.tags ?? []).includes(filterTag)) return false
    if (filterEnding && ficEnding(fic) !== filterEnding) return false
    if (filterShip && fic.ship_name !== filterShip) return false
    if (filterCompleted !== null && Boolean(fic.completed) !== filterCompleted) return false
    if (filterTopChar && !(Array.isArray(fic.top_char) ? fic.top_char.includes(filterTopChar) : fic.top_char === filterTopChar)) return false
    if (filterBottomChar && !(Array.isArray(fic.bottom_char) ? fic.bottom_char.includes(filterBottomChar) : fic.bottom_char === filterBottomChar)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      fic.work_name?.toLowerCase().includes(q) ||
      fic.author_name?.toLowerCase().includes(q) ||
      fic.ship_name?.toLowerCase().includes(q) ||
      (fic.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
  })
  const sorted = [...filtered].sort((a, b) => {
    if (sortRating) {
      const ar = a.rating ?? -Infinity, br = b.rating ?? -Infinity
      if (ar !== br) return sortRating === 'asc' ? ar - br : br - ar
    }
    return 0
  })
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Tags, ships et personnages uniques de l'univers sélectionné (pour filtres)
  const universeTags      = [...new Set(universeFics.flatMap(f => f.tags ?? []))].sort()
  const universeShips     = [...new Set(universeFics.map(f => f.ship_name).filter(Boolean))].sort()
  const universeTopChars    = [...new Set(universeFics.flatMap(f => Array.isArray(f.top_char)    ? f.top_char.filter(Boolean)    : f.top_char    ? [f.top_char]    : []))].sort()
  const universeBottomChars = [...new Set(universeFics.flatMap(f => Array.isArray(f.bottom_char) ? f.bottom_char.filter(Boolean) : f.bottom_char ? [f.bottom_char] : []))].sort()

  // Toutes les fics filtrées (recherche globale + filtres partagés)
  const globalFiltered = fics.filter(fic => {
    if (filterRating && fic.content_rating !== filterRating) return false
    if (filterNoteMin !== null && (fic.rating ?? -Infinity) < filterNoteMin) return false
    if (filterNoteMax !== null && (fic.rating ?? Infinity) > filterNoteMax) return false
    if (filterEnding && ficEnding(fic) !== filterEnding) return false
    if (filterCompleted !== null && Boolean(fic.completed) !== filterCompleted) return false
    if (!globalSearch) return true
    const q = globalSearch.toLowerCase()
    return (
      fic.work_name?.toLowerCase().includes(q) ||
      fic.author_name?.toLowerCase().includes(q) ||
      fic.ship_name?.toLowerCase().includes(q) ||
      (fic.tags ?? []).some(t => t.toLowerCase().includes(q)) ||
      fic.universe_name?.toLowerCase().includes(q)
    )
  })
  const globalSorted = [...globalFiltered].sort((a, b) => {
    if (sortRating) {
      const ar = a.rating ?? -Infinity, br = b.rating ?? -Infinity
      if (ar !== br) return sortRating === 'asc' ? ar - br : br - ar
    }
    return 0
  })
  const globalTotalPages = Math.max(1, Math.ceil(globalSorted.length / PAGE_SIZE))
  const globalSafePage   = Math.min(page, globalTotalPages)
  const globalPaginated  = globalSorted.slice((globalSafePage - 1) * PAGE_SIZE, globalSafePage * PAGE_SIZE)

  function openUniverse(name) {
    setSelectedUniverse(name)
    setSearch('')
    setSortRating(null)
    setFilterRating(null)
    setFilterNoteMin(null)
    setFilterNoteMax(null)
    setFilterEnding(null)
    setFilterShip(null)
    setFilterTag(null)
    setFilterCompleted(null)
    setFilterTopChar(null)
    setFilterBottomChar(null)
    setOpenFilter(null)
    setPage(1)
  }

  function handleCoverChange(ficId, url) {
    setFics(prev => prev.map(f => f.id === ficId ? { ...f, image_url: url } : f))
  }

  async function handleRatingChange(ficId, rating) {
    const prev = fics.find(f => f.id === ficId)?.content_rating ?? null
    setFics(fs => fs.map(f => f.id === ficId ? { ...f, content_rating: rating } : f))
    const { error, data } = await supabase.from('fanfictions').update({ content_rating: rating }).eq('id', ficId).select('content_rating').single()
    if (error) {
      console.error('Erreur sauvegarde rating:', error.code, error.message, error.details)
      alert(`Erreur rating: ${error.message}`)
      setFics(fs => fs.map(f => f.id === ficId ? { ...f, content_rating: prev } : f))
    }
  }

  function startEdit(f) {
    setEditId(f.id)
    setEditFic({
      work_name:     f.work_name     ?? '',
      author_name:   f.author_name   ?? '',
      universe_name: f.universe_name ?? '',
      ships:         f.ship_name ? f.ship_name.split(' & ') : [],
      link:          f.link          ?? '',
      image_url:     f.image_url     ?? '',
      summary:       f.summary       ?? '',
      my_review:     f.my_review     ?? '',
      tags:          f.tags          ?? [],
      rating:        f.rating != null ? String(f.rating) : '',
      word_count:    f.word_count    != null ? String(f.word_count)    : '',
      chapter_count: f.chapter_count != null ? String(f.chapter_count) : '',
      read_count:    f.read_count    != null ? String(f.read_count)    : '',
      good_ending:   f.good_ending   ?? false,
      bad_ending:    f.bad_ending    ?? false,
      content_rating: f.content_rating ?? '',
      top_char:      Array.isArray(f.top_char)    ? f.top_char    : f.top_char    ? [f.top_char]    : [],
      bottom_char:   Array.isArray(f.bottom_char) ? f.bottom_char : f.bottom_char ? [f.bottom_char] : [],
      is_switch:     f.is_switch ?? false,
      medal:         f.medal        ?? '',
      completed:     f.completed    ?? false,
    })
    setShowAddForm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveEdit() {
    setEditStatus('saving')
    const { data, error } = await supabase.from('fanfictions').update(buildPayload(editFic)).eq('id', editId).select().single()
    if (!error) {
      setFics(prev => prev.map(f => f.id === editId ? data : f))
      setEditId(null)
    }
    setEditStatus(error ? 'error' : 'saved')
    setTimeout(() => setEditStatus('idle'), 2500)
  }

  function backToFolders() {
    setSelectedUniverse(null)
    setSearch('')
    setSortRating(null)
    setFilterRating(null)
    setFilterNoteMin(null)
    setFilterNoteMax(null)
    setFilterEnding(null)
    setFilterShip(null)
    setFilterTag(null)
    setFilterCompleted(null)
    setFilterTopChar(null)
    setFilterBottomChar(null)
    setOpenFilter(null)
    setPage(1)
  }

  // Pagination globale (helper de rendu)
  function renderPagination(currentPage, numPages, onSetPage) {
    if (numPages <= 1) return null
    const safeP = Math.min(currentPage, numPages)
    return (
      <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.22em', color: 'var(--ink)' }}>
        <button onClick={() => onSetPage(p => Math.max(1, p - 1))} disabled={safeP === 1}
          style={{ background: 'none', border: 'none', cursor: safeP === 1 ? 'default' : 'pointer', opacity: safeP === 1 ? .3 : 1, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.22em', color: 'var(--ink)', padding: 0 }}>
          ← prev
        </button>
        {Array.from({ length: numPages }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onSetPage(n)}
            style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: n === safeP ? 'var(--ink)' : 'transparent', color: n === safeP ? 'var(--paper)' : 'var(--ink)', border: n === safeP ? 'none' : '1.4px solid var(--ink)', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.1em' }}>
            {n}
          </button>
        ))}
        <button onClick={() => onSetPage(p => Math.min(numPages, p + 1))} disabled={safeP === numPages}
          style={{ background: 'none', border: 'none', cursor: safeP === numPages ? 'default' : 'pointer', opacity: safeP === numPages ? .3 : 1, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.22em', color: 'var(--ink)', padding: 0 }}>
          next →
        </button>
      </div>
    )
  }

  return (
    <>
      <Page>
        <Header active="gallery" />

        <div style={{ padding: '88px 56px 56px' }}>

          {/* ── En-tête ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              {selectedUniverse ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <button onClick={backToFolders} className="btn-stamp btn-stamp--ghost" style={{ padding: '6px 12px', fontSize: 11 }}>
                      ← dossiers
                    </button>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>
                      / {selectedUniverse.toUpperCase()}
                    </span>
                  </div>
                  <div className="heading-handwritten" style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: 'var(--ink)', lineHeight: .95 }}>
                    {selectedUniverse}
                  </div>
                </>
              ) : (
                <>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>SECTION B</div>
                  <div className="heading-handwritten" style={{ fontSize: 'clamp(52px, 7vw, 88px)', color: 'var(--ink)', display: 'inline-block', marginTop: 4 }}>
                    la bibliothèque
                  </div>
                  <FloralCluster size={90} variant={1} style={{ position: 'absolute', top: -10, right: -100, opacity: .55, pointerEvents: 'none' }} />
                </>
              )}
            </div>

            {/* Bouton ajouter */}
            {!selectedUniverse && session && (
              <div style={{ paddingBottom: 8 }}>
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="btn-stamp"
                  style={{ padding: '10px 18px', fontSize: 13, background: 'var(--pinktone)', boxShadow: '4px 4px 0 rgba(0,0,0,.08)' }}>
                  {showAddForm ? '× annuler' : '+ ajouter'}
                </button>
              </div>
            )}

            {/* Compteur + filtres compacts (vue intérieure) */}
            {selectedUniverse && (() => {
              // Mise à jour de moreActive pour inclure les nouveaux filtres
              const moreActive = sortRating || filterNoteMin !== null || filterNoteMax !== null || filterEnding || filterShip || filterCompleted !== null || filterTopChar || filterBottomChar
              const anyActive = filterRating || filterTag || moreActive

              return (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 8, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-mute)', marginRight: 2 }}>
                    {sorted.length} fic{sorted.length !== 1 ? 's' : ''}
                  </span>

                  {/* Rating circles — toujours visibles */}
                  {RATINGS.map(r => (
                    <button key={r.key} title={r.title}
                      onClick={() => { setFilterRating(p => p === r.key ? null : r.key); setPage(1) }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', padding: 3,
                        border: filterRating === r.key ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.2)',
                        background: filterRating === r.key ? 'rgba(255,250,240,.98)' : 'rgba(255,250,240,.6)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: filterRating === r.key ? '0 2px 8px rgba(0,0,0,.18)' : 'none',
                        opacity: filterRating && filterRating !== r.key ? 0.35 : 1,
                        transition: 'all .15s',
                      }}>
                      {r.icon(14)}
                    </button>
                  ))}

                  {/* Chips actifs : tag, ending, ship, top, bottom */}
                  {[
                    filterTag        && { label: filterTag,                      clear: () => { setFilterTag(null);        setPage(1) } },
                    filterEnding     && { label: ENDING_LABEL[filterEnding],     clear: () => { setFilterEnding(null);     setPage(1) } },
                    filterShip       && { label: filterShip,                     clear: () => { setFilterShip(null);       setPage(1) } },
                    filterTopChar    && { label: `▲ ${filterTopChar}`,           clear: () => { setFilterTopChar(null);    setPage(1) } },
                    filterBottomChar && { label: `▼ ${filterBottomChar}`,        clear: () => { setFilterBottomChar(null); setPage(1) } },
                  ].filter(Boolean).map((chip, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13,
                      background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2,
                    }}>
                      {chip.label}
                      <button onClick={chip.clear}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  ))}

                  {/* Bouton + pour les filtres supplémentaires */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenFilter(p => p ? null : 'more')}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: moreActive ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.2)',
                        background: moreActive ? 'var(--ink)' : 'rgba(255,250,240,.6)',
                        color: moreActive ? 'var(--paper)' : 'var(--ink)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 16, lineHeight: 1,
                        transition: 'all .15s',
                      }}>
                      {openFilter === 'more' ? '−' : '+'}
                    </button>

                    {openFilter === 'more' && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 20,
                        background: '#fffaf0', border: '1.4px solid rgba(29,26,22,.18)',
                        borderRadius: 6, padding: '14px 16px', minWidth: 200,
                        boxShadow: '0 8px 24px rgba(0,0,0,.13)',
                        display: 'flex', flexDirection: 'column', gap: 14,
                      }}>

                        {/* Terminée */}
                        <div>
                          <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TERMINÉE</div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[[true, 'oui ✓'], [false, 'non…']].map(([val, lbl]) => (
                              <button key={String(val)}
                                onClick={() => { setFilterCompleted(p => p === val ? null : val); setPage(1) }}
                                style={{
                                  flex: 1, padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13,
                                  background: filterCompleted === val ? 'var(--ink)' : 'transparent',
                                  color: filterCompleted === val ? 'var(--paper)' : 'var(--ink)',
                                  border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                  transition: 'all .12s',
                                }}>{lbl}</button>
                            ))}
                          </div>
                        </div>

                        {/* Conteneur global pour espacer chaque groupe de filtres uniformément */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                          {/* Ending */}
                          <div>
                            <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>ENDING</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {[['happy', 'happy end ✿'], ['bad', 'bad end'], ['open', 'open end']].map(([val, lbl]) => (
                                <button key={val}
                                  onClick={() => { setFilterEnding(p => p === val ? null : val); setPage(1); }}
                                  style={{
                                    padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13,
                                    background: filterEnding === val ? 'var(--ink)' : 'transparent',
                                    color: filterEnding === val ? 'var(--paper)' : 'var(--ink)',
                                    border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                    transition: 'all .12s',
                                  }}>{lbl}</button>
                              ))}
                            </div>
                          </div>

                          {/* Ship (si plusieurs dans cet univers) */}
                          {universeShips && universeShips.length > 1 && (
                            <div>
                              <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>SHIP</div>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {universeShips.map(s => (
                                  <button key={s}
                                    onClick={() => { setFilterShip(p => p === s ? null : s); setPage(1); }}
                                    style={{
                                      padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13,
                                      background: filterShip === s ? 'var(--ink)' : 'transparent',
                                      color: filterShip === s ? 'var(--paper)' : 'var(--ink)',
                                      border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                      transition: 'all .12s',
                                    }}>{s}</button>
                                ))}
                              </div>
                            </div>
                          )}  

                          {/* Top / Bottom — visible si le filtre contenu est vanilla ou explicit */}
                          {(filterRating === 'vanilla' || filterRating === 'explicit') && (universeTopChars.length > 0 || universeBottomChars.length > 0) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {universeTopChars.length > 0 && (
                                <div>
                                  <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>▲ TOP</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {universeTopChars.map(char => (
                                      <button key={char}
                                        onClick={() => { setFilterTopChar(p => p === char ? null : char); setPage(1) }}
                                        style={{
                                          padding: '3px 9px',
                                          fontFamily: 'var(--f-hand)', fontSize: 13,
                                          background: filterTopChar === char ? 'var(--ink)' : 'transparent',
                                          color: filterTopChar === char ? 'var(--paper)' : 'var(--ink)',
                                          border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                          transition: 'all .12s',
                                        }}>
                                        {char}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {universeBottomChars.length > 0 && (
                                <div>
                                  <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>▼ BOTTOM</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {universeBottomChars.map(char => (
                                      <button key={char}
                                        onClick={() => { setFilterBottomChar(p => p === char ? null : char); setPage(1) }}
                                        style={{
                                          padding: '3px 9px',
                                          fontFamily: 'var(--f-hand)', fontSize: 13,
                                          background: filterBottomChar === char ? 'var(--ink)' : 'transparent',
                                          color: filterBottomChar === char ? 'var(--paper)' : 'var(--ink)',
                                          border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                          transition: 'all .12s',
                                        }}>
                                        {char}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Note */}
                          <div>
                            <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TRI PAR NOTE</div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                              {[['asc', '↑ asc.'], ['desc', '↓ desc.']].map(([val, lbl]) => (
                                <button key={val}
                                  onClick={() => { setSortRating(p => p === val ? null : val); setPage(1); }}
                                  style={{
                                    flex: 1, padding: '3px 9px',
                                    fontFamily: 'var(--f-hand)', fontSize: 13,
                                    background: sortRating === val ? 'var(--ink)' : 'transparent',
                                    color: sortRating === val ? 'var(--paper)' : 'var(--ink)',
                                    border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer',
                                    transition: 'all .12s',
                                  }}>{lbl}</button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input type="number" min={0} max={10} step={0.5}
                                value={filterNoteMin ?? ''} placeholder="0"
                                onChange={e => { setFilterNoteMin(e.target.value === '' ? null : Number(e.target.value)); setPage(1); }}
                                style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>—</span>
                              <input type="number" min={0} max={10} step={0.5}
                                value={filterNoteMax ?? ''} placeholder="10"
                                onChange={e => { setFilterNoteMax(e.target.value === '' ? null : Number(e.target.value)); setPage(1); }}
                                style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                            </div>
                          </div>

                          {/* Bouton Effacer */}
                          {moreActive && (
                            <button
                              onClick={() => { 
                                setSortRating(null); 
                                setFilterNoteMin(null); 
                                setFilterNoteMax(null); 
                                setFilterEnding(null); 
                                setFilterShip(null); 
                                setFilterCompleted(null); 
                                setFilterTopChar(null);
                                setFilterBottomChar(null);
                                setPage(1); 
                              }}
                              style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4 }}>
                              ✕ effacer
                            </button>
                          )}

                        </div>
                      </div>
                    )}
                  </div> {/* Fin du div relative du bouton + */}

                  {/* Tout effacer */}
                  {anyActive && (
                    <button
                      onClick={() => { 
                        setFilterRating(null); setFilterNoteMin(null); setFilterNoteMax(null); 
                        setSortRating(null); setFilterTag(null); setFilterEnding(null); 
                        setFilterShip(null); setFilterCompleted(null); 
                        setFilterTopChar(null); setFilterBottomChar(null);
                        setOpenFilter(null); setPage(1) 
                      }}
                      style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', marginLeft: 2 }}>
                      ✕ tout effacer
                    </button>
                  )}
                </div>
              )
            })()}
            </div> {/*

          {/* ── Formulaire ajout fic ── */}
          {showAddForm && session && (
            <FicForm
              state={newFic} setState={setNewFic}
              onSubmit={addFic} status={addStatus}
              submitLabel="ajouter ✦"
              tapeLabel="nouvelle entrée"
              onCancel={() => { setShowAddForm(false); setNewFic(EMPTY_FIC) }}
              knownUniverses={knownUniverses}
              knownShipsByUniverse={knownShipsByUniverse}
            />
          )}

          {/* ── Formulaire édition fic ── */}
          {editId && session && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>MODIFIER LA FIC</div>
                <button onClick={() => setEditId(null)} className="btn-stamp" style={{ padding: '6px 14px', fontSize: 11, background: 'var(--ink)', color: 'var(--paper)' }}>× annuler</button>
              </div>
              <FicForm
                state={editFic} setState={setEditFic}
                onSubmit={saveEdit} status={editStatus}
                submitLabel="sauvegarder ✦"
                tapeLabel="modifier l'entrée"
                tapeColor="var(--yucca)"
                onCancel={() => setEditId(null)}
                knownUniverses={knownUniverses}
                knownShipsByUniverse={knownShipsByUniverse}
              />
            </div>
          )}

          {/* ── Loading / erreur ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="handwriting" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>chargement…</div>
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--primrose)', letterSpacing: '.15em' }}>erreur : {error}</div>
            </div>
          )}

          {/* ── VUE DOSSIERS ── */}
          {!loading && !error && !selectedUniverse && (
            <>
              {/* Barre de recherche globale */}
              <div style={{ marginBottom: 28 }}>
                <div className="card" style={{ padding: '12px 18px', transform: 'rotate(-0.3deg)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-mute)', flexShrink: 0 }}>BIBLIOTHÈQUE</span>
                  <input
                    value={globalSearch}
                    onChange={e => { setGlobalSearch(e.target.value); setShowAllFics(true); setPage(1) }}
                    placeholder="chercher dans toute la bibliothèque…"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--f-hand)', fontSize: 20, color: 'var(--ink)' }}
                  />
                  <button
                    onClick={() => { setShowAllFics(v => !v); setPage(1) }}
                    style={{
                      padding: '4px 12px', fontFamily: 'var(--f-hand)', fontSize: 14,
                      background: showAllFics && !globalSearch ? 'var(--ink)' : 'var(--pinktone)',
                      color: showAllFics && !globalSearch ? 'var(--paper)' : 'var(--ink)',
                      border: 'none', borderRadius: 2, cursor: 'pointer',
                      flexShrink: 0, transition: 'all .15s',
                    }}>
                    toutes les fics
                  </button>
                  {(globalSearch || showAllFics) && (
                    <button
                      onClick={() => { setGlobalSearch(''); setShowAllFics(false); setFilterRating(null); setFilterEnding(null); setFilterCompleted(null); setSortRating(null); setFilterNoteMin(null); setFilterNoteMax(null); setOpenFilter(null); setPage(1) }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--ink-mute)', padding: 0, flexShrink: 0 }}>
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Vue toutes les fics (recherche globale ou toggle) */}
              {(globalSearch || showAllFics) ? (
                <>
                  {/* Barre de filtres globale */}
                  {(() => {
                    const gMoreActive = sortRating || filterNoteMin !== null || filterNoteMax !== null || filterEnding || filterCompleted !== null
                    const gAnyActive  = filterRating || gMoreActive
                    return (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-mute)', marginRight: 2 }}>
                          {globalSorted.length} fic{globalSorted.length !== 1 ? 's' : ''}{globalSearch ? ` · « ${globalSearch} »` : ''}
                        </span>

                        {RATINGS.map(r => (
                          <button key={r.key} title={r.title}
                            onClick={() => { setFilterRating(p => p === r.key ? null : r.key); setPage(1) }}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', padding: 3,
                              border: filterRating === r.key ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.2)',
                              background: filterRating === r.key ? 'rgba(255,250,240,.98)' : 'rgba(255,250,240,.6)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: filterRating === r.key ? '0 2px 8px rgba(0,0,0,.18)' : 'none',
                              opacity: filterRating && filterRating !== r.key ? 0.35 : 1,
                              transition: 'all .15s',
                            }}>
                            {r.icon(14)}
                          </button>
                        ))}

                        {/* Chips filtres actifs */}
                        {filterEnding && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                            {ENDING_LABEL[filterEnding]}
                            <button onClick={() => { setFilterEnding(null); setPage(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                          </span>
                        )}
                        {filterCompleted !== null && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                            {filterCompleted ? 'terminée' : 'en cours'}
                            <button onClick={() => { setFilterCompleted(null); setPage(1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                          </span>
                        )}

                        {/* Bouton + */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setOpenFilter(p => p ? null : 'more')}
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              border: gMoreActive ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.2)',
                              background: gMoreActive ? 'var(--ink)' : 'rgba(255,250,240,.6)',
                              color: gMoreActive ? 'var(--paper)' : 'var(--ink)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--f-mono)', fontSize: 16, lineHeight: 1, border: 'none',
                              transition: 'all .15s',
                            }}>
                            {openFilter === 'more' ? '−' : '+'}
                          </button>
                          {openFilter === 'more' && (
                            <div style={{
                              position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
                              background: '#fffaf0', border: '1.4px solid rgba(29,26,22,.18)',
                              borderRadius: 6, padding: '14px 16px', minWidth: 200,
                              boxShadow: '0 8px 24px rgba(0,0,0,.13)',
                              display: 'flex', flexDirection: 'column', gap: 14,
                            }}>
                              <div>
                                <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TERMINÉE</div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {[[true, 'oui ✓'], [false, 'non…']].map(([val, lbl]) => (
                                    <button key={String(val)}
                                      onClick={() => { setFilterCompleted(p => p === val ? null : val); setPage(1) }}
                                      style={{ flex: 1, padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterCompleted === val ? 'var(--ink)' : 'transparent', color: filterCompleted === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>ENDING</div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {[['happy', 'happy end ✿'], ['bad', 'bad end'], ['open', 'open end']].map(([val, lbl]) => (
                                    <button key={val}
                                      onClick={() => { setFilterEnding(p => p === val ? null : val); setPage(1) }}
                                      style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterEnding === val ? 'var(--ink)' : 'transparent', color: filterEnding === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TRI PAR NOTE</div>
                                <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                                  {[['asc', '↑ asc.'], ['desc', '↓ desc.']].map(([val, lbl]) => (
                                    <button key={val}
                                      onClick={() => { setSortRating(p => p === val ? null : val); setPage(1) }}
                                      style={{ flex: 1, padding: '5px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: sortRating === val ? 'var(--ink)' : 'transparent', color: sortRating === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input type="number" min={0} max={10} step={0.5} value={filterNoteMin ?? ''} placeholder="0"
                                    onChange={e => { setFilterNoteMin(e.target.value === '' ? null : Number(e.target.value)); setPage(1) }}
                                    style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>—</span>
                                  <input type="number" min={0} max={10} step={0.5} value={filterNoteMax ?? ''} placeholder="10"
                                    onChange={e => { setFilterNoteMax(e.target.value === '' ? null : Number(e.target.value)); setPage(1) }}
                                    style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                                </div>
                              </div>
                              {gMoreActive && (
                                <button onClick={() => { setSortRating(null); setFilterNoteMin(null); setFilterNoteMax(null); setFilterEnding(null); setFilterCompleted(null); setPage(1) }}
                                  style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                                  ✕ effacer
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {gAnyActive && (
                          <button onClick={() => { setFilterRating(null); setFilterEnding(null); setFilterCompleted(null); setSortRating(null); setFilterNoteMin(null); setFilterNoteMax(null); setOpenFilter(null); setPage(1) }}
                            style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>
                            ✕ tout effacer
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {globalSorted.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div className="handwriting" style={{ fontSize: 24, color: 'var(--ink-mute)' }}>aucune fic trouvée…</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '48px 30px' }}>
                      {globalPaginated.map((fic, i) => (
                        <FicCard key={fic.id} fic={fic} i={i} canEdit={!!session} onRatingChange={handleRatingChange} onEdit={startEdit} />
                      ))}
                    </div>
                  )}
                  {renderPagination(globalSafePage, globalTotalPages, setPage)}
                </>
              ) : (
                /* Vue dossiers par univers */
                universes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Doodle kind="flower" size={48} color="var(--pinktone)" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <div className="handwriting" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>
                      la bibliothèque est vide pour l&apos;instant…
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '28px 20px' }}>
                    {universes.map(u => (
                      <UniverseFolder key={u} name={u} count={universeMap[u].length} onClick={() => openUniverse(u)} />
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {/* ── VUE INTÉRIEURE UNIVERS ── */}
          {!loading && !error && selectedUniverse && (
            <>
              {/* Barre de recherche */}
              <div style={{ marginBottom: 36 }}>
                <div className="card" style={{ padding: '12px 18px', transform: 'rotate(-0.5deg)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--ink-mute)', flexShrink: 0 }}>RECHERCHE</span>
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="titre, auteur, ship…"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--f-hand)', fontSize: 22, color: 'var(--ink)' }}
                  />
                  {search && (
                    <button onClick={() => { setSearch(''); setPage(1) }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--ink-mute)', padding: 0 }}>
                      ×
                    </button>
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="handwriting" style={{ fontSize: 24, color: 'var(--ink-mute)' }}>aucune fic trouvée…</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '48px 30px' }}>
                  {paginated.map((fic, i) => <FicCard key={fic.id} fic={fic} i={i} canEdit={!!session} onRatingChange={handleRatingChange} onTagClick={t => { setFilterTag(p => p === t ? null : t); setPage(1) }} activeTag={filterTag} onEdit={startEdit} />)}
                </div>
              )}

              {renderPagination(safePage, totalPages, setPage)}
            </>
          )}

          {/* ── VUE À LIRE ── */}
        </div>

        {/* Décoratifs */}
        <Sticker kind="branch"        size={100} rot={15} style={{ position: 'absolute', top: 72, right: 40, opacity: .65 }} />
        <Sticker kind="butterfly_grn" size={70}  rot={-8} style={{ position: 'absolute', bottom: 80, left: 44, opacity: .6 }} />
        <div className="floral-corner floral-corner--br" style={{ opacity: .5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 24, right: 60, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.3em', color: 'var(--ink-mute)', pointerEvents: 'none' }}>
          ─ 02 / 05 ─
        </div>
      </Page>

      <HigurumaMascot />
    </>
  )
}
