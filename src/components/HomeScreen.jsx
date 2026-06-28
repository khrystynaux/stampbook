import { useState, useMemo, useRef } from 'react'
import { CITIES } from '../data/cities'
import useGameStore, { rotFromId, tiltFromId, getRank } from '../store/useGameStore'
import { useActivityPhoto, useTravelerPhoto } from '../hooks/usePhoto'
import { savePhoto, deletePhoto } from '../utils/db'
import StampCircle from './StampCircle'

// ── Rank tooltip ─────────────────────────────────────────────────────────────

function RankBadge({ rank }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={() => setHover(v => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff3d6', border: '2px solid #ffe1a8', color: '#c79a3a', fontWeight: 700, fontSize: 14, padding: '6px 13px', borderRadius: 99, marginBottom: 16, cursor: 'default', userSelect: 'none' }}
      >
        ✦ {rank.name}
      </div>
      {hover && (
        <div style={{
          position: 'absolute', left: 0, top: 'calc(100% + 8px)', zIndex: 20,
          width: 'max-content', maxWidth: 220,
          background: '#fff', border: '2px solid #f0e3cf', borderRadius: 14,
          boxShadow: '0 12px 26px rgba(74,53,40,.18)', padding: '11px 13px',
          animation: 'fadein .18s ease both',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: '#4a3528' }}>{rank.next}</div>
        </div>
      )}
    </div>
  )
}

// ── Traveler photo avatar ─────────────────────────────────────────────────────

function TravelerAvatar() {
  const photoUrl = useTravelerPhoto()
  const { setHasTravelerPhoto } = useGameStore(s => ({ setHasTravelerPhoto: s.setHasTravelerPhoto }))
  const inputRef = useRef()
  const [tapVisible, setTapVisible] = useState(false)
  const isMouse = useRef(false)

  const handlePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      await savePhoto('traveler-photo', ev.target.result)
      setHasTravelerPhoto(true)
      setTapVisible(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = async (e) => {
    e.stopPropagation()
    await deletePhoto('traveler-photo')
    setHasTravelerPhoto(false)
    setTapVisible(false)
  }

  // No photo: clickable label opens file picker
  if (!photoUrl) {
    return (
      <label style={{ display: 'block', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{
          width: 'clamp(100px,15vw,140px)', height: 'clamp(100px,15vw,140px)',
          borderRadius: '50%', border: '3px solid rgba(201,168,142,.45)',
          background: 'radial-gradient(circle at 50% 38%, #fdefe6, #f6e3d3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img src="/tom-nook-face.png" alt="" style={{ width: 50, height: 50, objectFit: 'contain', display: 'block' }} />
          <div className="avatar-upload-pill" style={{ marginTop: -8 }}>Upload photo</div>
        </div>
        <input type="file" accept="image/*" onChange={handlePick} style={{ display: 'none' }} />
      </label>
    )
  }

  // Has photo: show "Upload new" + "Remove" overlay on hover (desktop) or tap (mobile)
  return (
    <div
      className="traveler-avatar-filled"
      style={{
        position: 'relative', flexShrink: 0, cursor: 'pointer',
        width: 'clamp(100px,15vw,140px)', height: 'clamp(100px,15vw,140px)',
        borderRadius: '50%', border: '3px solid rgba(201,168,142,.45)',
        background: `url(${photoUrl}) center/cover`,
        overflow: 'hidden',
      }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') isMouse.current = true }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') { isMouse.current = false; setTapVisible(false) } }}
      onClick={() => { if (!isMouse.current) setTapVisible(v => !v) }}
    >
      <div className={`traveler-avatar-ctl${tapVisible ? ' ctl-tap-visible' : ''}`}>
        <label className="traveler-ctl-replace" onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }}>
          Upload new
          <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} style={{ display: 'none' }} />
        </label>
        <button className="traveler-ctl-clear" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  )
}

// ── Passport ID card ──────────────────────────────────────────────────────────

function PassportCard({ travelerName, stamps }) {
  const done = Object.keys(stamps).length
  const rank = getRank(done)

  return (
    <div style={{
      position: 'relative', background: '#fff',
      border: '2px solid #f0e3cf', borderRadius: 28,
      overflow: 'hidden', boxShadow: '0 14px 0 -6px #f0e3cf', marginBottom: 20,
    }}>
      <div style={{ height: 14, background: 'repeating-linear-gradient(90deg,#9acd7b,#9acd7b 28px,#87ceeb 28px,#87ceeb 56px,#ffb347 56px,#ffb347 84px,#ffb7c5 84px,#ffb7c5 112px)' }} />
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: 'clamp(12px, 3vw, 24px)',
        padding: 'clamp(16px, 3vw, 24px) clamp(16px, 4vw, 34px)',
      }}>
        <TravelerAvatar />
        <div style={{ flex: '1 1 180px' }}>
          <RankBadge rank={rank} />
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(22px, 5vw, 32px)', lineHeight: 1.05, color: '#4a3528', margin: '2px 0 4px' }}>
            Hi {travelerName}!
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#a8916f' }}>Where are we going next?</div>
        </div>
      </div>
    </div>
  )
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

