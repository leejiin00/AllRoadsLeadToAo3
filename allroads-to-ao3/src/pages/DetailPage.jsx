import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Page, Header, Tape, Sticky, BloodDrop, StarMark, Chip, Sticker, RatingFlower, RatingPeach } from '../components/JournalShared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { strHue, ficEnding, parseIntField, ENDING_LABEL, ENDING_COLOR, MEDAL_ICON, ROLE_LABEL } from '../lib/utils'
import TagInput from '../components/TagInput'
import ImageUpload from '../components/ImageUpload'
import buttImg from '../assets/butt.png'

function RatingBadge({ kind }) {
  if (!kind) return null
  const icon = kind === 'no_sex'   ? <RatingFlower size={16} />
             : kind === 'vanilla'  ? <RatingPeach  size={16} />
             : <img src={buttImg} alt="explicit" style={{ width: 16, height: 16, objectFit: 'contain' }} />
  const label = kind === 'no_sex' ? 'No Sex' : kind === 'vanilla' ? 'Sex Vanilla' : 'Sex Hardcore'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(29,26,22,.06)', borderRadius: 20, padding: '3px 10px' }}>
      {icon}
      <span className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--ink-mute)' }}>{label}</span>
    </span>
  )
}

function field(state, setState, key, label, opts = {}) {
  return (
    <div key={key} style={opts.full ? { gridColumn: '1 / -1' } : {}}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>{label}</div>
      {opts.textarea ? (
        <textarea value={state[key]} rows={3}
          onChange={e => setState(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder ?? ''}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.4px dotted var(--ink)', fontFamily: 'var(--f-hand)', fontSize: 17, color: 'var(--ink)', outline: 'none', resize: 'none', paddingBottom: 4 }}
        />
      ) : (
        <input type={opts.type ?? 'text'} value={state[key]}
          onChange={e => setState(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder ?? ''}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.4px ${opts.dotted ? 'dotted' : 'solid'} var(--ink)`, fontFamily: opts.mono ? 'var(--f-mono)' : 'var(--f-hand)', fontSize: opts.mono ? 12 : 19, color: 'var(--ink)', outline: 'none', paddingBottom: 4 }}
        />
      )}
    </div>
  )
}

const EMPTY_EDIT = {
  work_name: '', author_name: '', universe_name: '', ships: [],
  link: '', image_url: '', summary: '', my_review: '', tags: [],
  rating: '', word_count: '', chapter_count: '', read_count: '',
  good_ending: false, bad_ending: false, content_rating: '',
  top_char: '', bottom_char: '', medal: '', completed: false,
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
    top_char:      fic.top_char?.trim()    || null,
    bottom_char:   fic.bottom_char?.trim() || null,
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

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useAuth()
  const [fic,        setFic]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [netError,   setNetError]   = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)
  const [editFic,    setEditFic]    = useState(EMPTY_EDIT)
  const [editStatus, setEditStatus] = useState('idle')

  useEffect(() => {
    supabase.from('fanfictions').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) setNetError(true)
        else setFic(data)
        setLoading(false)
      })
  }, [id])

  function startEdit() {
    if (!fic) return
    setEditFic({
      work_name:     fic.work_name     ?? '',
      author_name:   fic.author_name   ?? '',
      universe_name: fic.universe_name ?? '',
      ships:         fic.ship_name ? fic.ship_name.split(' & ') : [],
      link:          fic.link          ?? '',
      image_url:     fic.image_url     ?? '',
      summary:       fic.summary       ?? '',
      my_review:     fic.my_review     ?? '',
      tags:          fic.tags          ?? [],
      rating:        fic.rating != null ? String(fic.rating) : '',
      word_count:    fic.word_count    != null ? String(fic.word_count)    : '',
      chapter_count: fic.chapter_count != null ? String(fic.chapter_count) : '',
      read_count:    fic.read_count    != null ? String(fic.read_count)    : '',
      good_ending:   fic.good_ending   ?? false,
      bad_ending:    fic.bad_ending    ?? false,
      content_rating: fic.content_rating ?? '',
      top_char:      fic.top_char     ?? '',
      bottom_char:   fic.bottom_char  ?? '',
      medal:         fic.medal        ?? '',
      completed:     fic.completed    ?? false,
    })
    setShowEdit(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveEdit() {
    setEditStatus('saving')
    const { data, error } = await supabase.from('fanfictions').update(buildPayload(editFic)).eq('id', id).select().single()
    if (!error) {
      setFic(data)
      setShowEdit(false)
    }
    setEditStatus(error ? 'error' : 'saved')
    setTimeout(() => setEditStatus('idle'), 2500)
  }

  const bg = fic?.image_url
    ? { backgroundImage: `url(${fic.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : fic
      ? { background: `linear-gradient(160deg, hsl(${strHue(fic.universe_name)},52%,80%), hsl(${(strHue(fic.universe_name) + 45) % 360},48%,55%))` }
      : {}

  const ending = fic ? ficEnding(fic) : 'open'

  return (
    <Page>
      <Header active="gallery" />

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="handwriting" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>chargement…</div>
        </div>
      )}

      {!loading && (netError || !fic) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <div className="handwriting" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>
            {netError ? 'erreur de chargement…' : 'fic introuvable…'}
          </div>
          <Link to="/gallery" className="btn-stamp">← retour à la bibliothèque</Link>
        </div>
      )}

      {!loading && fic && (
        <div style={{ padding: '88px 56px 56px' }}>

          {/* Retour */}
          <div style={{ marginBottom: 28 }}>
            <button
              onClick={() => navigate('/gallery', { state: { openUniverse: fic.universe_name } })}
              className="btn-stamp btn-stamp--ghost"
              style={{ padding: '7px 16px', fontSize: 12 }}>
              ← {fic.universe_name ?? 'bibliothèque'}
            </button>
          </div>

          {/* Formulaire d'édition */}
          {showEdit && (
            <div className="card" style={{ padding: '28px 28px 22px', position: 'relative', transform: 'rotate(-0.2deg)', marginBottom: 32 }}>
              <Tape kind="dots" color="var(--yucca)" rot={-2} style={{ top: -12, left: 44, fontSize: 10, padding: '3px 12px' }}>modifier l'entrée</Tape>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 28px', marginTop: 12 }}>
                {field(editFic, setEditFic, 'work_name',     'TITRE',          { placeholder: 'nom de la fic…' })}
                {field(editFic, setEditFic, 'author_name',   'AUTEUR·RICE',    { placeholder: 'nom sur AO3…' })}
                {field(editFic, setEditFic, 'universe_name', 'UNIVERS',        { placeholder: 'JJK, ATLA, HP…' })}
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>SHIP(S)</div>
                  <TagInput value={editFic.ships} onChange={ships => setEditFic(f => ({ ...f, ships }))} placeholder="A/B, C/D…" />
                </div>
                {field(editFic, setEditFic, 'link', 'LIEN AO3', { placeholder: 'https://archiveofourown.org/…', mono: true })}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>IMAGE DE COUVERTURE</div>
                  <ImageUpload value={editFic.image_url} onChange={url => setEditFic(f => ({ ...f, image_url: url }))} bucket="fanfiction-covers" />
                </div>
                {field(editFic, setEditFic, 'rating',        'NOTE',           { placeholder: '8.5' })}
                {field(editFic, setEditFic, 'word_count',    'NOMBRE DE MOTS', { placeholder: '94 300' })}
                {field(editFic, setEditFic, 'chapter_count', 'CHAPITRES',      { placeholder: '22' })}
                {field(editFic, setEditFic, 'read_count',    'FOIS LU',        { placeholder: '1' })}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 5 }}>TAGS</div>
                  <TagInput value={editFic.tags} onChange={tags => setEditFic(f => ({ ...f, tags }))} />
                </div>
                {/* Ending */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>ENDING</div>
                  {[['happy', 'happy end ✿', null], ['bad', 'bad end', <BloodDrop size={13} />], ['open', 'open end', <StarMark size={13} />]].map(([val, lbl, icon]) => {
                    const cur = editFic.good_ending && !editFic.bad_ending ? 'happy' : editFic.bad_ending && !editFic.good_ending ? 'bad' : 'open'
                    return (
                      <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--f-hand)', fontSize: 18 }}>
                        <input type="radio" name="edit_ending" checked={cur === val}
                          onChange={() => setEditFic(f => ({ ...f, good_ending: val === 'happy', bad_ending: val === 'bad' }))}
                          style={{ width: 15, height: 15, accentColor: 'var(--primrose)', cursor: 'pointer' }} />
                        {icon && <span style={{ marginRight: 2 }}>{icon}</span>}{lbl}
                      </label>
                    )
                  })}
                </div>
                {/* Contenu */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>CONTENU</div>
                  {[['no_sex','No Sex'], ['vanilla','Sex Vanilla'], ['explicit','Sex Hardcore']].map(([val, lbl]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--f-hand)', fontSize: 17 }}>
                      <input type="radio" name="edit_content" checked={editFic.content_rating === val}
                        onChange={() => setEditFic(f => ({ ...f, content_rating: val }))}
                        style={{ width: 15, height: 15, accentColor: 'var(--primrose)', cursor: 'pointer' }} />
                      {lbl}
                    </label>
                  ))}
                  {editFic.content_rating && (
                    <button type="button" onClick={() => setEditFic(f => ({ ...f, content_rating: '' }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-mute)', padding: 0 }}>
                      × effacer
                    </button>
                  )}
                </div>
                {/* Médaille */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>MÉDAILLE</div>
                  {[['gold','🥇 Or'],['silver','🥈 Argent'],['bronze','🥉 Bronze']].map(([val, lbl]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--f-hand)', fontSize: 18 }}>
                      <input type="radio" name="edit_medal" checked={editFic.medal === val}
                        onChange={() => setEditFic(f => ({ ...f, medal: f.medal === val ? '' : val }))}
                        onClick={() => editFic.medal === val && setEditFic(f => ({ ...f, medal: '' }))}
                        style={{ width: 15, height: 15, accentColor: 'var(--primrose)', cursor: 'pointer' }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                {/* Terminée */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--ink-mute)' }}>TERMINÉE</div>
                  <span className="handwriting" style={{ fontSize: 16, color: 'var(--ink-mute)', opacity: editFic.completed ? 0.4 : 1, transition: 'opacity .2s' }}>non</span>
                  <button type="button"
                    onClick={() => setEditFic(f => ({ ...f, completed: !f.completed }))}
                    style={{
                      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
                      background: editFic.completed ? 'var(--lime-d)' : 'rgba(29,26,22,.15)',
                      transition: 'background .2s', position: 'relative', flexShrink: 0,
                    }}>
                    <div style={{
                      position: 'absolute', top: 4, left: editFic.completed ? 22 : 4,
                      width: 14, height: 14, borderRadius: '50%',
                      background: 'white', transition: 'left .2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                    }} />
                  </button>
                  <span className="handwriting" style={{ fontSize: 16, color: 'var(--lime-d)', opacity: editFic.completed ? 1 : 0.4, transition: 'opacity .2s' }}>oui</span>
                </div>

                {/* Top / Bottom — visible uniquement si contenu sexuel */}
                {(editFic.content_rating === 'vanilla' || editFic.content_rating === 'explicit') && (
                  <>
                    {field(editFic, setEditFic, 'top_char',    '▲ TOP',    { placeholder: 'personnage top…' })}
                    {field(editFic, setEditFic, 'bottom_char', '▼ BOTTOM', { placeholder: 'personnage bottom…' })}
                  </>
                )}
                {field(editFic, setEditFic, 'summary',   'RÉSUMÉ',    { full: true, textarea: true, placeholder: 'résumé de la fic…' })}
                {field(editFic, setEditFic, 'my_review', 'MA REVIEW', { full: true, textarea: true, placeholder: 'mes impressions…', dotted: true })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
                <span className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: editStatus === 'saved' ? 'var(--lime-d)' : editStatus === 'error' ? 'var(--primrose)' : 'transparent', transition: 'color .3s' }}>
                  {editStatus === 'saved' ? '✓ sauvegardé' : editStatus === 'error' ? '✕ erreur' : '·'}
                </span>
                <button onClick={saveEdit} className="btn-stamp" style={{ padding: '10px 22px', fontSize: 13 }}>
                  {editStatus === 'saving' ? '⟳ …' : 'sauvegarder ✦'}
                </button>
              </div>
            </div>
          )}

          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
            {/* Couverture polaroid */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Tape kind="dots" color="var(--primrose)" rot={-6} style={{ top: -10, left: 20, fontSize: 10, padding: '3px 12px' }}>
                {fic.universe_name ?? '—'}
              </Tape>
              <div style={{ transform: 'rotate(-1.5deg)', background: '#fffaf0', padding: '10px 10px 36px', width: 200, boxShadow: '0 12px 28px rgba(60,40,20,.2)', position: 'relative' }}>
                <div style={{ width: '100%', height: 200, ...bg, position: 'relative' }}>
                  {fic.medal && (
                    <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 22 }}>{MEDAL_ICON[fic.medal]}</span>
                  )}
                </div>
                <div className="handwriting" style={{ fontSize: 13, marginTop: 10, textAlign: 'center', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fic.work_name}
                </div>
              </div>
            </div>

            {/* Titre + méta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '.22em', color: 'var(--ink-mute)', marginBottom: 8 }}>JOURNAL DE LECTURE</div>
              <div className="heading-handwritten" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--ink)', lineHeight: .95, marginBottom: 16 }}>
                {fic.work_name}
              </div>
              {fic.author_name && (
                <div className="mono" style={{ fontSize: 11, letterSpacing: '.18em', color: 'var(--ink-mute)', marginBottom: 8 }}>
                  by {fic.author_name}
                </div>
              )}
              {fic.ship_name && (
                <div className="handwriting" style={{ fontSize: 20, color: 'var(--ink-soft)', marginBottom: 12 }}>
                  {fic.ship_name}
                </div>
              )}

              {/* Stats ligne */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                {fic.word_count && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>MOTS</div>
                    <div className="serif" style={{ fontSize: 20 }}>{Number(fic.word_count).toLocaleString('fr-FR')}</div>
                  </div>
                )}
                {fic.chapter_count && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>CHAPITRES</div>
                    <div className="serif" style={{ fontSize: 20 }}>{fic.chapter_count}</div>
                  </div>
                )}
                {fic.read_count && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>FOIS LU</div>
                    <div className="serif" style={{ fontSize: 20 }}>{fic.read_count}×</div>
                  </div>
                )}
                {fic.rating != null && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>NOTE</div>
                    <div className="serif" style={{ fontSize: 20 }}>{fic.rating}/10</div>
                  </div>
                )}
                {fic.top_char && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>▲ TOP</div>
                    <div className="handwriting" style={{ fontSize: 18 }}>{fic.top_char}</div>
                  </div>
                )}
                {fic.bottom_char && (
                  <div>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '.2em', color: 'var(--ink-mute)' }}>▼ BOTTOM</div>
                    <div className="handwriting" style={{ fontSize: 18 }}>{fic.bottom_char}</div>
                  </div>
                )}
              </div>

              {/* Ending + contenu + tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 9, letterSpacing: '.15em', color: ENDING_COLOR[ending], display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {ending === 'bad' ? <BloodDrop size={11} /> : ending === 'open' ? <StarMark size={11} /> : null}
                  {ENDING_LABEL[ending]}
                </span>
                <RatingBadge kind={fic.content_rating} />
                {(fic.tags ?? []).map(t => (
                  <Chip key={t} kind="soft" style={{ fontSize: 11 }}>{t}</Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Corps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(320px, 30vw)', gap: 32, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {fic.summary && (
                <div className="card" style={{ padding: '24px 28px', position: 'relative', transform: 'rotate(-0.2deg)' }}>
                  <Tape kind="clean" color="var(--yucca)" rot={-1} style={{ top: -12, left: 44, fontSize: 10, padding: '3px 12px' }}>résumé</Tape>
                  <div style={{ fontFamily: 'var(--f-body)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-soft)', lineHeight: 1.7, marginTop: 8 }}>
                    {fic.summary}
                  </div>
                </div>
              )}
              {fic.my_review && (
                <div className="card" style={{ padding: '24px 28px', position: 'relative', transform: 'rotate(0.3deg)' }}>
                  <Tape kind="dots" color="var(--primrose)" rot={2} style={{ top: -12, left: 44, fontSize: 10, padding: '3px 12px' }}>ma review</Tape>
                  <div style={{ fontFamily: 'var(--f-hand)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.6, marginTop: 8 }}>
                    "{fic.my_review}"
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fic.link && (
                <a href={fic.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-stamp" style={{ width: '100%', padding: '14px 20px', fontSize: 14 }}>
                    lire sur AO3 ↗
                  </button>
                </a>
              )}
              <Sticky bg="var(--pinktone)" rot={2} style={{ position: 'relative' }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-mute)', marginBottom: 4 }}>FANDOM</div>
                <div className="serif" style={{ fontSize: 22 }}>{fic.universe_name ?? '—'}</div>
                {fic.ship_name && (
                  <>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-mute)', marginTop: 10, marginBottom: 2 }}>SHIP</div>
                    <div className="handwriting" style={{ fontSize: 18 }}>{fic.ship_name}</div>
                  </>
                )}
              </Sticky>
              {session && (
                <button
                  onClick={showEdit ? () => setShowEdit(false) : startEdit}
                  className="btn-stamp"
                  style={{ width: '100%', padding: '7px 12px', fontSize: 12,
                    background: showEdit ? 'var(--ink)' : undefined,
                    color: showEdit ? 'var(--paper)' : undefined,
                  }}>
                  {showEdit ? '× annuler' : 'modifier ✏'}
                </button>
              )}
            </div>
          </div>

          <Sticker kind="plant_leafy" size={90} rot={8}  style={{ position: 'absolute', bottom: 100, right: 32, opacity: .6 }} />
          <Sticker kind="mushrooms"   size={72} rot={-6} style={{ position: 'absolute', bottom: 110, right: 140, opacity: .55 }} />
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/gallery" className="btn-stamp btn-stamp--ghost">← retour à la bibliothèque</Link>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.3em', color: 'var(--ink-mute)' }}>─ 03 / 05 ─</span>
          </div>
        </div>
      )}
    </Page>
  )
}
