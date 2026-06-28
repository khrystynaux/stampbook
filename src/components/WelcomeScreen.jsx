import { useState, useEffect } from 'react'
import { COUNTRIES } from '../data/countries'
import { getApiKey, saveApiKey, fetchCitiesForCountry, generateCityActivities, buildCity } from '../utils/generateCity'
import useGameStore from '../store/useGameStore'

const GEN_TEXTS = ['Mapping the city…', 'Finding hidden gems…', 'Building your quest list…', 'Almost ready…']

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

export default function WelcomeScreen() {
  const startApp = useGameStore(s => s.startApp)

  const [step, setStep]             = useState('name')
  const [name, setName]             = useState('')
  const [apiKey, setApiKey]         = useState(getApiKey)
  const [country, setCountry]       = useState('')
  const [countryQ, setCountryQ]     = useState('')
  const [cities, setCities]         = useState([])
  const [cityQ, setCityQ]           = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [genText, setGenText]       = useState(GEN_TEXTS[0])
  const [error, setError]           = useState('')

  // Fetch cities when country is picked
  useEffect(() => {
    if (!country) return
    setLoadingCities(true)
    setCities([])
    fetchCitiesForCountry(country)
      .then(list => setCities(list))
      .catch(() => {})
      .finally(() => setLoadingCities(false))
  }, [country])

  // Cycle generating text
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

  const handleNameNext = () => {
    if (!name.trim()) return
    setStep(getApiKey() ? 'country' : 'apikey')
  }

  const handleApiKeySave = () => {
    if (!apiKey.trim()) return
    saveApiKey(apiKey)
    setStep('country')
  }

  const handleCountrySelect = (c) => {
    setCountry(c)
    setCountryQ(c)
    setSelectedCity('')
    setCityQ('')
    setStep('city')
  }

  const handleGenerate = async () => {
    if (!effectiveCity || !country) return
    setStep('generating')
    setError('')
    setGenText(GEN_TEXTS[0])
    try {
      const key = getApiKey() || apiKey
      const activities = await generateCityActivities(effectiveCity, country, key)
      const city = buildCity(effectiveCity, country, activities)
      startApp(name, city)
    } catch (err) {
      const msg = err.message || ''
      setError(msg.includes('401') || msg.toLowerCase().includes('api')
        ? 'Invalid API key — double-check and try again.'
        : 'Something went wrong. Please try again.')
      setStep('city')
    }
  }

  // ── Card tall for list steps
  const isList = step === 'country' || step === 'city'
  const isGenerating = step === 'generating'

  return (
    <section style={{
      position: 'relative', minHeight: '100dvh',
      display: 'grid', placeItems: 'center',
      padding: 'clamp(16px,4vw,32px) 20px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% -10%, #eef7e4, #fffdf7 58%)',
    }}>
      {bubble('12%','16%',34,'#cdeab0',0,7)}
      {bubble('80%','24%',20,'#bfe0f2',.5,5.6)}
      {bubble('20%','80%',24,'#ffd9a3',.3,6.4)}
      {bubble('76%','72%',16,'#ffc6d3',.7,5.2)}

      <div style={{
        position: 'relative', width: '100%', maxWidth: 460,
        maxHeight: isList ? '86dvh' : undefined,
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: '2px solid #f0e3cf', borderRadius: 30,
        boxShadow: '0 18px 0 -8px #ead9bf',
        overflow: 'hidden',
        animation: 'fadein .22s ease both',
      }}>

        {/* ── STEP: name ── */}
        {step === 'name' && (
          <div style={{ padding: 'clamp(24px,5vw,34px) clamp(20px,5vw,30px)', textAlign: 'center' }}>
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

        {/* ── STEP: apikey ── */}
        {step === 'apikey' && (
          <div style={{ padding: 'clamp(24px,5vw,34px) clamp(20px,5vw,30px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 38, marginBottom: 6 }}>🔑</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#4a3528', marginBottom: 8 }}>
                Connect AI
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#8b7355', lineHeight: 1.55 }}>
                Stampbook uses Claude AI to generate authentic quests for your city. Paste your Anthropic API key below — it's saved only in your browser.
              </p>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApiKeySave()}
              placeholder="sk-ant-…"
              autoFocus
              style={{
                width: '100%', border: '2px solid #f0e3cf', background: '#fffdf7',
                borderRadius: 13, padding: '13px 14px', marginBottom: 14,
                fontFamily: 'monospace', fontSize: 13, color: '#5c4033', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#d4b896'}
              onBlur={e => e.target.style.borderColor = '#f0e3cf'}
            />
            <button
              onClick={handleApiKeySave}
              disabled={!apiKey.trim()}
              style={{
                width: '100%', padding: '14px 24px',
                fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16,
                border: 'none', borderRadius: 14, cursor: apiKey.trim() ? 'pointer' : 'default',
                background: apiKey.trim() ? '#9acd7b' : '#e8d4b8',
                color: apiKey.trim() ? '#fff' : '#b39875',
                boxShadow: apiKey.trim() ? '0 4px 0 #7fb262' : 'none',
              }}
            >
              Save and continue
            </button>
            <button onClick={() => setStep('name')} style={{ display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#b39875', fontWeight: 600, fontSize: 13 }}>
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP: country ── */}
        {step === 'country' && (
          <>
            <div style={{ padding: '18px 20px 12px', borderBottom: '2px solid #f0e3cf' }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#4a3528', marginBottom: 10 }}>
                Choose a country
              </div>
              <input
                autoFocus
                value={countryQ}
                onChange={e => setCountryQ(e.target.value)}
                placeholder="Search countries…"
                style={{
                  width: '100%', border: '2px solid #f0e3cf', background: '#fffdf7',
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
                    fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf8ee'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >{c}</button>
              ))}
              {filteredCountries.length === 0 && (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: '#b39875', fontWeight: 600 }}>No results</div>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0e3cf' }}>
              <button onClick={() => setStep(getApiKey() ? 'name' : 'apikey')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b39875', fontWeight: 600, fontSize: 13 }}>
                ← Back
              </button>
            </div>
          </>
        )}

        {/* ── STEP: city ── */}
        {step === 'city' && (
          <>
            <div style={{ padding: '18px 20px 12px', borderBottom: '2px solid #f0e3cf' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#b39875', marginBottom: 2 }}>{country}</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#4a3528', marginBottom: 10 }}>
                Which city?
              </div>
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
                  width: '100%', border: '2px solid #f0e3cf', background: '#fffdf7',
                  borderRadius: 12, padding: '10px 14px',
                  fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#d4b896'}
                onBlur={e => e.target.style.borderColor = '#f0e3cf'}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingCities && (
                <div style={{ padding: '18px', textAlign: 'center', color: '#b39875', fontWeight: 600, fontSize: 13 }}>
                  Loading cities…
                </div>
              )}
              {filteredCities.map(c => (
                <button key={c} onClick={() => { setSelectedCity(c); setCityQ(c) }}
                  style={{
                    width: '100%', padding: '11px 20px', textAlign: 'left',
                    background: selectedCity === c ? '#fdf3e3' : 'none',
                    border: 'none', borderBottom: '1px solid #f5ecd8',
                    fontFamily: 'Quicksand', fontWeight: 600, fontSize: 14, color: '#5c4033',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (selectedCity !== c) e.currentTarget.style.background = '#fdf8ee' }}
                  onMouseLeave={e => { if (selectedCity !== c) e.currentTarget.style.background = 'none' }}
                >{c}</button>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '2px solid #f0e3cf', display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep('country'); setCountryQ(country); setSelectedCity(''); setCityQ('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b39875', fontWeight: 600, fontSize: 13, padding: '0 4px' }}>
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!effectiveCity}
                style={{
                  flex: 1, padding: '12px 24px',
                  fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16,
                  border: 'none', borderRadius: 14, cursor: effectiveCity ? 'pointer' : 'default',
                  background: effectiveCity ? '#9acd7b' : '#e8d4b8',
                  color: effectiveCity ? '#fff' : '#b39875',
                  boxShadow: effectiveCity ? '0 4px 0 #7fb262' : 'none',
                  transition: 'all .15s',
                }}
              >
                {effectiveCity ? `Start with ${effectiveCity}` : 'Select a city'}
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
                Setting up {effectiveCity}
              </div>
              <div key={genText} style={{ fontSize: 14, fontWeight: 600, color: '#9a8467', animation: 'fadein .3s ease both' }}>
                {genText}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
