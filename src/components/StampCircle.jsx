// Circular passport stamp badge, used everywhere a stamp appears.
export default function StampCircle({ size = 84, ink, cityShort, emblem, label, rot = 0, photoUrl, animClass = '' }) {
  const s = size
  const borderEm  = 0.028
  const dashedEm  = 0.02
  const textTopEm = 0.11
  const glyEm     = 0.40
  const textBotEm = 0.10

  return (
    <div
      className={animClass}
      style={{
        position: 'relative',
        width: s,
        height: s,
        fontSize: s,
        color: ink,
        '--rot': `${rot}deg`,
        transform: animClass ? undefined : `rotate(${rot}deg)`,
        flexShrink: 0,
      }}
    >
      {photoUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `url(${photoUrl}) center/cover`,
          }}
        />
      )}
      {photoUrl && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,251,242,.66), rgba(255,251,242,.2) 72%, transparent)',
        }} />
      )}
      <div style={{ position: 'absolute', inset: 0, border: `${borderEm}em solid currentColor`, borderRadius: '50%', opacity: .9 }} />
      <div style={{ position: 'absolute', inset: `${0.07}em`, border: `${dashedEm}em dashed currentColor`, borderRadius: '50%', opacity: .75 }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>
        {cityShort && (
          <div style={{ fontSize: `${textTopEm}em`, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'Quicksand', color: ink }}>
            {cityShort}
          </div>
        )}
        <div style={{ fontSize: `${glyEm}em`, margin: '-0.01em 0', color: ink }}>{emblem}</div>
        {label && (
          <div style={{ fontSize: `${textBotEm}em`, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'Quicksand', color: ink }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}
