interface LegendProps {
  scale: ReadonlyArray<string>
  min: number
  max: number
  unit?: string
}

export function Legend({ scale, min, max, unit = '' }: LegendProps) {
  const fmt = (n: number) => `${n.toFixed(1)} ${unit}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 11,
        color: 'var(--ink-3)',
      }}
    >
      <span className="num">{fmt(min)}</span>
      <div
        style={{
          display: 'flex',
          height: 10,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {scale.map((c, i) => (
          <div key={i} style={{ width: 32, background: c }} />
        ))}
      </div>
      <span className="num">{fmt(max)}</span>
    </div>
  )
}
