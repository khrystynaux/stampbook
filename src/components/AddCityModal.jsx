import { useState, useEffect } from 'react'
import { COUNTRIES } from '../data/countries'
import { getApiKey, fetchCitiesForCountry, generateCityActivities, buildCity } from '../utils/generateCity'
import useGameStore from '../store/useGameStore'

const GEN_TEXTS = ['Mapping the city…', 'Finding hidden gems…', 'Building your quest list…', 'Almost ready…']

export default function AddCityModal() {
  const { closeAddCity, addCity } = useGameStore(s => ({ closeAddCity: s.closeAddCity, addCity: s.addCity }))

  const [step, setStep]               = useState('country')
  const [country, setCountry]         = useState('')
  const [countryQ, setCountryQ]       = useState('')
  const [cities, setCities]           = useState([])
  const [cityQ, setCityQ]             = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [genText, setGenText]         = useState(GEN_TEXTS[0])
  const [error, setError]             = useState('')
  const [addedName, setAddedName]     = useState('')

  useEffect(() => {
    if (!country) return
    setLoadingCities(true)
    setCities([])
    fetchCitiesForCountry(country)
      .then(list => setCities(list))
      .catch(() => {})
      .finally(() => setLoadingCities(false))
  }, [country])

  useEffect(() => {
    if (step !== 'generating') return
    let i = 0
    const id = setInterval(() => { i = (i + 1) % GEN_TEXTS.length; setGenText(GEN_TEXTS[i]) }, 1500)
    return () => clearInterval(id)
  }, [step])

  const filteredCountries = countryQ.trim()
    ? COUNTRIES.filter(c => c.toLowerCase().includes(countryQ.toLowerCase()))
    : COUNTRIES

  const filteredCities = cityQ.trim()
    ? cities.filter(c => c.toLowerCase().startsWith(cityQ.toLowerCase())).slice(0, 24)
    : cities.slice(0, 24)

  const effectiveCity = selectedCity || cityQ.trim()

  const handleCountrySelect = (c) => {
    setCountry(c); setCountryQ(c)
    setSelectedCity(''); setCityQ('')
    setStep('city')
  }

  const handleGenerate = async () => {
    if (!effectiveCity || !country) return
    setStep('generating')
    setError('')
    setGenText(GEN_TEXTS[0])
    try {
      const key = getApiKey()
      const activities = await generateCityActivities(effectiveCity, country, key)
      const city = buildCity(effectiveCity, country, activities)
      addCity(city)
      setAddedName(effectiveCity)
      setStep('done')
      setTimeout(() => closeAddCity(), 2200)
    } catch (err) {
      const msg = err.message || ''
      setError(msg.includes('401') || msg.toLowerCase().includes('api')
        ? 'Invalid API key — check Settings → API Key.'
        : 'Something went wrong. Please try again.')
      setStep('city')
    }
  }

  const canClose = step !== 'generating'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget && canClose) closeAddCity() }}
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
          width: '100%', maxWidth: 460,
          height: (step === 'country' || step === 'city') ? 'min(520px,86dvh)' : undefined,
          display: 'flex', flexDirection: 'column',
          background: '#fffdf7', border: '2px solid #f0e3cf', borderRadius: 28,
          boxShadow: '0 24px 60px rgba(74,53,40,.3)', overflow: 'hidden',
        }}
      >

        {/* ── Header ── */}
        {step !== 'generating' && step !== 'done' && (
          <div style={{ padding: '16px 20px 12px', borderBottom: '2px solid #f0e3cf', display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'city' && (
              <button onClick={() => { setStep('country'); setCountryQ(country); setSelectedCity(''); setCityQ('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9a8467', lineHeight: 1, padding: '0 2px' }}>
                ←
              </button>
            )}
            <div style={{ flex: 1 }}>
              {step === 'city' && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#b39875' }}>{country}</div>}
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#4a3528', lineHeight: 1.1 }}>
                {step === 'country' ? 'Choose a country' : 'Which city?'}
              </div>
            </div>
            <button onClick={() => canClose && closeAddCity()}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f0e3cf', background: '#fff', color: '#a8916f', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              ✕
            </button>
          </div>
        )}

        {/* ── STEP: country ── */}
        {step === 'country' && (
          <>
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid #f0e3cf' }}>
              <input
                autoFocus
                value={countryQ}
                onChange={e => setCountryQ(e.target.value)}
                placeholder="Search countries…"
                style={{
                  width: '100%', border: '2px solid #f0e3cf', background: '#fff',
                  borderRadius: 12, padding: '10px 14px',
                  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#d4b896'}
                onBlur={e => e.target.style.borderColor = '#f0e3cf'}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredCountries.map(c => (
                <button key={c} onClick={() => handleCountrySelect(c)}
                  style={{
                    width: '100%', padding: '12px 20px', textAlign: 'left',
                    background: 'none', border: 'none', borderBottom: '1px solid #f5ecd8',
                    fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf8ee'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >{c}</button>
              ))}
              {filteredCountries.length === 0 && (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: '#b39875', fontWeight: 600 }}>No results</div>
              )}
            </div>
          </>
        )}

        {/* ── STEP: city ── */}
        {step === 'city' && (
          <>
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid #f0e3cf' }}>
              {error && (
                <div style={{ padding: '8px 12px', background: '#fdeee9', borderRadius: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#c0492f' }}>{error}</span>
                </div>
              )}
              <input
                autoFocus
                value={cityQ}
                onChange={e => { setCityQ(e.target.value); setSelectedCity('') }}
                onKeyDown={e => e.key === 'Enter' && effectiveCity && handleGenerate()}
                placeholder={loadingCities ? 'Loading cities…' : 'Type a city name…'}
                style={{
                  width: '100%', border: '2px solid #f0e3cf', background: '#fff',
                  borderRadius: 12, padding: '10px 14px',
                  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#d4b896'}
                onBlur={e => e.target.style.borderColor = '#f0e3cf'}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingCities && (
                <div style={{ padding: '18px', textAlign: 'center', color: '#b39875', fontWeight: 600, fontSize: 13 }}>Loading cities…</div>
              )}
              {filteredCities.map(c => (
                <button key={c} onClick={() => { setSelectedCity(c); setCityQ(c) }}
                  style={{
                    width: '100%', padding: '11px 20px', textAlign: 'left',
                    background: selectedCity === c ? '#fdf3e3' : 'none',
                    border: 'none', borderBottom: '1px solid #f5ecd8',
                    fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (selectedCity !== c) e.currentTarget.style.background = '#fdf8ee' }}
                  onMouseLeave={e => { if (selectedCity !== c) e.currentTarget.style.background = 'none' }}
                >{c}</button>
              ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '2px solid #f0e3cf' }}>
              <button
                onClick={handleGenerate}
                disabled={!effectiveCity}
                style={{
                  width: '100%', padding: '13px 24px',
                  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16,
                  border: 'none', borderRadius: 14, cursor: effectiveCity ? 'pointer' : 'default',
                  background: effectiveCity ? '#9acd7b' : '#e8d4b8',
                  color: effectiveCity ? '#fff' : '#b39875',
                  boxShadow: effectiveCity ? '0 4px 0 #7fb262' : 'none',
                  transition: 'all .15s',
                }}
              >
                {effectiveCity ? `Add ${effectiveCity}` : 'Select a city'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: generating ── */}
        {step === 'generating' && (
          <div style={{ padding: '56px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              border: '5px solid #f0e3cf', borderTopColor: '#9acd7b',
              animation: 'spin 1s linear infinite',
            }} />
            <div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#4a3528', marginBottom: 6 }}>
                Adding {effectiveCity}
              </div>
              <div key={genText} style={{ fontSize: 14, fontWeight: 600, color: '#9a8467', animation: 'fadein .3s ease both' }}>
                {genText}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === 'done' && (
          <div style={{ padding: '56px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', background: '#9acd7b',
              display: 'grid', placeItems: 'center', fontSize: 30, color: '#fff',
              boxShadow: '0 6px 0 #7fb262',
            }}>✓</div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#4a3528' }}>
              {addedName} added!
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#9a8467' }}>
              Your city is ready to explore.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
