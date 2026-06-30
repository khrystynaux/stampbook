import { useMemo, useState } from 'react'
import useGameStore, { rotFromId, tiltFromId } from '../store/useGameStore'
import { useActivityPhoto } from '../hooks/usePhoto'
import StampCircle from './StampCircle'

// ── Quest card ─────────────────────────────────────────────────────────────────

function QuestCard({ activity: a, city, stamps, openModal }) {
  const isStamped = !!stamps[a.id]
  const photoUrl  = useActivityPhoto(isStamped ? a.id : null)
  const stamp     = stamps[a.id]
  const rot       = rotFromId(a.id)

  // Matches cardStyle() in the original: border + background differ by stamped state.
  const cardInnerStyle = {
    position: 'relative',
    aspectRatio: '3/4',
    borderRadius: 22,
    overflow: 'hidden',
    border: `2px solid ${isStamped ? '#ead9bf' : '#f0e3cf'}`,
    background: isStamped
      ? `linear-gradient(150deg, ${city.tint}, ${city.accentSoft})`
      : '#fff',
    cursor: isStamped ? 'default' : 'pointer',
    boxShadow: '0 8px 0 -4px #f3e7d3',
    transition: 'transform .14s, box-shadow .14s',
  }

  return (
    <div className={isStamped ? '' : 'quest-card'} onClick={() => !isStamped && openModal(a.id)}>
      <div style={cardInnerStyle}>
        {isStamped
          ? <StampedCard photoUrl={photoUrl} a={a} city={city} rot={rot} stamp={stamp} />
          : <UnstampedCard a={a} city={city} />}
      </div>
    </div>
  )
}

function StampedCard({ photoUrl, a, city, rot, stamp }) {
  return (
    <>
      {photoUrl && (
        <div style={{ position: 'absolute', inset: 0, background: `url(${photoUrl}) center/cover` }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(74,53,40,.08)' }} />

      {/* top-left label + name */}
      <div style={{
        position: 'absolute', left: 11, top: 11, maxWidth: 'calc(100% - 22px)',
        background: 'rgba(28,18,12,.34)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 15, padding: '9px 11px 10px', boxShadow: '0 2px 8px rgba(0,0,0,.22)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontWeight: 700, fontSize: 11, letterSpacing: .5, padding: '3px 9px', borderRadius: 99,
          textTransform: 'uppercase', color: city.ink, background: city.accentSoft, marginBottom: 5,
        }}>
          {a.label}
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, lineHeight: 1.15, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>
          {a.name}
        </div>
      </div>

      {/* stamp bottom-right */}
      <div style={{
        position: 'absolute', right: 11, bottom: 11,
        width: 68, height: 68, display: 'grid', placeItems: 'center',
        borderRadius: '50%',
        background: 'rgba(255,251,242,.94)',
        backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        boxShadow: '0 3px 10px rgba(0,0,0,.3)',
      }}>
        <StampCircle size={58} ink={city.ink} cityShort={city.short} emblem={a.emblem} label={a.label} rot={rot} />
      </div>

      {stamp?.caption && (
        <div style={{
          position: 'absolute', left: 11, right: 90, bottom: 11,
          background: 'rgba(28,18,12,.5)', backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)',
          borderRadius: 13, padding: '8px 10px', boxShadow: '0 2px 10px rgba(0,0,0,.3)',
        }}>
          <div style={{ fontSize: 13, fontStyle: 'italic', fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>
            "{stamp.caption}"
          </div>
        </div>
      )}
    </>
  )
}

function UnstampedCard({ a, city }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 'clamp(10px,3vw,16px) clamp(10px,3vw,14px)' }}>
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 5,
        fontSize: 'clamp(9px,2vw,11px)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
        color: city.ink, background: city.accentSoft,
        padding: 'clamp(2px,0.5vw,3px) clamp(5px,1.5vw,8px)', borderRadius: 99, marginBottom: 'clamp(5px,1.5vw,9px)',
      }}>
        {a.label}
      </div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, lineHeight: 1.15, color: '#4a3528', marginBottom: 'clamp(3px,1vw,5px)' }}>
        {a.name}
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#9a8467', lineHeight: 1.35 }}>
        {a.blurb}
      </p>
      <div style={{ flex: 1, minHeight: 6 }} />
      <div style={{
        border: '2px dashed #d8c5a6', borderRadius: 14, padding: 'clamp(7px,2vw,12px) 10px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#b89a72',
        background: 'repeating-linear-gradient(45deg,#fdf8ee,#fdf8ee 8px,#fbf3e4 8px,#fbf3e4 16px)',
      }}>
        <div style={{ fontSize: 'clamp(15px,3.5vw,22px)' }}>📷</div>
        <div style={{ fontSize: 'clamp(9px,2vw,12px)', fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase' }}>Add photo</div>
      </div>
    </div>
  )
}

