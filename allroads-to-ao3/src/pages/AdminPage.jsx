import { useState, useEffect } from 'react'
import { Page, Header, Sticky, Tape } from '../components/JournalShared'
import { supabase } from '../lib/supabase'
import { parseIntField, ficEnding, ENDING_LABEL, ENDING_COLOR } from '../lib/utils'
import TagInput from '../components/TagInput'
import ListSelect from '../components/ListSelect'
import ImageUpload from '../components/ImageUpload'
import { BloodDrop, StarMark, RatingIcon, RatingFlower, RatingPeach } from '../components/JournalShared'
import buttImg from '../assets/butt.png'

const EMPTY_FIC = {
  work_name: '', author_name: '', universe_name: '', ships: [], link: '', image_url: '',
  summary: '', my_review: '', tags: [],
  rating: '', word_count: '', chapter_count: '', read_count: '',
  good_ending: false, bad_ending: false,
  content_rating: '', top_char: [], bottom_char: [], is_switch: false, medal: '', completed: false,
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
    rating:        parseFloat(fic.rating)   || null,
    top_char:      fic.top_char?.length   ? fic.top_char   : null,
    bottom_char:   fic.bottom_char?.length ? fic.bottom_char : null,
    is_switch:     fic.is_switch ?? false,
    medal:         fic.medal || null,
    completed:     fic.completed ?? false,
    word_count:    parseIntField(fic.word_count),
    chapter_count: parseIntField(fic.chapter_count),
    read_count:    parseIntField(fic.read_count),
    good_ending:     fic.good_ending,
    bad_ending:      fic.bad_ending,
    content_rating:  fic.content_rating || null,
  }
}