function TabNav({ active, onChange }) {
  const tabs = [
    { id: 'cities',    label: 'Cities' },
    { id: 'stamps',    label: 'Stamps' },
    { id: 'scrapbook', label: 'Scrapbook' },
  ]
  return (
    <nav style={{ display: 'inline-flex', gap: 4, alignItems: 'center', background: '#f3e7d3', borderRadius: 99, padding: 4 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
            padding: '7px clamp(12px, 3vw, 18px)', borderRadius: 99,
            border: 'none', cursor: 'pointer', transition: 'all .18s',
            background: active === t.id ? '#fff' : 'transparent',
            color: active === t.id ? '#5c4033' : '#a8916f',
            boxShadow: active === t.id ? '0 1px 3px rgba(74,53,40,.12)' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}

// ── City card (spread / default view) ─────────────────────────────────────────

function CitySpreadCard({ city, stamps }) {
  const goCity = useGameStore(s => s.goCity)
  const acts = city.activities
  const done = acts.filter(a => stamps[a.id]).length

  return (
    <div
      onClick={() => goCity(city.id)}
      className="city-card"
      style={{
        background: '#fff', border: '2px solid #f0e3cf', borderRadius: 26,
        overflow: 'hidden', boxShadow: '0 12px 0 -5px #f0e3cf',
      }}
    >
      {/* Banner */}
      <div style={{ position: 'relative', height: 'clamp(80px, 12vw, 104px)', background: city.tint, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 120%, ${city.accent}, transparent 60%)`, opacity: .55 }} />
        <div style={{ position: 'absolute', right: -12, bottom: -26, fontSize: 120, lineHeight: 1, color: city.ink, opacity: .13, fontFamily: 'Fredoka', pointerEvents: 'none', userSelect: 'none' }}>
          {city.emblem}
        </div>
        <div style={{ position: 'absolute', left: 18, bottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: city.ink, opacity: .75 }}>{city.country}</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(22px, 4vw, 30px)', lineHeight: 1, color: '#4a3528' }}>{city.name}</div>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 500, color: '#8b7355', minHeight: 36 }}>{city.tagline}</p>
        <div style={{ height: 11, borderRadius: 99, background: '#f2ecdf', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${(done / acts.length) * 100}%`, borderRadius: 99, background: city.ink, transition: 'width .5s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#a8916f' }}>{done}/{acts.length} stamps</div>
        </div>
        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: city.accentSoft, color: city.ink,
          fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14.5, padding: 11, borderRadius: 14,
        }}>
          Let's go
        </div>
      </div>
    </div>
  )
}

// ── Stamps gallery ────────────────────────────────────────────────────────────

function AllStampsTab({ stamps }) {
  const allActivities = useMemo(() => CITIES.flatMap(c =>
    c.activities.map(a => ({ ...a, cityShort: c.short, cityInk: c.ink }))
  ), [])

  return (
    <div className="stamp-wall">
      {allActivities.map(a => (
        <StampCell key={a.id} activity={a} stamps={stamps} />
      ))}
    </div>
  )
}

function StampCell({ activity: a, stamps }) {
  const isStamped = !!stamps[a.id]
  const photoUrl = useActivityPhoto(isStamped ? a.id : null)

  return (
    <div style={{
      aspectRatio: '1', background: '#fff', border: '2px solid #f3e7d3',
      borderRadius: 18, display: 'grid', placeItems: 'center', padding: 8, overflow: 'hidden',
    }}>
      {isStamped ? (
        <StampCircle
          size={84}
          ink={a.cityInk}
          cityShort={a.cityShort}
          emblem={a.emblem}
          label={a.label}
          rot={rotFromId(a.id)}
          photoUrl={photoUrl}
        />
      ) : (
        <div style={{
          width: 82, height: 82,
          border: '2px dashed #e3d3b5', borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          color: '#d3c2a3', fontSize: 26, opacity: .7,
        }}>?</div>
      )}
    </div>
  )
}

