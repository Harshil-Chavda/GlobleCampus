import s from "./Skeleton.module.css";

export default function DashboardLoading() {
  return (
    <div className={s.skeletonPage}>
      {/* Header */}
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} />
        <div className={`${s.bone} ${s.subtitleBone}`} />
      </div>

      {/* Stats Cards */}
      <div className={s.statsRow}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.statSkeleton} ${s.fadeIn}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`${s.bone} ${s.statCircle}`} />
            <div className={s.statLines}>
              <div className={`${s.bone} ${s.statBig}`} />
              <div className={`${s.bone} ${s.statSmall}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className={`${s.bone} ${s.sectionTitleBone}`}
        style={{ marginBottom: "1rem" }}
      />
      <div className={s.cardsGrid}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.cardSkeleton} ${s.fadeIn}`}
            style={{ animationDelay: `${0.4 + i * 0.12}s` }}
          >
            <div className={`${s.bone} ${s.cardIconBone}`} />
            <div className={`${s.bone} ${s.cardTitleBone}`} />
            <div className={`${s.bone} ${s.cardLineBone}`} />
            <div className={`${s.bone} ${s.cardLineShort}`} />
          </div>
        ))}
      </div>

      {/* Wave dots */}
      <div className={s.waveDots}>
        <div className={s.dot} />
        <div className={s.dot} />
        <div className={s.dot} />
        <div className={s.dot} />
      </div>
    </div>
  );
}
