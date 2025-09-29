import React, { useState } from "react";

const PIXEL_COUNT = 30;
const PIXEL_SIZE = 14;

const PALETTE = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
  "#808080", "#c0c0c0", "#800000", "#008000", "#000080",
];

export default function PixelBoard() {

  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"))
  );

  const [selectedPixel, setSelectedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

  const applyColor = (color) => {
    if (selectedPixel.x === null || selectedPixel.y === null) return;
    setPixels(prev => {
      const copy = prev.map(row => [...row]);
      copy[selectedPixel.y][selectedPixel.x] = color;
      return copy;
    });
  };

  return (
    <div
      style={{
        background: "#f0f0f0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
        Pixel Board {PIXEL_COUNT}×{PIXEL_COUNT}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
          gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
          gap: "0px",
          background: "#222",
          padding: "2px",
          borderRadius: "8px",
        }}
      >
        {pixels.map((row, y) =>
          row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handlePixelClick(x, y)}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: color,
                border:
                  selectedPixel.x === x && selectedPixel.y === y
                    ? "2px solid #ff4444"
                    : "1px solid #555",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 28px)",
          gridAutoRows: "28px",
          gap: "4px",
          marginTop: "20px",
        }}
      >
        {PALETTE.map((color) => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: color,
              border: selectedColor === color ? "3px solid #000" : "1px solid #ccc",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          />
        ))}
      </div>

      <button
        onClick={() => applyColor(selectedColor)}
        style={{
          marginTop: "20px",
          padding: "10px 24px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#45a049"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#4CAF50"}
      >
        Appliquer la couleur
      </button>
    </div>
  );
}
