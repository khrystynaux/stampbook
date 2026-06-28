import { useState, useEffect, useRef, useCallback } from 'react'
import useGameStore, { rotFromId } from '../store/useGameStore'
import { savePhoto } from '../utils/db'

const MAX_DIM = 1100 // max px, matching the original design
const JPEG_Q  = 0.82

// Downscale + re-encode to JPEG — keeps photos small enough for reliable storage.
function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth  || img.width
      let h = img.naturalHeight || img.height
      if (w > MAX_DIM || h > MAX_DIM) {
        const scale = MAX_DIM / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }
      try {
        const cv  = document.createElement('canvas')
        cv.width  = w; cv.height = h
        cv.getContext('2d').drawImage(img, 0, 0, w, h)
        const out = cv.toDataURL('image/jpeg', JPEG_Q)
        resolve(out && out.length > 32 ? out : dataUrl)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function findActivity(activityId, cities) {
  for (const city of cities) {
    const act = city.activities.find(a => a.id === activityId)
    if (act) return { activity: act, city }
  }
  return null
}

// ── Stamp overlay (plays on top of the photo) ────────────────────────────────

function StampOverlay({ city, activity, rot, phase }) {
  // phase: 'impact' | 'lift'
  const showSplat   = phase === 'impact'
  const showImprint = phase === 'impact' || phase === 'lift'
  const showSpark   = phase === 'impact' || phase === 'lift'

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: 184, height: 184, display: 'grid', placeItems: 'center' }}>

        {showSplat && (
          <div className="anim-splat" style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 188, height: 188, borderRadius: '50%',
            background: `radial-gradient(circle, ${city.ink}, transparent 65%)`,
          }} />
        )}

        {showImprint && (
          <div
            className={phase === 'impact' ? 'anim-pop' : ''}
            style={{
              position: 'absolute', width: 178, height: 178,
              color: city.ink, fontSize: 178,
              '--rot': `${rot}deg`,
              transform: phase !== 'impact' ? `rotate(${rot}deg)` : undefined,
            }}
          >
            <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,251,242,.7),rgba(255,251,242,.25) 70%,transparent)' }} />
            <div style={{ position: 'absolute', inset: 0,       border: '0.026em solid currentColor', borderRadius: '50%', opacity: .9 }} />
            <div style={{ position: 'absolute', inset: '0.06em', border: '0.018em dashed currentColor', borderRadius: '50%', opacity: .75 }} />
            <div style={{ position: 'absolute', inset: '0.11em', border: '0.01em solid currentColor', borderRadius: '50%', opacity: .55 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              <div style={{ fontSize: '0.085em', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'Quicksand' }}>{city.short}</div>
              <div style={{ fontSize: '0.34em', margin: '0.01em 0' }}>{activity.emblem}</div>
              <div style={{ fontSize: '0.075em', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'Quicksand' }}>{activity.label}</div>
              <div style={{ fontSize: '0.05em', fontWeight: 600, opacity: .7, marginTop: '0.02em', fontFamily: 'monospace' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {showSpark && (
          <>
            <div className="anim-spark1" style={{ position: 'absolute', left: '6%',  top: '4%',    fontSize: 22, color: '#fff' }}>✦</div>
            <div className="anim-spark2" style={{ position: 'absolute', right: '2%', top: '12%',   fontSize: 16, color: city.accentSoft }}>✦</div>
            <div className="anim-spark3" style={{ position: 'absolute', left: '12%', bottom: '6%', fontSize: 13, color: '#fff' }}>✧</div>
            <div className="anim-spark4" style={{ position: 'absolute', right: '8%', bottom: '3%', fontSize: 20, color: city.accentSoft }}>✦</div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Modal root ────────────────────────────────────────────────────────────────

export default function StampModal() {
  const { modalActivityId, stamps, closeModal, openModal, addStamp, userCities } = useGameStore(s => ({
    modalActivityId: s.modalActivityId,
    stamps:          s.stamps,
    closeModal:      s.closeModal,
    openModal:       s.openModal,
    addStamp:        s.addStamp,
    userCities:      s.userCities,
  }))

  const [photo,   setPhoto]   = useState(null)  // compressed data URL
  const [caption, setCaption] = useState('')
  // phase: 'upload' | 'impact' | 'lift'
  const [phase, setPhase] = useState('upload')
  const inputRef  = useRef()
  const timerRefs = useRef([])

  const match = modalActivityId ? findActivity(modalActivityId, userCities) : null

  const clearTimers = () => { timerRefs.current.forEach(clearTimeout); timerRefs.current = [] }

  useEffect(() => {
    if (modalActivityId) { setPhoto(null); setCaption(''); setPhase('upload') }
    return clearTimers
  }, [modalActivityId])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && phase === 'upload') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal, phase])

  const handlePick = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (inputRef.current) inputRef.current.value = ''
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result)
      setPhoto(compressed)
    }
    reader.readAsDataURL(file)
  }, [])

  // Matches beginStamp() in the original: save immediately, play animation, auto-close at 1180ms.
  const handleStamp = useCallback(async () => {
    if (!photo || !match || phase !== 'upload') return
    clearTimers()

    const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    await savePhoto(`activity-${modalActivityId}`, photo)
    addStamp(modalActivityId, { caption: caption.trim(), date })

    try { if (navigator.vibrate) navigator.vibrate([30, 40, 20]) } catch {}

    setPhase('impact')
    timerRefs.current.push(setTimeout(() => setPhase('lift'),    560))
    timerRefs.current.push(setTimeout(() => closeModal(),       1180))
  }, [photo, match, phase, modalActivityId, caption, addStamp, closeModal])

  if (!match) return null
  const { activity: a, city } = match
  const rot = rotFromId(a.id)
  const isAnimating = phase !== 'upload'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget && !isAnimating) closeModal() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        display: 'grid', placeItems: 'center',
        padding: 'clamp(12px,3vw,18px)',
        background: 'rgba(74,53,40,.42)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        animation: 'fadein .2s ease both',
      }}
    >
      <div
        className="anim-scalein"
        style={{
          position: 'relative', width: '100%', maxWidth: 430,
          maxHeight: '94dvh', overflowY: 'auto',
          background: '#fffdf7', border: '2px solid #f0e3cf', borderRadius: 28,
          boxShadow: '0 24px 60px rgba(74,53,40,.3)',
        }}
      >
        {/* Close button — hidden during animation */}
        {!isAnimating && (
          <button onClick={closeModal} style={{
            position: 'absolute', right: 14, top: 14, zIndex: 5,
            width: 34, height: 34, borderRadius: '50%',
            border: '2px solid #f0e3cf', background: '#fff', color: '#a8916f',
            fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}>✕</button>
        )}

        {/* Header */}
        <div style={{ background: city.tint, padding: '18px 22px 14px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 90% 120%, ${city.accent}, transparent 60%)`, opacity: .5 }} />
          <div style={{ position: 'relative', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(17px,4vw,22px)', lineHeight: 1.1, color: '#4a3528' }}>
            {a.name}
          </div>
          <div style={{ position: 'relative', fontSize: 13, fontWeight: 600, color: city.ink, marginTop: 4 }}>
            {city.name} · {a.label}
          </div>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          {/* Photo area — always visible, stamp animates on top */}
          {photo ? (
            <div className="anim-popin" style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden',
              border: '4px solid #fff', boxShadow: '0 8px 20px rgba(74,53,40,.2)',
              height: 'clamp(200px,45vw,236px)', marginBottom: 14, background: '#efe5d3',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: `url(${photo}) center/cover` }} />
              {isAnimating && <StampOverlay city={city} activity={a} rot={rot} phase={phase} />}
              {!isAnimating && (
                <label style={{
                  position: 'absolute', right: 10, bottom: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,.92)', color: '#6b5742',
                  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13,
                  padding: '5px 10px', borderRadius: 99, cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(74,53,40,.2)',
                }}>
                  ↻ Retake
                  <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handlePick} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          ) : (
            <div style={{
              position: 'relative',
              border: '3px dashed #d8c5a6', borderRadius: 20,
              background: 'repeating-linear-gradient(45deg,#fdf8ee,#fdf8ee 11px,#fbf3e4 11px,#fbf3e4 22px)',
              height: 'clamp(200px,45vw,236px)', marginBottom: 14,
              display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20,
            }}>
              <div>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#6b5742', marginBottom: 18 }}>
                  Add your photo from {a.name}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <label style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: city.ink, color: '#fff',
                      fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
                      padding: '10px 18px', borderRadius: 99,
                      boxShadow: '0 4px 0 0 rgba(0,0,0,.16)', whiteSpace: 'nowrap',
                    }}>
                      Take photo
                    </div>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePick} style={{ display: 'none' }} />
                  </label>
                  <label style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: city.accentSoft, color: city.ink,
                      fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
                      padding: '10px 18px', borderRadius: 99,
                      boxShadow: '0 3px 0 0 rgba(0,0,0,.08)', whiteSpace: 'nowrap',
                    }}>
                      Upload photo
                    </div>
                    <input type="file" accept="image/*" onChange={handlePick} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Caption + stamp button — only in upload phase */}
          {!isAnimating && (
            <>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="✎ Add a memory note (optional)"
                maxLength={120}
                style={{
                  width: '100%', border: '2px solid #f0e3cf', background: '#fff',
                  borderRadius: 13, padding: '12px 14px',
                  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033',
                  outline: 'none', marginBottom: 14, display: 'block',
                }}
              />
              <button
                onClick={handleStamp}
                disabled={!photo}
                style={{
                  width: '100%', padding: '15px 24px',
                  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18,
                  border: 'none', borderRadius: 16, cursor: photo ? 'pointer' : 'not-allowed',
                  background: photo ? city.ink : '#ece2d2',
                  color: photo ? '#fff' : '#bcab95',
                  boxShadow: photo ? '0 5px 0 0 rgba(0,0,0,.18)' : 'none',
                  transition: 'all .2s',
                }}
              >
                ⬇ Stamp it!
              </button>
            </>
          )}

          {/* Busy text during animation */}
          {isAnimating && (
            <div style={{ height: 54, display: 'grid', placeItems: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: city.ink }}>
              {phase === 'impact' ? 'KA-CHUNK!' : 'Collecting…'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
