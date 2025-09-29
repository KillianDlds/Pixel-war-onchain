import React, { useState, useEffect } from "react";

const PIXEL_COUNT = 30;   
const PIXEL_SIZE = 14;    

const PALETTE = [
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
  "#808080", "#c0c0c0", "#800000", "#008000", "#000080",
  "#f5f5dc", "#ff69b4", "#a52a2a", "#ffd700", "#40e0d0",
];

export default function PixelBoard() {

  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"))
  );

  const [selectedPixel, setSelectedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [lastPlaced, setLastPlaced] = useState(0);

  const [message, setMessage] = useState(""); 

  const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

  const applyColor = (color) => {
    if (selectedPixel.x === null || selectedPixel.y === null) return;

    const currentColor = pixels[selectedPixel.y][selectedPixel.x];
    const now = Date.now();

    if (currentColor === color) {
      setMessage("Ce pixel est déjà de cette couleur !");
      return;
    }

    if (now - lastPlaced < 5000) {
      const waitTime = Math.ceil((5000 - (now - lastPlaced)) / 1000);
      setMessage(`Veuillez attendre ${waitTime} secondes avant de placer un autre pixel`);
      return;
    }

    setPixels(prev => {
      const copy = prev.map(row => [...row]);
      copy[selectedPixel.y][selectedPixel.x] = color;
      return copy;
    });

    setLastPlaced(now);
    setMessage("Pixel placé !");
  };

  // Efface le message après 3 secondes
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

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
        Appliquer la couleur
      </button>

      {/* Message utilisateur */}
      {message && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            backgroundColor: "#fffae6",
            border: "1px solid #ffdd57",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
