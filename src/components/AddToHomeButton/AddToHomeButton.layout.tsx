import React from "react";

export function AddToHomeButtonLayout({ iconRef, hintRef, handleAdd, showHint, setShowHint }: any) {
  return (
    <div className="relative" style={{ position: "absolute", top: -12, right: 6 }}>
      <span
        ref={iconRef}
        onClick={handleAdd}
        aria-label="Підказка про додавання ярлика"
        style={{
          fontSize: 24,
          color: "rgba(120,120,120,0.5)",
          display: "block",
          lineHeight: 1,
          cursor: "pointer",
          userSelect: "none",
          fontWeight: 700,
        }}
      >
        ?
      </span>
      {showHint && (
        <div
          ref={hintRef}
          className="absolute right-0 mt-2 p-3 rounded-xl bg-white/95 shadow-xl border border-default-200 text-xs text-left z-50"
          style={{ color: "#222", top: "110%", minWidth: 220, width: 300, lineHeight: 1.8 }}
        >
          <div className="mb-1">
            <b>Android:</b> Відкрийте меню браузера (⋮ або ≡) і виберіть "Додати на головний екран".
            <br />
            <hr style={{ border: 0, borderTop: "1px solid #bbb", margin: "10px 0" }} />
            <b>iPhone/iPad:</b> Відкрийте сайт у Safari, натисніть Поділитися{" "}
            <span style={{ fontWeight: 600 }}>&#8679;</span> і виберіть "На екран — Додому".
          </div>
        </div>
      )}
    </div>
  );
}
