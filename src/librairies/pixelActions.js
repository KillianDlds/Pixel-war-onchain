import Web3 from "web3";
import PixelBoardABI from "../PixelWarABI.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS_BASE_SEPOLIA;

export const uint32ToHexColor = (uint32Color) =>
  "#" + Number(uint32Color).toString(16).padStart(6, "0").slice(-6);

// Charger la grille depuis la blockchain
export const loadPixelsFromChain = async (PIXEL_COUNT) => {
  const w3 = new Web3(window.ethereum || null);
  if (!w3) throw new Error("No provider found");
  const contract = new w3.eth.Contract(PixelBoardABI, CONTRACT_ADDRESS);

  const pixels = Array(PIXEL_COUNT)
    .fill(null)
    .map(() => Array(PIXEL_COUNT).fill("#000000"));

  for (let y = 0; y < PIXEL_COUNT; y++) {
    try {
      const row = await contract.methods.getRow(y).call();
      row.forEach((color, x) => {
        pixels[y][x] = uint32ToHexColor(color);
      });
    } catch (err) {
      console.warn(`Error reading row ${y}:`, err);
    }
  }

  return pixels;
};

// Appliquer la couleur (envoyer transaction)
export const applyColor = async (address, selectedPixel, selectedColor) => {
  if (!address) throw new Error("Wallet not connected");
  if (selectedPixel.x === null) throw new Error("Select a pixel first");

  const w3 = new Web3(window.ethereum);
  const contract = new w3.eth.Contract(PixelBoardABI, CONTRACT_ADDRESS);
  const colorInt = parseInt(selectedColor.replace("#", ""), 16);

  await contract.methods
    .setPixel(selectedPixel.x, selectedPixel.y, colorInt)
    .send({ from: address });

  return true;
};
