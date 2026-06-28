import { useState } from 'react'
import useGameStore from '../store/useGameStore'

export default function TopBar() {
  const { menuOpen, toggleMenu, closeMenu, goHome, openSettings } = useGameStore(s => ({
    menuOpen:     s.menuOpen,
    toggleMenu:   s.toggleMenu,
    closeMenu:    s.closeMenu,
    goHome:       s.goHome,
    openSettings: s.openSettings,
  }))

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,253,247,.9)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '2px solid #f0e3cf',
    }}>
      <div style={{
        padding: 'clamp(10px, 2vw, 12px) clamp(16px, 4vw, 40px)',
        display: 'flex', alignItems: 'center', gap: 14,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <button
          onClick={goHome}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/plane-icon.png" alt="" style={{ width: 38, height: 38, display: 'block', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.14))' }} />
          <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 19, color: '#5c4033', letterSpacing: .2, lineHeight: 1 }}>
            Stampbook
          </span>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleMenu}
            className="menu-btn"
            aria-label="Settings"
            style={{
              width: 40, height: 40, borderRadius: 13,
              border: '2px solid #f0e3cf', background: '#fff', color: '#8b7355',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              boxShadow: '0 3px 0 #f0e3cf', transition: 'background .15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 9px)', zIndex: 60,
                minWidth: 182, background: '#fff',
                border: '2px solid #f0e3cf', borderRadius: 16,
                boxShadow: '0 16px 34px rgba(74,53,40,.2)', padding: 6,
              }}>
                <MenuBtn icon="✎" label="Change Name" onClick={() => openSettings('name')} />
                <MenuBtn icon="↺" label="Reset the Game" danger onClick={() => openSettings('reset')} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={danger ? 'settings-item-danger' : 'settings-item'}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        background: 'none', border: 'none',
        fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14,
        color: danger ? '#c0492f' : '#5c4033',
        padding: '10px 12px', borderRadius: 11, cursor: 'pointer', textAlign: 'left',
        transition: 'background .15s',
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  )
}
