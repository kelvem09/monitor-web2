import './StatusBadge.css'

export type StatusKind = 'success' | 'warning' | 'neutral' | 'danger'

interface StatusBadgeProps {
  label: string
  kind?: StatusKind
}

export function StatusBadge({ label, kind = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${kind}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