// ── Local Favorites section ───────────────────────────────────────────────────

function LocalSection({ city, stamps, openModal }) {
  const localActs   = city.activities.filter(a => a.level === 'local')
  const touristActs = city.activities.filter(a => a.level === 'tourist')
  const touristDone = touristActs.filter(a => stamps[a.id]).length
  const allUnlocked = touristDone >= touristActs.length
  const pct  = touristActs.length ? Math.round((touristDone / touristActs.length) * 100) : 0
  const left = touristActs.length - touristDone

  return (
    <>
      <SectionHeader label="Local Favorites" level={2} acts={localActs} done={stamps} ink={city.ink} accentSoft={city.accentSoft} />

      {!allUnlocked ? (
        <div style={{
          position: 'relative',
          border: '2px dashed #e3d3b5', borderRadius: 24,
          background: 'repeating-linear-gradient(135deg,#fdf8ee,#fdf8ee 14px,#fbf3e4 14px,#fbf3e4 28px)',
          padding: '38px 26px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🔒</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#6b5742', marginBottom: 6 }}>
            Locals are keeping these secret…
          </div>
          <p style={{ margin: '0 auto 16px', maxWidth: 420, fontSize: 14, fontWeight: 500, color: '#9a8467' }}>
            Finish the Must See activities to unlock {localActs.length} spots recommended by locals.
          </p>
          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <div style={{ height: 12, borderRadius: 99, background: '#efe5d3', overflow: 'hidden', marginBottom: 7 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: city.ink, transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#a8916f' }}>{left} to go</div>
          </div>
        </div>
      ) : (
        <div className="quest-grid" style={{ marginBottom: 30 }}>
          {localActs.map(a => (
            <QuestCard key={a.id} activity={a} city={city} stamps={stamps} openModal={openModal} />
          ))}
        </div>
      )}
    </>
  )
}

function SectionHeader({ label, level, acts, done, ink, accentSoft }) {
  const doneCount = acts.filter(a => done[a.id]).length
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      <h2 style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(18px,4vw,22px)', margin: 0, color: '#4a3528' }}>
        {label}
      </h2>
      <span style={{ background: accentSoft, color: ink, fontWeight: 700, fontSize: 12, letterSpacing: .5, padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase' }}>
        LEVEL {level}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: '#a8916f' }}>{doneCount}/{acts.length}</span>
    </div>
  )
}

// ── City scrapbook ────────────────────────────────────────────────────────────

function CityScrapbook({ city, stamps }) {
  const cityStamps = useMemo(() =>
    city.activities.filter(a => stamps[a.id]).map(a => ({ ...a, stamp: stamps[a.id] }))
  , [city, stamps])

  const count = cityStamps.length

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexDirection: 'row-reverse' }}>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#a8916f' }}>{count} photo{count !== 1 ? 's' : ''}</span>
      </div>
      {count === 0 ? (
        <div style={{ border: '2px dashed #e3d3b5', borderRadius: 24, background: 'repeating-linear-gradient(135deg,#fdf8ee,#fdf8ee 14px,#fbf3e4 14px,#fbf3e4 28px)', padding: '44px 26px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 19, color: '#6b5742', marginBottom: 5 }}>
            No photos from {city.name} yet
          </div>
          <p style={{ margin: '0 auto', maxWidth: 380, fontSize: 14, fontWeight: 500, color: '#9a8467' }}>
            Stamp a quest with a photo and your memories from this city will gather here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,190px),1fr))', gap: 20 }}>
          {cityStamps.map(e => <CityScrapCard key={e.id} entry={e} city={city} />)}
        </div>
      )}
    </>
  )
}

function CityScrapCard({ entry: e, city }) {
  const photoUrl = useActivityPhoto(e.id)
  const tilt = tiltFromId(e.id)

  return (
    <div style={{ background: '#fff', border: '2px solid #f0e3cf', borderRadius: 6, padding: '11px 11px 14px', boxShadow: '0 8px 0 -4px #f0e3cf', transform: `rotate(${tilt}deg)` }}>
      <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden', background: '#efe5d3' }}>
        {photoUrl && <div style={{ position: 'absolute', inset: 0, background: `url(${photoUrl}) center/cover` }} />}
        <div style={{ position: 'absolute', right: 8, bottom: 8 }}>
          <StampCircle size={58} ink={city.ink} cityShort={city.short} emblem={e.emblem} />
        </div>
      </div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: '#4a3528', marginTop: 10, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {e.name}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#b39875' }}>
        {e.stamp.date}
      </div>
      {e.stamp.caption && (
        <div style={{ fontSize: 13, fontStyle: 'italic', color: '#8b7355', marginTop: 6, lineHeight: 1.3 }}>
          "{e.stamp.caption}"
        </div>
      )}
    </div>
  )
}

