import s from "../../../dashboard/Skeleton.module.css";

export default function UsersLoading() {
  return (
    <>
      <div className={s.headerBlock}>
        <div className={`${s.bone} ${s.titleBone}`} style={{ width: 180 }} />
        <div className={`${s.bone} ${s.subtitleBone}`} style={{ width: 300 }} />
      </div>

      {/* Search */}
      <div
        className={`${s.bone}`}
        style={{
          width: 400,
          height: 42,
          marginBottom: "1.5rem",
          borderRadius: 8,
        }}
      />

      {/* Table */}
      <div
        className={`${s.glow} ${s.fadeIn}`}
        style={{ padding: "1rem", borderRadius: 12, animationDelay: "0.1s" }}
      >
        <div
          className={s.tableRowBone}
          style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.4)" }}
        >
          {[
            "Name",
            "Email",
            "Role",
            "College",
            "Tokens",
            "Joined",
            "Admin",
          ].map((_, i) => (
            <div
              key={i}
              className={`${s.bone}`}
              style={{ height: 12, flex: i === 1 ? 1.5 : 1 }}
            />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`${s.tableRowBone} ${s.fadeIn}`}
            style={{ animationDelay: `${0.15 + i * 0.06}s` }}
          >
            <div className={`${s.bone}`} style={{ height: 14, flex: 1 }} />
            <div className={`${s.bone}`} style={{ height: 14, flex: 1.5 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 22, width: 70, borderRadius: 20, flexShrink: 0 }}
            />
            <div className={`${s.bone}`} style={{ height: 14, flex: 1 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 14, width: 60, flexShrink: 0 }}
            />
            <div className={`${s.bone}`} style={{ height: 12, flex: 0.7 }} />
            <div
              className={`${s.bone}`}
              style={{ height: 14, width: 30, flexShrink: 0 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
