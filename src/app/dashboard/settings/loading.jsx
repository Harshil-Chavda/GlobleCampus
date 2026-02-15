import s from "../Skeleton.module.css";

export default function SettingsLoading() {
  return (
    <div className={s.skeletonPage}>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 200 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 300 }} />
      </div>

      {/* Section 1: Personal Info */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className={`${s.bone} ${s.sectionTitleBone}`} />
        <div className={s.formGrid}>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={`${s.formGroupSkeleton} ${s.formGroupFull}`}>
            <div className={`${s.bone} ${s.labelBone}`} style={{ width: 90 }} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
        </div>
      </div>

      {/* Section 2: Role */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.25s" }}
      >
        <div
          className={`${s.bone} ${s.sectionTitleBone}`}
          style={{ width: 180 }}
        />
        <div className={s.formGrid}>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={s.formGroupSkeleton}>
            <div
              className={`${s.bone} ${s.labelBone}`}
              style={{ width: 100 }}
            />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
        </div>
      </div>

      {/* Section 3: Location & Bio */}
      <div
        className={`${s.glow} ${s.sectionSkeleton} ${s.fadeIn}`}
        style={{ animationDelay: "0.4s" }}
      >
        <div
          className={`${s.bone} ${s.sectionTitleBone}`}
          style={{ width: 160 }}
        />
        <div className={s.formGrid}>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={s.formGroupSkeleton}>
            <div className={`${s.bone} ${s.labelBone}`} />
            <div className={`${s.bone} ${s.inputBone}`} />
          </div>
          <div className={`${s.formGroupSkeleton} ${s.formGroupFull}`}>
            <div className={`${s.bone} ${s.labelBone}`} style={{ width: 50 }} />
            <div className={`${s.bone} ${s.textareaBone}`} />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div
        className={`${s.bone}`}
        style={{ width: 140, height: 42, borderRadius: 8 }}
      />
    </div>
  );
}
