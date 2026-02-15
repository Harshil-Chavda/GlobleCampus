import s from "../Skeleton.module.css";

export default function VideosLoading() {
  return (
    <div className={s.skeletonPage}>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 240 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 360 }} />
      </div>

      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.searchBone}`} />
        <div className={`${s.bone} ${s.buttonBone}`} style={{ width: 150 }} />
      </div>

      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.filterBone}`} />
        <div className={`${s.bone} ${s.filterBone}`} />
      </div>

      <div className={s.cardsGrid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.fadeIn}`}
            style={{ animationDelay: `${i * 0.1}s`, borderRadius: 12 }}
          >
            {/* Video thumbnail placeholder */}
            <div
              className={s.bone}
              style={{ height: 160, borderRadius: "12px 12px 0 0" }}
            />
            <div style={{ padding: "1rem" }}>
              <div className={`${s.bone} ${s.cardTitleBone}`} />
              <div className={`${s.bone} ${s.cardLineBone}`} />
              <div className={s.cardMetaRow}>
                <div className={`${s.bone} ${s.metaBone}`} />
                <div className={`${s.bone} ${s.metaBone}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
