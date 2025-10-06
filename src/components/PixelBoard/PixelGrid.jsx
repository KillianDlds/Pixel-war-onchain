import React from "react";

export default function PixelGrid({ pixels, selectedPixel, onPixelClick }) {
  const PIXEL_SIZE = 14;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${pixels.length}, ${PIXEL_SIZE}px)`,
        gap: 0,
        justifyContent: "center",
        borderRadius: 8,
        padding: 6,
        background: "#222",
      }}
    >
      {pixels.map((row, y) =>
        row.map((color, x) => (
          <div
            key={`${x}-${y}`}
            onClick={() => onPixelClick(x, y)}
            style={{
              width: PIXEL_SIZE,
              height: PIXEL_SIZE,
              backgroundColor: color,
              border:
                selectedPixel.x === x && selectedPixel.y === y
                  ? "2px solid #ff4444"
                  : "1px solid #333",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          />
        ))
      )}
    </div>
  );
}
