import s from "../Skeleton.module.css";

export default function BlogsLoading() {
  return (
    <div className={s.skeletonPage}>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 200 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 350 }} />
      </div>

      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.searchBone}`} />
        <div className={`${s.bone} ${s.buttonBone}`} style={{ width: 140 }} />
      </div>

      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.filterBone}`} />
        <div className={`${s.bone} ${s.filterBone}`} />
      </div>

      <div className={s.cardsGrid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.cardSkeleton} ${s.fadeIn}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`${s.bone} ${s.cardIconBone}`} />
            <div className={`${s.bone} ${s.cardTitleBone}`} />
            <div className={`${s.bone} ${s.cardLineBone}`} />
            <div
              className={`${s.bone} ${s.cardLineBone}`}
              style={{ width: "75%" }}
            />
            <div className={s.cardMetaRow}>
              <div className={`${s.bone} ${s.metaBone}`} />
              <div className={`${s.bone} ${s.metaBone}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
