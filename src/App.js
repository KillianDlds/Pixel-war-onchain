import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x"; 
const CONTRACT_ABI = [
  "function width() view returns (uint256)",
  "function height() view returns (uint256)",
  "function getPixel(uint256 x, uint256 y) view returns (uint32 color, uint256 lastChanged)",
  "function setPixel(uint256 x, uint256 y, uint32 color)",
  "function lastChangeOf(address) view returns (uint256)",
  "event PixelUpdated(uint256 x, uint256 y, uint32 color, address indexed who, uint256 timestamp)"
];

function colorNumberToHex(num) {
  return "#" + Number(num).toString(16).padStart(6, "0");
}

function hexToColorNumber(hex) {
  return parseInt(hex.replace(/^#/, ""), 16);
}

export default function PixelChainApp() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [pixels, setPixels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [colorPicker, setColorPicker] = useState("#000000");

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const w3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await w3.eth.getAccounts();
      setWeb3(w3);
      setAccount(accounts[0]);

      const c = new w3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(c);
    } else {
      alert("Veuillez installer MetaMask !");
    }
  };

  useEffect(() => {
    const fetchCanvas = async () => {
      if (!contract) return;

      const w = await contract.methods.width().call();
      const h = await contract.methods.height().call();
      setWidth(Number(w));
      setHeight(Number(h));

      const arr = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          try {
            const p = await contract.methods.getPixel(x, y).call();
            arr.push({ color: colorNumberToHex(p.color), lastChanged: Number(p.lastChanged) });
          } catch {
            arr.push({ color: "#ffffff", lastChanged: 0 });
          }
        }
      }
      setPixels(arr);
    };
    fetchCanvas();
  }, [contract]);

  const applyColor = async () => {
    if (!selected || !account) return;

    try {
      // Provider & signer ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contractWithSigner.setPixel(selected.x, selected.y, hexToColorNumber(colorPicker));
      await tx.wait();

      const idx = selected.y * width + selected.x;
      setPixels((prev) => {
        const copy = [...prev];
        copy[idx] = { color: colorPicker, lastChanged: Math.floor(Date.now() / 1000) };
        return copy;
      });

      setSelected(null);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'envoi de la transaction : " + e.message);
    }
  };

  return (
    <div className="p-6">
      {!account ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Connect Wallet
        </button>
      ) : (
        <div>
          <div>Wallet: {account}</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${width}, 20px)` }}>
            {pixels.map((p, i) => (
              <div
                key={i}
                onClick={() => setSelected({ x: i % width, y: Math.floor(i / width) })}
                style={{ width: 20, height: 20, backgroundColor: p.color, border: "1px solid #ccc" }}
              />
            ))}
          </div>
          {selected && (
            <div className="mt-4">
              <div>Pixel: x {selected.x}, y {selected.y}</div>
              <input type="color" value={colorPicker} onChange={(e) => setColorPicker(e.target.value)} />
              <button onClick={applyColor} className="ml-2 bg-green-600 text-white px-2 py-1 rounded">
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
