import s from "../Skeleton.module.css";

export default function MaterialsLoading() {
  return (
    <div className={s.skeletonPage}>
      {/* Header */}
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} />
        <div className={`${s.bone} ${s.subtitleBone}`} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <div
          className={`${s.bone}`}
          style={{ width: 160, height: 36, borderRadius: 8 }}
        />
        <div
          className={`${s.bone}`}
          style={{ width: 140, height: 36, borderRadius: 8 }}
        />
      </div>

      {/* Toolbar */}
      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.searchBone}`} />
        <div className={`${s.bone} ${s.buttonBone}`} />
      </div>

      {/* Filters */}
      <div className={s.toolbarRow}>
        <div className={`${s.bone} ${s.filterBone}`} />
        <div className={`${s.bone} ${s.filterBone}`} />
        <div className={`${s.bone} ${s.filterBone}`} />
      </div>

      {/* Count */}
      <div
        className={`${s.bone}`}
        style={{ height: 14, width: 180, marginBottom: "1rem" }}
      />

      {/* Material Cards */}
      <div className={s.cardsGrid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${s.glow} ${s.cardSkeleton} ${s.fadeIn}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <div className={`${s.bone} ${s.cardIconBone}`} />
              <div className={`${s.bone} ${s.cardTagBone}`} />
            </div>
            <div className={`${s.bone} ${s.cardTitleBone}`} />
            <div className={`${s.bone} ${s.cardLineBone}`} />
            <div
              className={`${s.bone} ${s.cardLineBone}`}
              style={{ width: "85%" }}
            />
            <div className={`${s.bone} ${s.cardLineShort}`} />
            <div
              className={`${s.bone} ${s.cardLineBone}`}
              style={{ width: "70%" }}
            />
            <div
              className={`${s.bone} ${s.cardLineShort}`}
              style={{ width: "50%" }}
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
