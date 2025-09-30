import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { NETWORKS } from "../../constants/networks";
import PixelBoardABI from "../../PixelWarABI.json";
import { PALETTE } from "../../constants/palette";
import Pixel from "./Pixel";
import Palette from "./Palette";

const PIXEL_COUNT = 30;
const PIXEL_SIZE = 14;

const uint32ToHexColor = (uint32Color) => {
  const n = Number(uint32Color);
  return "#" + n.toString(16).padStart(6, "0").slice(-6);
};

export default function PixelBoard() {
  const [pixels, setPixels] = useState(
    Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"))
  );
  const [selectedPixel, setSelectedPixel] = useState({ x: null, y: null });
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState("");
  const [lastPlaced, setLastPlaced] = useState(0);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) return showMessage("Veuillez installer MetaMask !");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const w3 = new Web3(window.ethereum);
      setWeb3(w3);
      setAccount(accounts[0]);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      let contractAddress;
      for (const key in NETWORKS) {
        if (NETWORKS[key].chainId.toLowerCase() === chainId.toLowerCase()) {
          contractAddress = NETWORKS[key].contractAddress;
          break;
        }
      }
      if (!contractAddress) return showMessage("Contrat introuvable pour ce réseau");

      const pixelContract = new w3.eth.Contract(PixelBoardABI, contractAddress);
      setContract(pixelContract);
      await loadPixelsFromChain(pixelContract);
      showMessage("Connecté et grille chargée !");
    } catch (err) {
      console.error(err);
      showMessage("Erreur connexion MetaMask");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setContract(null);
    showMessage("Wallet déconnecté");
  };

  const loadPixelsFromChain = async (pixelContract) => {
    const newPixels = Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"));
    for (let y = 0; y < PIXEL_COUNT; y++) {
      try {
        const row = await pixelContract.methods.getRow(y).call();
        row.forEach((color, x) => {
          newPixels[y][x] = uint32ToHexColor(color);
        });
      } catch (err) {
        console.warn(`Erreur lecture ligne ${y}:`, err);
      }
    }
    setPixels(newPixels);
  };

  const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

  const applyColor = async (color) => {
    if (!contract || !account || selectedPixel.x === null) return;
    const now = Date.now();
    if (now - lastPlaced < 60000) {
      const waitTime = Math.ceil((60000 - (now - lastPlaced)) / 1000);
      return showMessage(`Veuillez attendre ${waitTime} secondes`);
    }
    setLastPlaced(now);

    try {
      const colorInt = parseInt(color.replace("#", ""), 16);
      await contract.methods.setPixel(selectedPixel.x, selectedPixel.y, colorInt).send({ from: account });

      setPixels(prev => {
        const copy = prev.map(row => [...row]);
        copy[selectedPixel.y][selectedPixel.x] = color;
        return copy;
      });
      showMessage("Pixel placé !");
    } catch (err) {
      console.error(err);
      showMessage("Erreur lors de l'envoi du pixel");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const provider = new Web3.providers.HttpProvider(NETWORKS.baseSepolia.rpcUrls[0]);
        const w3 = new Web3(provider);
        const pixelContract = new w3.eth.Contract(PixelBoardABI, NETWORKS.baseSepolia.contractAddress);
        await loadPixelsFromChain(pixelContract);
      } catch (err) {
        console.error("Erreur chargement initial:", err);
      }
    };
    init();
  }, []);

 
  return (
    <div
  style={{
    height: "100%", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "20px",
    boxSizing: "border-box",
  }}
>
      <h1 style={{ fontSize: "26px", fontWeight: "600", marginBottom: "16px" }}>
        🎨 On-Chain Pixel War
      </h1>

      {!account ? (
        <button onClick={connectMetaMask} style={buttonStyle("#4CAF50")}>
          Connect Wallet
        </button>
      ) : (
        <button onClick={disconnectWallet} style={buttonStyle("#f44336")}>
          Disconnect ({account.slice(0, 6)}...{account.slice(-4)})
        </button>
      )}

      {/* Plateau */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
        gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
        gap: "0px",
        background: "#2c2c2c",   // gris foncé, contraste avec fond clair
        padding: "6px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        marginTop: "20px",
      }}>
        {pixels.map((row, y) =>
          row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handlePixelClick(x, y)}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: color,
                border: selectedPixel.x === x && selectedPixel.y === y
                  ? "1px solid #ff4444"
                  : "1px solid #444",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      {/* Palette */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(10,28px)",
        gridAutoRows: "28px",
        gap: "6px",
        marginTop: "24px",
        padding: "12px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        {PALETTE.map(color => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: color,
              border: selectedColor === color ? "3px solid #000" : "1px solid #ccc",
              cursor: "pointer",
              borderRadius: "6px",
            }}
          />
        ))}
      </div>

      <button onClick={() => applyColor(selectedColor)} style={{ ...buttonStyle("#2196F3"), marginTop: "20px" }}>
        Appliquer la couleur
      </button>

      {message && (
        <div style={{
          marginTop: "14px",
          padding: "10px 16px",
          backgroundColor: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: "8px",
          fontWeight: "500",
          color: "#333",
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bg) => ({
  marginBottom: "16px",
  padding: "10px 20px",
  backgroundColor: bg,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
  transition: "background 0.2s ease-in-out",
});