import s from "../../Skeleton.module.css";

export default function UploadLoading() {
  return (
    <div className={s.skeletonPage}>
      {/* Header */}
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} />
        <div className={`${s.bone} ${s.subtitleBone}`} />
      </div>

      {/* Section 1: Material Info */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className={`${s.bone} ${s.sectionTitleBone}`} />
        <div className={s.formGrid}>
          <div className={`${s.formGroupSkeleton} ${s.formGroupFull}`}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
        </div>
      </div>

      {/* Section 2: Academic */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.25s" }}
      >
        <div className={`${s.bone} ${s.sectionTitleBone}`} />
        <div className={s.formGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={s.formGroupSkeleton}>
              <div className={`${s.bone} ${s.labelBone}`} />
              <div className={`${s.bone} ${s.inputBone}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Description */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.4s" }}
      >
        <div className={`${s.bone} ${s.sectionTitleBone}`} />
        <div className={`${s.bone} ${s.textareaBone}`} />
      </div>

      {/* Section 4: Upload Zone */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.55s" }}
      >
        <div className={`${s.bone} ${s.sectionTitleBone}`} />
        <div className={s.uploadZoneBone}>
          <div className={`${s.bone} ${s.uploadIconBone}`} />
          <div className={`${s.bone} ${s.uploadTextBone}`} />
          <div className={`${s.bone}`} style={{ height: 12, width: 160 }} />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <div
          className={`${s.bone}`}
          style={{ width: 100, height: 42, borderRadius: 8 }}
        />
        <div
          className={`${s.bone}`}
          style={{ width: 180, height: 42, borderRadius: 8 }}
        />
      </div>
    </div>
  );
}
