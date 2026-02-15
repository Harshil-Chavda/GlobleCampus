import s from "../../../dashboard/Skeleton.module.css";

export default function ContentLoading() {
  return (
    <>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 220 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 340 }} />
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[80, 90, 100, 90].map((w, i) => (
          <div
            key={i}
            className={`${s.bone}`}
            style={{ width: w, height: 32, borderRadius: 6 }}
          />
        ))}
      </div>

      {/* Table */}
      <div
        className={`${s.glow} ${s.fadeIn}`}
        style={{ padding: "1rem", borderRadius: 12, animationDelay: "0.1s" }}
      >
        <div
          className={s.tableRowBone}
          style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.4)" }}
        >
          {[1, 0.5, 0.6, 0.7, 0.5, 0.4, 0.5, 0.5, 0.3].map((f, i) => (
            <div
              key={i}
              className={`${s.bone}`}
              style={{ height: 12, flex: f }}
            />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${s.tableRowBone} ${s.fadeIn}`}
            style={{ animationDelay: `${0.15 + i * 0.07}s` }}
          >
            <div className={`${s.bone}`} style={{ height: 14, flex: 1 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.5 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.6 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.7 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 22, width: 70, borderRadius: 20, flexShrink: 0 }}
            />
            <div
              className={`${s.bone}`}
              style={{ height: 14, width: 50, flexShrink: 0 }}
            />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.5 }} />
            <div className={`${s.bone}`} style={{ height: 12, flex: 0.5 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 14, width: 40, flexShrink: 0 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
