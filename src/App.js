import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { NETWORKS } from "./constants/networks";

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

  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- Forcer Base Sepolia ---
  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORKS.baseSepolia.chainId }],
      });
      return true;
    } catch (e) {
      if (e.code === 4902) {
        const { contractAddress, ...networkParams } = NETWORKS.baseSepolia;
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkParams],
        });
        return true;
      } else {
        console.error(e);
        return false;
      }
    }
  };

  // --- MetaMask connect ---
  const connectMetaMask = async () => {
    const switched = await switchToBaseSepolia();
    if (!switched) return;

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const w3 = new Web3(window.ethereum);
      setWeb3(w3);
      setAccount(accounts[0]);
      showMessage("Connecté à MetaMask sur Base Sepolia !");
    } catch (e) {
      console.error(e);
      showMessage(e.message || JSON.stringify(e));
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    showMessage("Wallet déconnecté");
  };

  // --- Gestion pixels ---
  const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

  const applyColor = (color) => {
    if (!account) {
      showMessage("Connectez votre wallet pour placer un pixel !");
      return;
    }

    if (selectedPixel.x === null || selectedPixel.y === null) return;

    const currentColor = pixels[selectedPixel.y][selectedPixel.x];
    const now = Date.now();

    if (currentColor === color) {
      showMessage("Ce pixel est déjà de cette couleur !");
      return;
    }

    if (now - lastPlaced < 5000) {
      const waitTime = Math.ceil((5000 - (now - lastPlaced)) / 1000);
      showMessage(`Veuillez attendre ${waitTime} secondes avant de placer un autre pixel`);
      return;
    }

    setPixels(prev => {
      const copy = prev.map(row => [...row]);
      copy[selectedPixel.y][selectedPixel.x] = color;
      return copy;
    });

    setLastPlaced(now);
    showMessage("Pixel placé !");
  };

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

      {!account ? (
        <button
          onClick={connectMetaMask}
          style={{
            marginBottom: "20px",
            padding: "10px 24px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={disconnectWallet}
          style={{
            marginBottom: "20px",
            padding: "10px 24px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Disconnect ({account.slice(0, 6)}...{account.slice(-4)})
        </button>
      )}

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
          transition: "all 0.2s ease"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#45a049"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#4CAF50"}
      >
        Appliquer la couleur
      </button>

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
