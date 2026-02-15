import s from "../../../dashboard/Skeleton.module.css";

export default function AdminDashboardLoading() {
  return (
    <>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 260 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 380 }} />
      </div>

      <div className={s.statsRow}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.statSkeleton} ${s.fadeIn}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`${s.bone} ${s.statCircle}`} />
            <div className={s.statLines}>
              <div className={`${s.bone} ${s.statBig}`} />
              <div className={`${s.bone} ${s.statSmall}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={s.waveDots}>
        <div className={s.dot} />
        <div className={s.dot} />
        <div className={s.dot} />
        <div className={s.dot} />
      </div>
    </>
  );
}
