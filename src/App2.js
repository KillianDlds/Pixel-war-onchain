import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { NETWORKS } from "./constants/networks";
import PixelBoardABI from "./PixelWarABI.json";
import { PALETTE } from "./constants/palette";

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
    if (!window.ethereum) {
      showMessage("Veuillez installer MetaMask !");
      return;
    }

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

      if (!contractAddress) {
        showMessage("Contrat introuvable pour ce réseau");
        return;
      }

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

  // Charger la grille via getRow
  const loadPixelsFromChain = async (pixelContract) => {
    const newPixels = Array(PIXEL_COUNT).fill(null).map(() => Array(PIXEL_COUNT).fill("#000000"));

    for (let y = 0; y < PIXEL_COUNT; y++) {
      try {
        const row = await pixelContract.methods.getRow(y).call();
        for (let x = 0; x < PIXEL_COUNT; x++) {
          newPixels[y][x] = uint32ToHexColor(row[x]);
        }
      } catch (err) {
        console.warn(`Erreur lecture ligne ${y}:`, err);
      }
    }

    setPixels(newPixels);
  };

  const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

  const applyColor = async (color) => {
    if (!contract || !account) {
      showMessage("Connectez votre wallet !");
      return;
    }
    if (selectedPixel.x === null || selectedPixel.y === null) return;

    const now = Date.now();
    if (now - lastPlaced < 60000) {
      const waitTime = Math.ceil((60000 - (now - lastPlaced)) / 1000);
      showMessage(`Veuillez attendre ${waitTime} secondes`);
      return;
    }
    setLastPlaced(now);

    try {
      const colorInt = parseInt(color.replace("#", ""), 16);

      await contract.methods
        .setPixel(selectedPixel.x, selectedPixel.y, colorInt)
        .send({ from: account });

      // Mise à jour dynamique
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

  // Charger la grille même sans wallet
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

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>On chain pixel war</h1>

      {!account ? (
        <button onClick={connectMetaMask} style={{ marginBottom: "20px", padding: "10px 24px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
          Connect Wallet
        </button>
      ) : (
        <button onClick={disconnectWallet} style={{ marginBottom: "20px", padding: "10px 24px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
          Disconnect ({account.slice(0, 6)}...{account.slice(-4)})
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`, gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`, gap: "0px", background: "#222", padding: "2px", borderRadius: "8px" }}>
        {pixels.map((row, y) =>
          row.map((color, x) => (
            <div key={`${x}-${y}`} onClick={() => handlePixelClick(x, y)} style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: color, border: selectedPixel.x === x && selectedPixel.y === y ? "2px solid #ff4444" : "1px solid #555", boxSizing: "border-box", cursor: "pointer" }} />
          ))
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,28px)", gridAutoRows: "28px", gap: "4px", marginTop: "20px" }}>
        {PALETTE.map(color => (
          <div key={color} onClick={() => setSelectedColor(color)} style={{ width: "28px", height: "28px", backgroundColor: color, border: selectedColor === color ? "3px solid #000" : "1px solid #ccc", cursor: "pointer", borderRadius: "4px" }} />
        ))}
      </div>

      <button onClick={() => applyColor(selectedColor)} style={{ marginTop: "20px", padding: "10px 24px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
        Appliquer la couleur
      </button>

      {message && <div style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#fffae6", border: "1px solid #ffdd57", borderRadius: "6px", fontWeight: "bold" }}>{message}</div>}
    </div>
  );
}
