import Web3 from "web3";
import { NETWORKS } from "../constants/networks";
import PixelBoardABI from "../PixelWarABI.json";

export const getWeb3 = (provider) => new Web3(provider);

export const getContract = (web3, network) =>
  new web3.eth.Contract(PixelBoardABI, NETWORKS[network].contractAddress);

export const loadPixels = async (contract, pixelCount) => {
  const pixels = Array(pixelCount).fill(null).map(() => Array(pixelCount).fill("#000000"));
  const promises = [];

  for (let y = 0; y < pixelCount; y++) {
    for (let x = 0; x < pixelCount; x++) {
      promises.push(
        contract.methods.getPixel(x, y).call()
          .then(([color]) => { pixels[y][x] = "#" + Number(color).toString(16).padStart(6, "0"); })
          .catch(() => pixels[y][x] = "#000000")
      );
    }
  }
  await Promise.all(promises);
  return pixels;
};
