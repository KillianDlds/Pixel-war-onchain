import React, { useState } from "react";

const PIXEL_COUNT = 50;   
const PIXEL_SIZE = 12;   

// Palette plus complète
const PALETTE = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
  "#808080", "#c0c0c0", "#800000", "#008000", "#000080",
  "#808000", "#800080", "#008080", "#f0f8ff", "#faebd7"
];

export default function PixelBoard() {
  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT)
      .fill(null)
      .map(() => Array(PIXEL_COUNT).fill("#000000"))
  );

  const [selectedPixel, setSelectedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handlePixelClick = (x, y) => {
    setSelectedPixel({ x, y });
  };

  const applyColor = (color) => {
    if (selectedPixel.x === null || selectedPixel.y === null) return;

    setPixels((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[selectedPixel.y][selectedPixel.x] = color;
      return copy;
    });
  };

  return (
    <div className="p-4" style={{ background: "#fff", minHeight: "100vh" }}>
      <h2 className="mb-4 text-lg font-bold">Pixel Board {PIXEL_COUNT}×{PIXEL_COUNT}</h2>

      {/* Plateau */}
      <div
        className="mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
          gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
        }}
      >
        {pixels.flatMap((row, y) =>
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
                    ? "1px solid #ff4444"
                    : "1px solid #444",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      {/* Palette en une ligne */}
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          gap: "4px",
          padding: "4px 0",
        }}
      >
        {PALETTE.map((color) => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: 24,
              height: 24,
              backgroundColor: color,
              border: selectedColor === color ? "2px solid #000" : "1px solid #ccc",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Bouton appliquer */}
      <button
        onClick={() => applyColor(selectedColor)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Appliquer la couleur
      </button>
    </div>
  );
}
