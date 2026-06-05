'use client';

interface Props {
  top: number;
  heart: number;
  base: number;
  showLabels?: boolean;
}

export default function LayerBalance({ top, heart, base, showLabels = true }: Props) {
  return (
    <div className="w-full">
      {/* bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        <div
          style={{ flex: top || 0.1, background: 'rgba(232,200,112,0.75)' }}
          className="rounded-l-full"
        />
        <div style={{ flex: heart || 0.1, background: 'rgba(200,120,190,0.65)' }} />
        <div
          style={{ flex: base || 0.1, background: 'rgba(190,140,70,0.60)' }}
          className="rounded-r-full"
        />
      </div>
      {/* labels */}
      {showLabels && (
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: '0.52rem', color: 'rgba(232,200,112,0.55)' }}>
            ⬆ توب {top}%
          </span>
          <span style={{ fontSize: '0.52rem', color: 'rgba(200,120,190,0.55)' }}>
            ◆ قلب {heart}%
          </span>
          <span style={{ fontSize: '0.52rem', color: 'rgba(190,140,70,0.55)' }}>
            ⬇ قاعدة {base}%
          </span>
        </div>
      )}
    </div>
  );
}
