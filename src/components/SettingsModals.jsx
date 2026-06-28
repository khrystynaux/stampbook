import { useState } from 'react'
import useGameStore from '../store/useGameStore'

function Overlay({ children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 95,
      display: 'grid', placeItems: 'center', padding: 18,
      background: 'rgba(74,53,40,.42)',
      backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      animation: 'fadein .2s ease both',
    }}>
      {children}
    </div>
  )
}

export function ChangeNameModal() {
  const { travelerName, closeSettings, saveName } = useGameStore(s => ({
    travelerName:  s.travelerName,
    closeSettings: s.closeSettings,
    saveName:      s.saveName,
  }))
  const [draft, setDraft] = useState(travelerName)

  return (
    <Overlay>
      <div className="anim-scalein" style={{
        position: 'relative', width: '100%', maxWidth: 400,
        background: '#fffdf7', border: '2px solid #f0e3cf', borderRadius: 26,
        boxShadow: '0 24px 60px rgba(74,53,40,.3)',
        padding: 'clamp(20px, 4vw, 26px)',
      }}>
        <button onClick={closeSettings} style={closeBtnStyle}>✕</button>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 21, color: '#4a3528', marginBottom: 4 }}>
          Change your name
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 500, color: '#8b7355' }}>
          This is the name printed on your passport.
        </p>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && draft.trim() && saveName(draft)}
          placeholder="Type your name…"
          maxLength={24}
          autoFocus
          style={inputStyle}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={closeSettings} style={cancelBtnStyle}>Cancel</button>
          <button onClick={() => saveName(draft)} disabled={!draft.trim()} style={saveBtnStyle(!!draft.trim())}>Save</button>
        </div>
      </div>
    </Overlay>
  )
}

export function ResetModal() {
  const { closeSettings, confirmReset } = useGameStore(s => ({
    closeSettings: s.closeSettings,
    confirmReset:  s.confirmReset,
  }))

  return (
    <Overlay>
      <div className="anim-scalein" style={{
        position: 'relative', width: '100%', maxWidth: 400,
        background: '#fffdf7', border: '2px solid #f0e3cf', borderRadius: 26,
        boxShadow: '0 24px 60px rgba(74,53,40,.3)',
        padding: 'clamp(20px, 4vw, 28px)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 21, color: '#4a3528', marginBottom: 6 }}>
          Reset the game?
        </div>
        <p style={{ margin: '0 auto 20px', maxWidth: 330, fontSize: 14, fontWeight: 500, color: '#8b7355', lineHeight: 1.5 }}>
          This erases every stamp, photo and note, and clears your name.{' '}
          <strong style={{ color: '#c0492f' }}>This can't be undone.</strong>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={closeSettings} style={cancelBtnStyle}>Keep playing</button>
          <button
            onClick={confirmReset}
            style={{ flex: 1, background: '#c0492f', color: '#fff', border: 'none', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, padding: 12, borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 0 #9e3a24' }}
          >
            Reset everything
          </button>
        </div>
      </div>
    </Overlay>
  )
}

const closeBtnStyle = {
  position: 'absolute', right: 14, top: 14,
  width: 34, height: 34, borderRadius: '50%',
  border: '2px solid #f0e3cf', background: '#fff', color: '#a8916f',
  fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center',
}

const inputStyle = {
  width: '100%', border: '2px solid #f0e3cf', background: '#fff',
  borderRadius: 14, padding: '13px 15px',
  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 15, color: '#5c4033',
  outline: 'none', marginBottom: 16, display: 'block',
}

const cancelBtnStyle = {
  flex: 1, background: '#fff', color: '#8b7355', border: '2px solid #f0e3cf',
  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, padding: 12, borderRadius: 14, cursor: 'pointer',
}

const saveBtnStyle = (enabled) => ({
  flex: 1, background: enabled ? '#9acd7b' : '#e8d4b8', color: enabled ? '#fff' : '#b39875',
  border: 'none', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15,
  padding: 12, borderRadius: 14, cursor: enabled ? 'pointer' : 'default',
  boxShadow: enabled ? '0 4px 0 #7fb262' : 'none',
})
