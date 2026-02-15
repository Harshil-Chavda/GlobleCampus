import s from "../../../dashboard/Skeleton.module.css";

export default function ApprovalsLoading() {
  return (
    <>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 260 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 320 }} />
      </div>

      {/* Table skeleton */}
      <div
        className={`${s.glow} ${s.fadeIn}`}
        style={{ padding: "1rem", borderRadius: 12, animationDelay: "0.1s" }}
      >
        <div className={s.tableHeaderBone}>
          <div className={s.tableRowBone}>
            {["1", "0.6", "0.5", "0.6", "0.5", "0.4", "0.3", "0.4", "0.5"].map(
              (f, i) => (
                <div
                  key={i}
                  className={`${s.bone}`}
                  style={{ height: 12, flex: f }}
                />
              ),
            )}
          </div>
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${s.tableRowBone} ${s.fadeIn}`}
            style={{ animationDelay: `${0.2 + i * 0.08}s` }}
          >
            <div className={`${s.bone}`} style={{ height: 14, flex: 1 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 22, width: 70, borderRadius: 20, flexShrink: 0 }}
            />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.5 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.6 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.5 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 0.4 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 14, width: 50, flexShrink: 0 }}
            />
            <div
              className={`${s.bone}`}
              style={{ height: 30, width: 45, borderRadius: 6, flexShrink: 0 }}
            />
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <div
                className={`${s.bone}`}
                style={{ height: 30, width: 80, borderRadius: 6 }}
              />
              <div
                className={`${s.bone}`}
                style={{ height: 30, width: 34, borderRadius: 6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
