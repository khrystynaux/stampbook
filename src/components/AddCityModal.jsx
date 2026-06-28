import { CITIES } from '../data/cities'
import useGameStore from '../store/useGameStore'

function CityCard({ city, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fffdf7',
        border: `2px solid ${city.accentSoft}`,
        borderRadius: 16, padding: '12px 12px 10px',
        cursor: 'pointer', textAlign: 'left',
        boxShadow: '0 3px 0 #ede8df',
        transition: 'all .12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = city.accentSoft
        e.currentTarget.style.borderColor = city.ink
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#fffdf7'
        e.currentTarget.style.borderColor = city.accentSoft
      }}
    >
      <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 5 }}>{city.flag}</div>
      <div style={{
        fontFamily: 'Fredoka', fontWeight: 600,
        fontSize: 'clamp(13px,3.2vw,16px)', lineHeight: 1.15,
        color: '#4a3528', marginBottom: 2,
      }}>{city.name}</div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        textTransform: 'uppercase', color: city.ink, opacity: 0.65,
      }}>{city.country}</div>
    </button>
  )
}

export default function AddCityModal() {
  const { closeAddCity, addCity, userCities } = useGameStore(s => ({
    closeAddCity: s.closeAddCity,
    addCity:      s.addCity,
    userCities:   s.userCities,
  }))

  const available = CITIES.filter(c => !userCities.some(uc => uc.id === c.id))

  const handlePick = (city) => {
    addCity(city)
    closeAddCity()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) closeAddCity() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        display: 'grid', placeItems: 'center',
        padding: 'clamp(12px,3vw,20px)',
        background: 'rgba(74,53,40,.42)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        animation: 'fadein .2s ease both',
      }}
    >
      <div
        className="anim-scalein"
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '88dvh',
          display: 'flex', flexDirection: 'column',
          background: '#fffdf7', border: '2px solid #f0e3cf', borderRadius: 28,
          boxShadow: '0 24px 60px rgba(74,53,40,.3)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px 12px', borderBottom: '2px solid #f0e3cf',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#4a3528', lineHeight: 1.1 }}>
              Add another city
            </div>
          </div>
          <button
            onClick={closeAddCity}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid #f0e3cf', background: '#fff', color: '#a8916f',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* City grid */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 14px 16px' }}>
          {available.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#4a3528', marginBottom: 6 }}>
                You've explored them all!
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#9a8467' }}>
                All 10 cities are already in your passport.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {available.map(c => (
                <CityCard key={c.id} city={c} onClick={() => handlePick(c)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
