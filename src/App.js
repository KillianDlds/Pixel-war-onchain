import React, { useState } from "react";

const PIXEL_COUNT = 30;   
const PIXEL_SIZE = 14;    

const PALETTE = [
  "#ffffff", // blanc
  "#000000", // noir
  "#ff0000", // rouge
  "#00ff00", // vert
  "#0000ff", // bleu
  "#ffff00", // jaune
  "#ff00ff", // magenta
  "#00ffff", // cyan
  "#ffa500", // orange
  "#800080", // violet
  "#808080", // gris moyen
  "#c0c0c0", // gris clair
  "#800000", // marron foncé
  "#008000", // vert foncé
  "#000080", // bleu foncé
  "#f5f5dc", // beige
  "#ff69b4", // rose
  "#a52a2a", // brun
  "#ffd700", // or
  "#40e0d0", // turquoise
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
        padding: "20px"
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
        On chain pixel war
      </h1>

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
        onMouseEnter={e => e.currentTarget.style.backgroundColor="#45a049"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor="#4CAF50"}
      >
        Apply color
      </button>
    </div>
  );
}