// ── Scrapbook ─────────────────────────────────────────────────────────────────

function ScrapbookTab({ stamps }) {
  const allEntries = useMemo(() => {
    return CITIES.flatMap(c =>
      c.activities
        .filter(a => stamps[a.id])
        .map(a => ({ ...a, cityName: c.name, cityShort: c.short, ink: c.ink, stamp: stamps[a.id] }))
    )
  }, [stamps])

  const count = allEntries.length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexDirection: 'row-reverse' }}>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#a8916f' }}>{count} photo{count !== 1 ? 's' : ''}</span>
      </div>
      {count === 0 ? (
        <div style={{ border: '2px dashed #e3d3b5', borderRadius: 24, background: 'repeating-linear-gradient(135deg,#fdf8ee,#fdf8ee 14px,#fbf3e4 14px,#fbf3e4 28px)', padding: '44px 26px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 19, color: '#6b5742', marginBottom: 5 }}>No photos yet</div>
          <p style={{ margin: '0 auto', maxWidth: 380, fontSize: 14, fontWeight: 500, color: '#9a8467' }}>
            Complete a quest and upload a photo — it'll be stamped and gathered here.
          </p>
        </div>
      ) : (
        <div className="scrap-grid">
          {allEntries.map(e => <ScrapCard key={e.id} entry={e} />)}
        </div>
      )}
    </>
  )
}

function ScrapCard({ entry: e }) {
  const photoUrl = useActivityPhoto(e.id)
  const tilt = tiltFromId(e.id)

  return (
    <div style={{
      background: '#fff', border: '2px solid #f0e3cf', borderRadius: 6,
      padding: '10px 10px 12px', boxShadow: '0 8px 0 -4px #f0e3cf',
      transform: `rotate(${tilt}deg)`,
    }}>
      <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden', background: '#efe5d3' }}>
        {photoUrl && <div style={{ position: 'absolute', inset: 0, background: `url(${photoUrl}) center/cover` }} />}
        <div style={{ position: 'absolute', right: 8, bottom: 8 }}>
          <StampCircle size={56} ink={e.ink} cityShort={e.cityShort} emblem={e.emblem} />
        </div>
      </div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, color: '#4a3528', marginTop: 9, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#b39875' }}>{e.cityName} · {e.stamp.date}</div>
      {e.stamp.caption && <div style={{ fontSize: 13, fontStyle: 'italic', color: '#8b7355', marginTop: 5, lineHeight: 1.3 }}>"{e.stamp.caption}"</div>}
    </div>
  )
}

// ── HomeScreen root ───────────────────────────────────────────────────────────

const HOME_TAB_ORDER = ['cities', 'stamps', 'scrapbook']
const TOTAL_ACTIVITIES = CITIES.reduce((n, c) => n + c.activities.length, 0)

export default function HomeScreen() {
  const { travelerName, stamps, homeTab, setHomeTab } = useGameStore(s => ({
    travelerName: s.travelerName,
    stamps:       s.stamps,
    homeTab:      s.homeTab,
    setHomeTab:   s.setHomeTab,
  }))

  const [tabDir, setTabDir] = useState(1)
  const done = Object.keys(stamps).length

  const handleTabChange = (tab) => {
    const prev = HOME_TAB_ORDER.indexOf(homeTab)
    const next = HOME_TAB_ORDER.indexOf(tab)
    setTabDir(next >= prev ? 1 : -1)
    setHomeTab(tab)
    window.scrollTo(0, 0)
  }

  const tabAnim = tabDir >= 0 ? 'anim-tab-right' : 'anim-tab-left'

  return (
    <section className="page-container">
      <PassportCard travelerName={travelerName} stamps={stamps} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <TabNav active={homeTab} onChange={handleTabChange} />
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#b39875' }}>Total stamps</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: '#6aa548' }}>{done} / {TOTAL_ACTIVITIES}</div>
        </div>
      </div>

      {homeTab === 'cities' && (
        <div key="home-cities" className={`city-grid ${tabAnim}`}>
          {CITIES.map(c => <CitySpreadCard key={c.id} city={c} stamps={stamps} />)}
        </div>
      )}

      {homeTab === 'stamps' && (
        <div key="home-stamps" className={tabAnim}>
          <AllStampsTab stamps={stamps} />
        </div>
      )}

      {homeTab === 'scrapbook' && (
        <div key="home-scrapbook" className={tabAnim}>
          <ScrapbookTab stamps={stamps} />
        </div>
      )}

      <div style={{ height: 40 }} />
    </section>
  )
}