// ── City detail root ──────────────────────────────────────────────────────────

const CITY_TAB_ORDER = ['stamps', 'scrapbook']

export default function CityDetail() {
  const { activeCityId, stamps, cityTab, setCityTab, openModal, goHome, userCities } = useGameStore(s => ({
    activeCityId: s.activeCityId,
    stamps:       s.stamps,
    cityTab:      s.cityTab,
    setCityTab:   s.setCityTab,
    openModal:    s.openModal,
    goHome:       s.goHome,
    userCities:   s.userCities,
  }))

  const city = userCities.find(c => c.id === activeCityId)

  const [cityTabDir, setCityTabDir] = useState(1)

  const handleCityTabChange = (tab) => {
    window.scrollTo(0, 0)
    const prev = CITY_TAB_ORDER.indexOf(cityTab)
    const next = CITY_TAB_ORDER.indexOf(tab)
    setCityTabDir(next >= prev ? 1 : -1)
    setCityTab(tab)
  }

  const tabAnim = cityTabDir >= 0 ? 'anim-tab-right' : 'anim-tab-left'

  if (!city) return null

  const touristActs = city.activities.filter(a => a.level === 'tourist')
  const totalDone   = city.activities.filter(a => stamps[a.id]).length

  return (
    <section>
      {/* Banner */}
      <div style={{ position: 'relative', background: city.tint, overflow: 'hidden', borderBottom: '2px solid #f0e3cf' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 85% 130%, ${city.accent}, transparent 55%)`, opacity: .5 }} />
        <div style={{
          position: 'absolute', right: '2%', bottom: -50,
          fontSize: 'clamp(120px,25vw,240px)', lineHeight: 1,
          color: city.ink, opacity: .1, fontFamily: 'Fredoka',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          {city.emblem}
        </div>

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: 'clamp(14px,3vw,18px) clamp(16px,4vw,40px) clamp(20px,4vw,30px)' }}>
          <button
            onClick={goHome}
            className="back-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '2px solid #f0e3cf', color: '#8b7355',
              fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
              padding: '7px 14px', borderRadius: 99, cursor: 'pointer', marginBottom: 16,
              transition: 'background .15s',
            }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'clamp(12px,3vw,22px)' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: city.ink, opacity: .8, marginBottom: 4 }}>
                {city.country}
              </div>
              <h1 style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(28px,7vw,54px)', lineHeight: 1, margin: '0 0 8px', color: '#4a3528' }}>
                {city.name}
              </h1>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#8b7355', maxWidth: 420 }}>
                Upload your photos to earn activity stamps.
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#fff', border: '2px solid #f0e3cf', borderRadius: 20,
              padding: '12px 18px', boxShadow: '0 6px 0 -2px rgba(0,0,0,.04)', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, lineHeight: 1, color: '#4a3528' }}>
                  {totalDone}<span style={{ fontSize: 14, color: '#b39875' }}>/{city.activities.length}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#a8916f' }}>stamps</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px,4vw,26px) clamp(16px,4vw,40px) 90px' }}>
        {/* Tab nav */}
        <div style={{ marginBottom: 26 }}>
          <nav style={{ display: 'inline-flex', background: '#f3e7d3', borderRadius: 99, padding: 4, gap: 4 }}>
            {['stamps', 'scrapbook'].map(t => (
              <button key={t} onClick={() => handleCityTabChange(t)} style={{
                fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
                padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: cityTab === t ? '#fff' : 'transparent',
                color: cityTab === t ? '#5c4033' : '#a8916f',
                boxShadow: cityTab === t ? '0 1px 3px rgba(74,53,40,.12)' : 'none',
                transition: 'all .18s', textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </nav>
        </div>

        {cityTab === 'stamps' && (
          <div key={`stamps-${activeCityId}`} className={tabAnim}>
            <SectionHeader
              label="Must-See" level={1}
              acts={touristActs} done={stamps}
              ink={city.ink} accentSoft={city.accentSoft}
            />
            <div className="quest-grid" style={{ marginBottom: 34 }}>
              {touristActs.map(a => (
                <QuestCard key={a.id} activity={a} city={city} stamps={stamps} openModal={openModal} />
              ))}
            </div>
            <LocalSection city={city} stamps={stamps} openModal={openModal} />
          </div>
        )}

        {cityTab === 'scrapbook' && (
          <div key={`scrapbook-${activeCityId}`} className={tabAnim}>
            <CityScrapbook city={city} stamps={stamps} />
          </div>
        )}
      </div>
    </section>
  )
}
