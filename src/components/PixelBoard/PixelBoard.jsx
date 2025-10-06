// src/components/PixelBoard/PixelBoard.jsx
import React, { useEffect, useState } from "react";
import { PALETTE } from "../../constants/palette";
import { useAccount } from "wagmi";
import { loadPixelsFromChain, applyColor } from "../../librairies/pixelActions";

const PIXEL_COUNT = 30;
const PIXEL_SIZE = 14;

export default function PixelBoard() {
  const { address, isConnected } = useAccount();
  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"))
  );
  const [selectedPixel, setSelectedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [message, setMessage] = useState("");
  const [lastPlaced, setLastPlaced] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const refreshGrid = async () => {
    setLoadingGrid(true);
    try {
      const newPixels = await loadPixelsFromChain(PIXEL_COUNT);
      setPixels(newPixels);
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors du chargement de la grille");
    } finally {
      setLoadingGrid(false);
    }
  };

  useEffect(() => {
    refreshGrid();
  }, []);

  const handlePixelClick = (x, y) => {
    setSelectedPixel({ x, y });
  };

  const handleApplyColor = async () => {
    if (!isConnected) {
      showMessage("Connect wallet first!");
      return;
    }

    if (selectedPixel.x === null) {
      showMessage("Select a pixel first!");
      return;
    }

    const now = Date.now();
    if (now - lastPlaced < 60000) {
      const waitTime = Math.ceil((60000 - (now - lastPlaced)) / 1000);
      showMessage(`Please wait ${waitTime} seconds`);
      return;
    }

    try {
      setIsSending(true);
      await applyColor(address, selectedPixel, selectedColor);
      setLastPlaced(Date.now());
      showMessage("Pixel placé ✅");
      await refreshGrid();
    } catch (err) {
      console.error(err);
      showMessage("Erreur transaction");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2 style={{ marginBottom: 12 }}>On-Chain Pixel War</h2>

      {/* Grid */}
      {loadingGrid ? (
        <div style={{ margin: 24 }}>Loading grid…</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
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
                onClick={() => handlePixelClick(x, y)}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                  border:
                    selectedPixel.x === x && selectedPixel.y === y
                      ? "2px solid #ff4444" // contour du pixel sélectionné
                      : "1px solid #333",
                  boxSizing: "border-box",
                  cursor: isSending ? "not-allowed" : "pointer",
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Palette */}
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
            onClick={() => setSelectedColor(c)}
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

      {/* Apply button */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleApplyColor}
          disabled={selectedPixel.x === null || isSending}
          style={{
            padding: "10px 18px",
            background: selectedPixel.x !== null ? "#1976d2" : "#999",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: selectedPixel.x !== null ? "pointer" : "not-allowed",
            opacity: selectedPixel.x !== null ? 1 : 0.6,
          }}
        >
          {isSending ? "Sending…" : "Apply color"}
        </button>
      </div>

      {/* Status */}
      {message && (
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 8,
            display: "inline-block",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
