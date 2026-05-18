'use client'

interface RevenueEntry {
  total_amount: number
  created_at: string
}

interface TopItemEntry {
  quantity: number
  products: { name: string; price: number } | null
}

interface Props {
  revenueData: RevenueEntry[]
  topItems: TopItemEntry[]
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function buildLast7Days(revenueData: RevenueEntry[]): { label: string; date: string; total: number }[] {
  const today = new Date()
  const days: { label: string; date: string; total: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10) // "YYYY-MM-DD"
    const label = DAY_LABELS[d.getDay()]
    days.push({ label, date: dateStr, total: 0 })
  }

  for (const entry of revenueData) {
    const dateStr = entry.created_at.slice(0, 10)
    const day = days.find((d) => d.date === dateStr)
    if (day) day.total += entry.total_amount
  }

  return days
}

function buildTopProducts(topItems: TopItemEntry[]): { name: string; qty: number }[] {
  const map: Record<string, number> = {}
  for (const item of topItems) {
    if (!item.products) continue
    const name = item.products.name
    map[name] = (map[name] ?? 0) + item.quantity
  }
  return Object.entries(map)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
}

export default function DashboardCharts({ revenueData, topItems }: Props) {
  const days = buildLast7Days(revenueData)
  const top = buildTopProducts(topItems)

  const maxRevenue = Math.max(...days.map((d) => d.total), 1)
  const maxQty = Math.max(...top.map((p) => p.qty), 1)

  // SVG dimensions
  const svgW = 400
  const svgH = 160
  const barMaxH = 100
  const barW = 36
  const barGap = (svgW - barW * 7) / 8 // even spacing
  const baseY = svgH - 24 // bottom margin for labels

  const hasRevenue = days.some((d) => d.total > 0)
  const hasTop = top.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* Revenue Bar Chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Chiffre d'affaires — 7 derniers jours
        </p>

        {!hasRevenue ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 160, color: 'var(--text-muted)', fontSize: 13 }}
          >
            Aucune commande livrée cette semaine
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
            aria-label="Chiffre d'affaires des 7 derniers jours"
          >
            {days.map((day, i) => {
              const barH = day.total > 0 ? Math.max(6, (day.total / maxRevenue) * barMaxH) : 0
              const x = barGap + i * (barW + barGap)
              const y = baseY - barH

              return (
                <g key={day.date}>
                  {/* Bar */}
                  {barH > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={barH}
                      rx={6}
                      fill="#7C3AED"
                      fillOpacity={0.85}
                    />
                  )}
                  {/* Empty bar placeholder */}
                  {barH === 0 && (
                    <rect
                      x={x}
                      y={baseY - 4}
                      width={barW}
                      height={4}
                      rx={2}
                      fill="#2A2A2A"
                    />
                  )}
                  {/* Value label above bar */}
                  {day.total > 0 && (
                    <text
                      x={x + barW / 2}
                      y={y - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#A78BFA"
                      fontWeight="600"
                    >
                      {day.total >= 1000
                        ? `${(day.total / 1000).toFixed(1)}k`
                        : day.total.toFixed(0)}
                    </text>
                  )}
                  {/* Day label */}
                  <text
                    x={x + barW / 2}
                    y={baseY + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#888888"
                  >
                    {day.label}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {/* Top Products */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Top produits vendus
        </p>

        {!hasTop ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 160, color: 'var(--text-muted)', fontSize: 13 }}
          >
            Aucune donnée disponible
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {top.map((product, i) => {
              const pct = Math.round((product.qty / maxQty) * 100)
              return (
                <div key={product.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs font-black tabular-nums shrink-0"
                        style={{ color: 'var(--primary-light)', minWidth: 24 }}
                      >
                        #{i + 1}
                      </span>
                      <span
                        className="text-sm truncate"
                        style={{ color: 'var(--text)' }}
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold tabular-nums shrink-0 ml-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {product.qty} vendu{product.qty > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'var(--primary)',
                        opacity: 1 - i * 0.12,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
