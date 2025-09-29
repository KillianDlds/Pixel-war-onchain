import React, { useState } from "react";

const PIXEL_COUNT = 50;   // nombre de pixels par ligne/colonne
const PIXEL_SIZE = 12;    // taille en px d'un pixel

const PALETTE = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080"
];

export default function PixelBoard() {
  // Initialiser les pixels en blanc
  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT)
      .fill(null)
      .map(() => Array(PIXEL_COUNT).fill("#ffffff"))
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
    <div className="p-4">
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
                    ? "1px solid red"
                    : "1px solid #ccc",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      {/* Palette */}
      <div className="flex flex-wrap gap-2 mb-4">
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