function field(state, setState, key, label, opts = {}) {
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
        <input
          type={opts.type ?? 'text'}
          value={state[key]}
          onChange={e => setState(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder ?? ''}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.4px ${opts.dotted ? 'dotted' : 'solid'} var(--ink)`, fontFamily: opts.mono ? 'var(--f-mono)' : 'var(--f-hand)', fontSize: opts.mono ? 12 : 19, color: 'var(--ink)', outline: 'none', paddingBottom: 4 }}
        />
      )}
    </div>
  )
}

function FicForm({ state, setState, onSubmit, status, submitLabel, tapeLabel, tapeColor = 'var(--primrose)' }) {
  const [shipInput, setShipInput] = useState('')
  const shipInputTrimmed = shipInput.trim()
  const shipIsNew = shipInputTrimmed.length > 0 && !state.ships.includes(shipInputTrimmed)
  return (
    <div className="card" style={{ padding: '28px 28px 22px', position: 'relative', transform: 'rotate(-0.2deg)', marginBottom: 28 }}>
      <Tape kind="dots" color={tapeColor} rot={-2} style={{ top: -12, left: 44, fontSize: 10, padding: '3px 12px' }}>{tapeLabel}</Tape>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 28px', marginTop: 12 }}>
        {field(state, setState, 'work_name',     'TITRE',          { placeholder: 'nom de la fic…' })}
        {field(state, setState, 'author_name',   'AUTEUR·RICE',    { placeholder: 'nom sur AO3…' })}
        {field(state, setState, 'universe_name', 'UNIVERS',        { placeholder: 'JJK, ATLA, HP…' })}
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>SHIP(S)</div>
          <TagInput value={state.ships} onChange={ships => setState(f => ({ ...f, ships }))} placeholder="A/B, C/D…" onInputChange={setShipInput} />
          {shipIsNew && (
            <div style={{ marginTop: 5 }}>
              <button type="button"
                onClick={() => { setState(f => ({ ...f, ships: [...new Set([...f.ships, shipInputTrimmed])] })); setShipInput('') }}
                style={{ background: 'var(--lime-d)', border: 'none', borderRadius: 2, padding: '1px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, cursor: 'pointer', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>+</span> ajouter "{shipInputTrimmed}"
              </button>
            </div>
          )}
        </div>
        {field(state, setState, 'link',          'LIEN AO3',       { placeholder: 'https://archiveofourown.org/…', mono: true })}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>IMAGE DE COUVERTURE</div>
          <ImageUpload value={state.image_url} onChange={url => setState(f => ({ ...f, image_url: url }))} bucket="fanfiction-covers" />
        </div>
        {field(state, setState, 'rating',        'NOTE',           { type: 'number', placeholder: '8.5' })}
        {field(state, setState, 'word_count',    'NOMBRE DE MOTS', { type: 'number', placeholder: '94300' })}
        {field(state, setState, 'chapter_count', 'CHAPITRES',      { type: 'number', placeholder: '22' })}
        {field(state, setState, 'read_count',    'FOIS LU',        { type: 'number', placeholder: '1' })}
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
                { value: 'bad',   label: 'bad end',    icon: <BloodDrop size={16} /> },
                { value: 'open',  label: 'open end',   icon: <StarMark  size={16} /> },
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

        {/* TERMINÉE switch */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>TERMINÉE</div>
          <span className="handwriting" style={{ fontSize: 15, opacity: state.completed ? 0.4 : 1, transition: 'opacity .2s' }}>non</span>
          <button type="button" onClick={() => setState(f => ({ ...f, completed: !f.completed }))}
            style={{ position: 'relative', width: 40, height: 22, borderRadius: 11, background: state.completed ? 'var(--lime-d)' : 'rgba(29,26,22,.15)', border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 4, left: state.completed ? 22 : 4, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </button>
          <span className="handwriting" style={{ fontSize: 15, color: 'var(--lime-d)', opacity: state.completed ? 1 : 0.4, transition: 'opacity .2s' }}>oui</span>
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
              <span className="handwriting" onClick={() => setState(f => ({ ...f, is_switch: !f.is_switch }))}
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

        {field(state, setState, 'summary',   'RESUME',     { full: true, textarea: true, placeholder: 'resume de la fic…' })}
        {field(state, setState, 'my_review', 'MA REVIEW',  { full: true, textarea: true, placeholder: 'mes impressions…', dotted: true })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: status === 'saved' ? 'var(--lime-d)' : status === 'error' ? 'var(--primrose)' : 'transparent', transition: 'color .3s' }}>
          {status === 'saved' ? '✓ sauvegardé' : status === 'error' ? '✕ erreur' : '·'}
        </span>
        <button onClick={onSubmit} className="btn-stamp" style={{ padding: '10px 22px', fontSize: 13 }}>
          {status === 'saving' ? '⟳ …' : submitLabel}
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [ficsTotal,    setFicsTotal]    = useState('…')
  const [userId,       setUserId]       = useState(null)
  const [fics,         setFics]         = useState([])

  // Filtres
  const [filterSearch,     setFilterSearch]     = useState('')
  const [filterRating,     setFilterRating]     = useState(null)
  const [filterEnding,     setFilterEnding]     = useState(null)
  const [filterMedal,      setFilterMedal]      = useState(null)
  const [filterCompleted,  setFilterCompleted]  = useState(null)
  const [filterNoteMin,    setFilterNoteMin]    = useState('')
  const [filterNoteMax,    setFilterNoteMax]    = useState('')
  const [filterUniverse,   setFilterUniverse]   = useState(null)
  const [filterShip,       setFilterShip]       = useState(null)
  const [filterTag,        setFilterTag]        = useState(null)
  const [filterTopChar,    setFilterTopChar]    = useState(null)
  const [filterBottomChar, setFilterBottomChar] = useState(null)
  const [sortRating,       setSortRating]       = useState(null)
  const [openFilter,       setOpenFilter]       = useState(null)

  // Edition
  const [editId,     setEditId]     = useState(null)
  const [editFic,    setEditFic]    = useState(EMPTY_FIC)
  const [editStatus, setEditStatus] = useState('idle')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)

      const [{ count }, { data: ficsData }] = await Promise.all([
        supabase.from('fanfictions').select('*', { count: 'exact', head: true }),
        supabase.from('fanfictions').select('id,work_name,author_name,universe_name,ship_name,rating,word_count,chapter_count,read_count,good_ending,bad_ending,link,image_url,summary,my_review,tags,content_rating,top_char,bottom_char,is_switch,medal,completed').order('rating', { ascending: false, nullsFirst: false }),
      ])

      setFicsTotal(count ?? 0)
      setFics(ficsData ?? [])

    }
    load()
  }, [])

  async function refreshFics() {
    const [{ count }, { data: ficsData }] = await Promise.all([
      supabase.from('fanfictions').select('*', { count: 'exact', head: true }),
      supabase.from('fanfictions').select('id,work_name,author_name,universe_name,ship_name,rating,word_count,chapter_count,read_count,good_ending,bad_ending,link,image_url,summary,my_review,tags,content_rating,top_char,bottom_char,is_switch,medal,completed').order('rating', { ascending: false, nullsFirst: false }),
    ])
    setFicsTotal(count ?? 0)
    setFics(ficsData ?? [])
  }

  // ── Edition de fic ──
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
      good_ending:    f.good_ending    ?? false,
      bad_ending:     f.bad_ending     ?? false,
      content_rating: f.content_rating ?? '',
      top_char:       Array.isArray(f.top_char)    ? f.top_char    : f.top_char    ? [f.top_char]    : [],
      bottom_char:    Array.isArray(f.bottom_char) ? f.bottom_char : f.bottom_char ? [f.bottom_char] : [],
      is_switch:      f.is_switch ?? false,
      medal:          f.medal         ?? '',
      completed:      f.completed     ?? false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveEdit() {
    setEditStatus('saving')
    const { error } = await supabase.from('fanfictions').update(buildPayload(editFic)).eq('id', editId)
    if (!error) {
      setEditId(null)
      await refreshFics()
    }
    setEditStatus(error ? 'error' : 'saved')
    setTimeout(() => setEditStatus('idle'), 2500)
  }

  // ── Suppression fic ──
  async function deleteFic(id, name) {
    if (!confirm(`Supprimer "${name || 'cette fic'}" ?`)) return
    const { error } = await supabase.from('fanfictions').delete().eq('id', id)
    if (error) { alert(`Erreur suppression : ${error.message}`); return }
    setFics(prev => prev.filter(f => f.id !== id))
    setFicsTotal(v => Number(v) - 1)
    if (editId === id) setEditId(null)
  }

  return (
    <Page>
      <Header active="admin" />

      <div style={{ padding: '88px 56px 56px' }}>

        {/* En-tete */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>ADMIN · index / tableau de bord</div>
            <div className="heading-handwritten" style={{ fontSize: 48, marginTop: 8, color: 'var(--ink)' }}>journal log</div>
          </div>
          <Sticky bg="var(--lime)" rot={2} style={{ width: 180, color: '#fff', position: 'relative' }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', opacity: .85 }}>FICS TOTAL</div>
            <div className="serif" style={{ fontSize: 36, marginTop: 4 }}>{ficsTotal}</div>
          </Sticky>
        </div>

        {/* Formulaire edition */}
        {editId && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>MODIFIER LA FIC</div>
              <button onClick={() => setEditId(null)} className="btn-stamp" style={{ padding: '6px 14px', fontSize: 11, background: 'var(--ink)', color: 'var(--paper)' }}>× annuler</button>
            </div>
            <FicForm
              state={editFic} setState={setEditFic}
              onSubmit={saveEdit} status={editStatus}
              submitLabel="sauvegarder ✦"
              tapeLabel="modifier l'entree"
              tapeColor="var(--yucca)"
            />
          </div>
        )}


        {/* Liste des fics */}
        {(() => {
          const nMin = filterNoteMin !== '' ? parseFloat(filterNoteMin) : null
          const nMax = filterNoteMax !== '' ? parseFloat(filterNoteMax) : null
          const q = filterSearch.toLowerCase()
          const allUniverses   = [...new Set(fics.map(f => f.universe_name).filter(Boolean))].sort()
          const universeFicScope = filterUniverse ? fics.filter(f => f.universe_name === filterUniverse) : fics
          const allShips       = [...new Set(universeFicScope.map(f => f.ship_name).filter(Boolean))].sort()
          const allTags        = [...new Set(fics.flatMap(f => f.tags ?? []))].sort()
          const allTopChars    = [...new Set(universeFicScope.flatMap(f => Array.isArray(f.top_char)    ? f.top_char.filter(Boolean)    : f.top_char    ? [f.top_char]    : []))].sort()
          const allBottomChars = [...new Set(universeFicScope.flatMap(f => Array.isArray(f.bottom_char) ? f.bottom_char.filter(Boolean) : f.bottom_char ? [f.bottom_char] : []))].sort()
          const filtered = fics.filter(f => {
            if (q && !(f.work_name?.toLowerCase().includes(q) || f.author_name?.toLowerCase().includes(q) || f.universe_name?.toLowerCase().includes(q) || f.ship_name?.toLowerCase().includes(q))) return false
            if (filterUniverse && f.universe_name !== filterUniverse) return false
            if (filterRating && f.content_rating !== filterRating) return false
            if (filterEnding && ficEnding(f) !== filterEnding) return false
            if (filterMedal && f.medal !== filterMedal) return false
            if (filterCompleted !== null && Boolean(f.completed) !== filterCompleted) return false
            if (nMin != null && (f.rating ?? -Infinity) < nMin) return false
            if (nMax != null && (f.rating ?? Infinity) > nMax) return false
            if (filterShip && f.ship_name !== filterShip) return false
            if (filterTag && !(f.tags ?? []).includes(filterTag)) return false
            if (filterTopChar && !(Array.isArray(f.top_char) ? f.top_char.includes(filterTopChar) : f.top_char === filterTopChar)) return false
            if (filterBottomChar && !(Array.isArray(f.bottom_char) ? f.bottom_char.includes(filterBottomChar) : f.bottom_char === filterBottomChar)) return false
            return true
          })
          const displayFics = [...filtered].sort((a, b) => {
            if (sortRating) {
              const ar = a.rating ?? -Infinity, br = b.rating ?? -Infinity
              if (ar !== br) return sortRating === 'asc' ? ar - br : br - ar
            }
            return 0
          })
          const anyActive = filterSearch || filterUniverse || filterRating || filterEnding || filterMedal || filterCompleted !== null || filterNoteMin !== '' || filterNoteMax !== '' || filterShip || filterTag || filterTopChar || filterBottomChar || sortRating
          const moreActive = filterUniverse || filterEnding || filterMedal || filterCompleted !== null || filterNoteMin !== '' || filterNoteMax !== '' || filterShip || filterTag || filterTopChar || filterBottomChar || sortRating
          return (
        <div style={{ marginBottom: 40 }}>

          {/* Barre de filtres */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            {/* Recherche texte */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,250,240,.8)', border: '1.4px solid rgba(29,26,22,.12)', borderRadius: 4, padding: '5px 12px', flex: '1 1 200px', maxWidth: 320 }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: '.18em', color: 'var(--ink-mute)', flexShrink: 0 }}>CHERCHER</span>
              <input
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="titre, auteur, univers…"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--f-hand)', fontSize: 16, color: 'var(--ink)' }}
              />
              {filterSearch && (
                <button onClick={() => setFilterSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
              )}
            </div>

            {/* Rating circles — mêmes assets que GalleryPage */}
            {[
              { key: 'no_sex',   title: 'Pas de contenu sexuel', icon: (s) => <RatingFlower size={s} /> },
              { key: 'vanilla',  title: 'Contenu vanilla',       icon: (s) => <RatingPeach  size={s} /> },
              { key: 'explicit', title: 'Contenu explicite',      icon: (s) => <img src={buttImg} alt="explicit" style={{ width: s, height: s, objectFit: 'contain' }} /> },
            ].map(r => (
              <button key={r.key} title={r.title}
                onClick={() => setFilterRating(p => p === r.key ? null : r.key)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', padding: 3, flexShrink: 0,
                  border: filterRating === r.key ? '2px solid var(--ink)' : '1.5px solid rgba(29,26,22,.2)',
                  background: filterRating === r.key ? 'rgba(255,250,240,.98)' : 'rgba(255,250,240,.6)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: filterRating && filterRating !== r.key ? 0.35 : 1,
                  transition: 'all .15s', color: 'var(--ink)',
                }}>
                {r.icon(14)}
              </button>
            ))}

            {/* Chips actifs */}
            {filterEnding && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterEnding === 'happy' ? 'happy end ✿' : filterEnding === 'bad' ? 'bad end' : 'open end'}
                <button onClick={() => setFilterEnding(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterMedal && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterMedal === 'gold' ? '🥇' : filterMedal === 'silver' ? '🥈' : '🥉'}
                <button onClick={() => setFilterMedal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterCompleted !== null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterCompleted ? 'terminée' : 'en cours'}
                <button onClick={() => setFilterCompleted(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterUniverse && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterUniverse}
                <button onClick={() => { setFilterUniverse(null); setFilterShip(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterShip && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterShip}
                <button onClick={() => setFilterShip(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterTag && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                {filterTag}
                <button onClick={() => setFilterTag(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterTopChar && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                ▲ {filterTopChar}
                <button onClick={() => setFilterTopChar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}
            {filterBottomChar && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontFamily: 'var(--f-hand)', fontSize: 13, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 2 }}>
                ▼ {filterBottomChar}
                <button onClick={() => setFilterBottomChar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--paper)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )}

            {/* Bouton + */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenFilter(p => p ? null : 'more')}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: moreActive ? 'var(--ink)' : 'rgba(255,250,240,.6)',
                  color: moreActive ? 'var(--paper)' : 'var(--ink)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-mono)', fontSize: 16, lineHeight: 1, transition: 'all .15s',
                  boxShadow: '0 0 0 1.5px rgba(29,26,22,.2)',
                }}>
                {openFilter === 'more' ? '−' : '+'}
              </button>
              {openFilter === 'more' && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
                  background: '#fffaf0', border: '1.4px solid rgba(29,26,22,.18)',
                  borderRadius: 6, padding: '14px 16px', minWidth: 210,
                  boxShadow: '0 8px 24px rgba(0,0,0,.13)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TERMINÉE</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[[true, 'oui ✓'], [false, 'non…']].map(([val, lbl]) => (
                        <button key={String(val)} onClick={() => setFilterCompleted(p => p === val ? null : val)}
                          style={{ flex: 1, padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterCompleted === val ? 'var(--ink)' : 'transparent', color: filterCompleted === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>ENDING</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {[['happy', 'happy end ✿'], ['bad', 'bad end'], ['open', 'open end']].map(([val, lbl]) => (
                        <button key={val} onClick={() => setFilterEnding(p => p === val ? null : val)}
                          style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterEnding === val ? 'var(--ink)' : 'transparent', color: filterEnding === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>MÉDAILLE</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[['gold','🥇'],['silver','🥈'],['bronze','🥉']].map(([val, lbl]) => (
                        <button key={val} onClick={() => setFilterMedal(p => p === val ? null : val)}
                          style={{ flex: 1, padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 14, background: filterMedal === val ? 'var(--ink)' : 'transparent', color: filterMedal === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>NOTE MIN — MAX</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" min={0} max={10} step={0.5} value={filterNoteMin} placeholder="0"
                        onChange={e => setFilterNoteMin(e.target.value)}
                        style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>—</span>
                      <input type="number" min={0} max={10} step={0.5} value={filterNoteMax} placeholder="10"
                        onChange={e => setFilterNoteMax(e.target.value)}
                        style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1.2px solid var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink)', outline: 'none', textAlign: 'center', padding: '2px 0' }} />
                    </div>
                  </div>
                  {allUniverses.length > 0 && (
                    <div>
                      <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>UNIVERS</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 110, overflowY: 'auto' }}>
                        {allUniverses.map(u => (
                          <button key={u} onClick={() => { setFilterUniverse(p => p === u ? null : u); setFilterShip(null) }}
                            style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterUniverse === u ? 'var(--ink)' : 'transparent', color: filterUniverse === u ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{u}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {allShips.length > 0 && (
                    <div>
                      <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>SHIP</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 110, overflowY: 'auto' }}>
                        {allShips.map(s => (
                          <button key={s} onClick={() => setFilterShip(p => p === s ? null : s)}
                            style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterShip === s ? 'var(--ink)' : 'transparent', color: filterShip === s ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {allTags.length > 0 && (
                    <div>
                      <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TAG</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 90, overflowY: 'auto' }}>
                        {allTags.map(t => (
                          <button key={t} onClick={() => setFilterTag(p => p === t ? null : t)}
                            style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterTag === t ? 'var(--ink)' : 'transparent', color: filterTag === t ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {(filterRating === 'vanilla' || filterRating === 'explicit') && (allTopChars.length > 0 || allBottomChars.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {allTopChars.length > 0 && (
                        <div>
                          <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>▲ TOP</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {allTopChars.map(char => (
                              <button key={char} onClick={() => setFilterTopChar(p => p === char ? null : char)}
                                style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterTopChar === char ? 'var(--ink)' : 'transparent', color: filterTopChar === char ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{char}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {allBottomChars.length > 0 && (
                        <div>
                          <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>▼ BOTTOM</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {allBottomChars.map(char => (
                              <button key={char} onClick={() => setFilterBottomChar(p => p === char ? null : char)}
                                style={{ padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: filterBottomChar === char ? 'var(--ink)' : 'transparent', color: filterBottomChar === char ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{char}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 6 }}>TRI PAR NOTE</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[['asc', '↑ asc.'], ['desc', '↓ desc.']].map(([val, lbl]) => (
                        <button key={val} onClick={() => setSortRating(p => p === val ? null : val)}
                          style={{ flex: 1, padding: '3px 9px', fontFamily: 'var(--f-hand)', fontSize: 13, background: sortRating === val ? 'var(--ink)' : 'transparent', color: sortRating === val ? 'var(--paper)' : 'var(--ink)', border: '1.2px solid rgba(29,26,22,.25)', borderRadius: 3, cursor: 'pointer', transition: 'all .12s' }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  {moreActive && (
                    <button onClick={() => { setFilterUniverse(null); setFilterEnding(null); setFilterMedal(null); setFilterCompleted(null); setFilterNoteMin(''); setFilterNoteMax(''); setFilterShip(null); setFilterTag(null); setFilterTopChar(null); setFilterBottomChar(null); setSortRating(null) }}
                      style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                      ✕ effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            {anyActive && (
              <button onClick={() => { setFilterSearch(''); setFilterUniverse(null); setFilterRating(null); setFilterEnding(null); setFilterMedal(null); setFilterCompleted(null); setFilterNoteMin(''); setFilterNoteMax(''); setFilterShip(null); setFilterTag(null); setFilterTopChar(null); setFilterBottomChar(null); setSortRating(null); setOpenFilter(null) }}
                style={{ fontFamily: 'var(--f-hand)', fontSize: 12, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>
                ✕ tout effacer
              </button>
            )}
          </div>

          <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-mute)', marginBottom: 16 }}>
            MES FICS · {displayFics.length}{displayFics.length !== fics.length ? `/${fics.length}` : ''} entrees
          </div>

          {displayFics.length === 0 ? (
            <div className="handwriting" style={{ fontSize: 20, color: 'var(--ink-mute)', padding: '24px 0' }}>{fics.length === 0 ? 'aucune fic enregistree…' : 'aucun résultat pour ces filtres…'}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* En-tete colonne */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 60px 60px 80px', gap: '0 12px', padding: '6px 12px', borderBottom: '1.5px solid rgba(29,26,22,.12)' }}>
                {['🏅', 'TITRE / AUTEUR', 'FANDOM', 'SHIP', 'MOTS', 'NOTE', ''].map(h => (
                  <div key={h} className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>{h}</div>
                ))}
              </div>

              {displayFics.map((f, i) => {
                const ending = ficEnding(f)
                return (
                  <div
                    key={f.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 140px 100px 60px 60px 80px',
                      gap: '0 12px',
                      padding: '10px 12px',
                      background: editId === f.id ? 'rgba(182,187,121,.15)' : i % 2 === 0 ? 'transparent' : 'rgba(29,26,22,.025)',
                      borderBottom: '1px dotted rgba(29,26,22,.08)',
                      alignItems: 'center',
                      transition: 'background .15s',
                    }}
                  >
                    {/* Médaille */}
                    <div style={{ fontSize: 17, lineHeight: 1 }}>
                      {f.medal === 'gold' ? '🥇' : f.medal === 'silver' ? '🥈' : f.medal === 'bronze' ? '🥉' : ''}
                    </div>

                    {/* Titre + auteur */}
                    <div style={{ minWidth: 0 }}>
                      <div className="handwriting" style={{ fontSize: 17, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.work_name || '(sans titre)'}
                      </div>
                      {f.author_name && (
                        <div className="mono" style={{ fontSize: 8, color: 'var(--ink-mute)', letterSpacing: '.12em', marginTop: 1 }}>
                          {f.author_name}
                        </div>
                      )}
                      <div className="mono" style={{ fontSize: 8, marginTop: 2, color: ENDING_COLOR[ending], display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        {ending === 'bad' ? <BloodDrop size={9} /> : ending === 'open' ? <StarMark size={9} /> : null}
                        {ENDING_LABEL[ending]}
                      </div>
                    </div>

                    {/* Fandom */}
                    <div className="serif" style={{ fontSize: 13, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.universe_name || '—'}
                    </div>

                    {/* Ship */}
                    <div className="handwriting" style={{ fontSize: 14, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.ship_name || '—'}
                    </div>

                    {/* Mots */}
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)' }}>
                      {f.word_count ? Number(f.word_count).toLocaleString('fr-FR') : '—'}
                    </div>

                    {/* Note */}
                    <div className="serif" style={{ fontSize: 14, color: 'var(--ink)' }}>
                      {f.rating != null ? `${f.rating}/10` : '—'}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => startEdit(f)}
                        title="modifier"
                        style={{ background: 'none', border: '1px solid rgba(29,26,22,.2)', borderRadius: 3, cursor: 'pointer', padding: '3px 8px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-mute)', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--yucca)'; e.currentTarget.style.borderColor = 'var(--yucca)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(29,26,22,.2)' }}
                      >edit</button>
                      <button
                        onClick={() => deleteFic(f.id, f.work_name)}
                        title="supprimer"
                        style={{ background: 'none', border: '1px solid rgba(29,26,22,.2)', borderRadius: 3, cursor: 'pointer', padding: '3px 8px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-mute)', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--primrose)'; e.currentTarget.style.borderColor = 'var(--primrose)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(29,26,22,.2)' }}
                      >del</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
          )
        })()}

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.3em', color: 'var(--ink-mute)' }}>─ 05 / 05 ─</span>
        </div>

      </div>
    </Page>
  )
}
