type DocToolKitLogoProps = {
  size?: "sm" | "md" | "lg"
}

export function DocToolKitLogo({ size = "md" }: DocToolKitLogoProps) {
  const scales: Record<string, { doc: number; wordmark: number }> = {
    sm: { doc: 0.55, wordmark: 14 },
    md: { doc: 0.75, wordmark: 20 },
    lg: { doc: 1, wordmark: 26 },
  }
  const s = scales[size]
  const w = 40 * s.doc
  const h = 52 * s.doc

  return (
    <div className="flex items-center gap-2.5">
      <svg width={w} height={h} viewBox="0 0 40 52" aria-hidden="true">
        <rect x="0" y="0" width="40" height="52" rx="6" fill="#EEF6FF" stroke="#B7D4FF" strokeWidth="1" />
        <path d="M28 0 L40 12 L28 12 Z" fill="#B7D4FF" />
        <path d="M28 0 L28 12 L40 12" fill="none" stroke="#82AEEF" strokeWidth="1" />
        <rect x="7" y="20" width="26" height="3" rx="1.5" fill="#2563EB" />
        <rect x="7" y="28" width="19" height="3" rx="1.5" fill="#F59E0B" />
        <rect x="7" y="36" width="22" height="3" rx="1.5" fill="#14B8A6" />
      </svg>
      <span
        className="leading-none"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: s.wordmark,
          fontWeight: 500,
          color: "inherit",
        }}
      >
        Doc <span style={{ color: "#2563EB" }}>Tool Kit</span>
      </span>
    </div>
  )
}
