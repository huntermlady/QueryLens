export function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {/* Chart area shimmer */}
      <div className="flex-1 rounded-xl overflow-hidden animate-shimmer" style={{ minHeight: 200 }} />
      {/* Axis ticks */}
      <div className="flex justify-between px-2">
        {[40, 56, 48, 64, 40, 56, 52].map((w, i) => (
          <div key={i} className="h-2.5 rounded-full animate-shimmer" style={{ width: w }} />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        {[72, 88, 64].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm animate-shimmer" />
            <div className="h-2.5 rounded-full animate-shimmer" style={{ width: w }} />
          </div>
        ))}
      </div>
    </div>
  )
}
