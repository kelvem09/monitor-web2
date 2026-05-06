interface LogoProps {
  size?: number
}

export function Logo({ size = 22 }: LogoProps) {
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 19 L8 7 L13 14 L17 5 L21 19 Z"
          stroke="#14140f"
          strokeWidth="1.6"
          fill="#b53a1f"
          fillOpacity="0.14"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="14" r="1.6" fill="#b53a1f" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: size * 0.78,
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: 'var(--ink)',
        }}
      >
        Indica<span style={{ color: 'var(--accent)' }}>RN</span>
      </span>
    </span>
  )
}
