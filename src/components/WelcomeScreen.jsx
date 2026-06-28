import { useState } from 'react'
import { CITIES } from '../data/cities'
import useGameStore from '../store/useGameStore'

const MAX_CITIES = 3

function bubble(left, top, size, color, delay, dur) {
  return (
    <div key={`${left}${top}`} style={{
      position: 'absolute', left, top,
      width: size, height: size,
      borderRadius: '50%', background: color, opacity: .6,
      animation: `float ${dur}s ease-in-out infinite ${delay}s`,
      pointerEvents: 'none',
    }} />
  )
}

function CityCard({ city, selected, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative',
        background: selected ? city.accentSoft : '#fffdf7',
        border: `2.5px solid ${selected ? city.ink : city.accentSoft}`,
        borderRadius: 16, padding: '12px 12px 10px',
        cursor: (disabled && !selected) ? 'default' : 'pointer',
        textAlign: 'left',
        boxShadow: selected ? `0 4px 0 -1px ${city.accent}` : '0 3px 0 #ede8df',
        transition: 'all .15s',
        opacity: (disabled && !selected) ? 0.4 : 1,
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 7, right: 7,
          width: 20, height: 20, borderRadius: '50%',
          background: city.ink, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 800,
        }}>✓</div>
      )}
      <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 5 }}>{city.flag}</div>
      <div style={{
        fontFamily: 'Fredoka', fontWeight: 600,
        fontSize: 'clamp(13px,3.2vw,16px)', lineHeight: 1.15,
        color: selected ? city.ink : '#4a3528', marginBottom: 2,
      }}>{city.name}</div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        textTransform: 'uppercase', color: city.ink, opacity: selected ? 0.8 : 0.55,
      }}>{city.country}</div>
    </button>
  )
}

export default function WelcomeScreen() {
  const startApp = useGameStore(s => s.startApp)

  const [step, setStep]           = useState('name')
  const [name, setName]           = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const toggleCity = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_CITIES) return prev
      return [...prev, id]
    })
  }

  const handleNameNext = () => { if (name.trim()) setStep('cities') }

  const handleStart = () => {
    if (!selectedIds.length) return
    const cities = CITIES.filter(c => selectedIds.includes(c.id))
    startApp(name.trim(), cities)
  }

  const isCities = step === 'cities'

  return (
    <section style={{
      position: 'relative', minHeight: '100dvh',
      display: 'grid', placeItems: 'center',
      padding: 'clamp(12px,3vw,24px) 16px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% -10%, #eef7e4, #fffdf7 58%)',
    }}>
      {bubble('12%','16%',34,'#cdeab0',0,7)}
      {bubble('80%','24%',20,'#bfe0f2',.5,5.6)}
      {bubble('20%','80%',24,'#ffd9a3',.3,6.4)}
      {bubble('76%','72%',16,'#ffc6d3',.7,5.2)}

      <div style={{
        position: 'relative', width: '100%', maxWidth: 480,
        maxHeight: isCities ? '92dvh' : undefined,
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: '2px solid #f0e3cf', borderRadius: 30,
        boxShadow: '0 18px 0 -8px #ead9bf',
        overflow: 'hidden',
        animation: 'fadein .22s ease both',
      }}>

        {/* ── STEP: name ── */}
        {step === 'name' && (
          <div style={{ padding: 'clamp(22px,5vw,34px) clamp(20px,5vw,30px)', textAlign: 'center' }}>
            <img src="/plane-icon.png" alt="" style={{ width: 74, display: 'block', margin: '0 auto 6px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.12))' }} />
            <h1 style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(28px,8vw,34px)', lineHeight: 1.05, margin: '4px 0 10px', color: '#4a3528' }}>
              Stampbook
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 14.5, fontWeight: 500, color: '#8b7355' }}>
              Explore cities, complete real-world photo quests, and collect stamps of your adventures.
            </p>
            <div style={{ textAlign: 'left', marginBottom: 18 }}>
              <label style={{ display: 'block', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: '#6b5742', marginBottom: 7 }}>
                What should we call you?
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                placeholder="Type your name…"
                maxLength={24}
                autoFocus
                style={{
                  width: '100%', border: '2px solid #f0e3cf', background: '#fffdf7',
                  borderRadius: 14, padding: '14px 16px',
                  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 16, color: '#5c4033',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#d4b896'}
                onBlur={e => e.target.style.borderColor = '#f0e3cf'}
              />
            </div>
            <button
              onClick={handleNameNext}
              disabled={!name.trim()}
              style={{
                width: '100%', padding: '15px 24px',
                fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17,
                border: 'none', borderRadius: 16, cursor: name.trim() ? 'pointer' : 'default',
                background: name.trim() ? '#9acd7b' : '#e8d4b8',
                color: name.trim() ? '#fff' : '#b39875',
                boxShadow: name.trim() ? '0 5px 0 #7fb262' : 'none',
                transition: 'background .2s, box-shadow .2s',
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP: cities ── */}
        {step === 'cities' && (
          <>
            <div style={{ padding: '18px 20px 12px', borderBottom: '2px solid #f0e3cf', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 21, color: '#4a3528', marginBottom: 2 }}>
                Pick your cities
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#9a8467' }}>
                Choose up to {MAX_CITIES} to start — you can add more later.
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '12px 14px 4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {CITIES.map(c => (
                  <CityCard
                    key={c.id}
                    city={c}
                    selected={selectedIds.includes(c.id)}
                    onToggle={() => toggleCity(c.id)}
                    disabled={selectedIds.length >= MAX_CITIES}
                  />
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 16px 16px', borderTop: '2px solid #f0e3cf', flexShrink: 0 }}>
              <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#9a8467', marginBottom: 8 }}>
                {selectedIds.length === 0
                  ? 'Select at least one city to continue'
                  : `${selectedIds.length} of ${MAX_CITIES} selected`}
              </div>
              <button
                onClick={handleStart}
                disabled={!selectedIds.length}
                style={{
                  width: '100%', padding: '14px 24px',
                  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17,
                  border: 'none', borderRadius: 16,
                  cursor: selectedIds.length ? 'pointer' : 'default',
                  background: selectedIds.length ? '#9acd7b' : '#e8d4b8',
                  color: selectedIds.length ? '#fff' : '#b39875',
                  boxShadow: selectedIds.length ? '0 5px 0 #7fb262' : 'none',
                  transition: 'all .2s',
                }}
              >
                Let's go!
              </button>
              <button
                onClick={() => setStep('name')}
                style={{ display: 'block', width: '100%', marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#b39875', fontWeight: 600, fontSize: 13 }}
              >
                ← Back
              </button>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
