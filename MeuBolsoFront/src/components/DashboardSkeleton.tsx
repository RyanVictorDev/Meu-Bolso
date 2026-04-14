export default function DashboardSkeleton() {
  return (
    <div className="pageSkeleton" aria-busy="true" aria-label="Carregando dashboard">
      <div className="pageHeaderRow">
        <div style={{ flex: 1 }}>
          <div className="skeletonLine skeletonTitle" />
          <div className="skeletonLine" style={{ width: '60%', marginTop: 10, height: 14 }} />
        </div>
        <div className="skeletonLine" style={{ width: 140, height: 40, borderRadius: 12 }} />
      </div>
      <div className="skeletonGrid3">
        <div className="skeletonLine skeletonStat" />
        <div className="skeletonLine skeletonStat" />
        <div className="skeletonLine skeletonStat" />
      </div>
      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="skeletonCard">
          <div className="skeletonLine" style={{ width: '55%', marginBottom: 16 }} />
          <div className="skeletonLine" style={{ height: 180, borderRadius: 12 }} />
        </div>
        <div className="skeletonCard">
          <div className="skeletonLine" style={{ width: '50%', marginBottom: 16 }} />
          <div className="skeletonLine" style={{ height: 180, borderRadius: 12 }} />
        </div>
      </div>
      <div className="skeletonCard" style={{ marginTop: 14 }}>
        <div className="skeletonLine" style={{ width: '40%', marginBottom: 16 }} />
        <div className="skeletonLine" style={{ height: 120, borderRadius: 12 }} />
      </div>
    </div>
  )
}
