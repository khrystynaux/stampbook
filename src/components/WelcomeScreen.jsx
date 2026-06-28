import { useState } from 'react'
import useGameStore from '../store/useGameStore'

export default function WelcomeScreen() {
  const startApp = useGameStore(s => s.startApp)
  const [name, setName] = useState('')

  const canStart = name.trim().length > 0

  const handleKey = (e) => {
    if (e.key === 'Enter' && canStart) startApp(name)
  }

  const bubble = (left, top, size, color, delay, dur) => (
    <div style={{
      position: 'absolute', left, top,
      width: size, height: size,
      borderRadius: '50%', background: color, opacity: .6,
      animation: `float ${dur}s ease-in-out infinite ${delay}s`,
      pointerEvents: 'none',
    }} />
  )

  return (
    <section style={{
      position: 'relative', minHeight: '100dvh',
      display: 'grid', placeItems: 'center',
      padding: 'clamp(20px, 5vw, 40px) 20px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% -10%, #eef7e4, #fffdf7 58%)',
    }}>
      {bubble('12%', '16%', 34, '#cdeab0', 0,   7)}
      {bubble('80%', '24%', 20, '#bfe0f2', .5, 5.6)}
      {bubble('20%', '80%', 24, '#ffd9a3', .3, 6.4)}
      {bubble('76%', '72%', 16, '#ffc6d3', .7, 5.2)}

      <div style={{
        position: 'relative', width: '100%', maxWidth: 460,
        background: '#fff', border: '2px solid #f0e3cf', borderRadius: 30,
        boxShadow: '0 18px 0 -8px #ead9bf',
        padding: 'clamp(24px, 5vw, 34px) clamp(20px, 5vw, 30px)',
        textAlign: 'center',
      }}>
        <img src="/plane-icon.png" alt="" style={{ width: 74, display: 'block', margin: '0 auto 6px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.12))' }} />

        <h1 style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 'clamp(28px, 8vw, 34px)', lineHeight: 1.05, margin: '4px 0 10px', color: '#4a3528' }}>
          Stampbook
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14.5, fontWeight: 500, color: '#8b7355' }}>
          Explore cities and complete real-world photo quests to collect stamps and memories.
        </p>

        <div style={{ textAlign: 'left', marginBottom: 18 }}>
          <label style={{ display: 'block', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: '#6b5742', marginBottom: 7, letterSpacing: .2 }}>
            What should we call you, traveler?
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your name…"
            maxLength={24}
            autoFocus
            style={{
              width: '100%', border: '2px solid #f0e3cf', background: '#fffdf7',
              borderRadius: 14, padding: '14px 16px',
              fontFamily: 'Quicksand', fontWeight: 600, fontSize: 16, color: '#5c4033',
              outline: 'none', transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = '#d4b896'}
            onBlur={e => e.target.style.borderColor = '#f0e3cf'}
          />
        </div>

        <button
          onClick={() => canStart && startApp(name)}
          disabled={!canStart}
          style={{
            width: '100%', padding: '15px 24px',
            fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17,
            border: 'none', borderRadius: 16, cursor: canStart ? 'pointer' : 'default',
            background: canStart ? '#9acd7b' : '#e8d4b8',
            color: canStart ? '#fff' : '#b39875',
            boxShadow: canStart ? '0 5px 0 #7fb262' : 'none',
            transition: 'background .2s, box-shadow .2s, transform .1s',
          }}
          onMouseDown={e => canStart && (e.currentTarget.style.transform = 'translateY(2px)')}
          onMouseUp={e => (e.currentTarget.style.transform = '')}
        >
          Start
        </button>
      </div>
    </section>
  )
}
