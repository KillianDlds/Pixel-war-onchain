import React from "react";

export default function PixelPalette({ PALETTE, selectedColor, onSelectColor, isSending }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10,28px)",
        gridAutoRows: "28px",
        gap: 6,
        marginTop: 18,
        justifyContent: "center",
      }}
    >
      {PALETTE.map((c) => (
        <div
          key={c}
          onClick={() => !isSending && onSelectColor(c)}
          style={{
            width: 28,
            height: 28,
            backgroundColor: c,
            border: selectedColor === c ? "3px solid #000" : "1px solid #ccc",
            cursor: isSending ? "not-allowed" : "pointer",
            borderRadius: 6,
          }}
        />
      ))}
    </div>
  );
}
