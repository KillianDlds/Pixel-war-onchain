import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PixelBoardABI from "../../PixelWarABI.json";
import { PALETTE } from "../../constants/palette";
import { useAppKit } from "@reown/appkit/react";

// Constantes de configuration
const PIXEL_COUNT = 30;
const PIXEL_SIZE = 14;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS_BASE_SEPOLIA;
const RPC_URL = process.env.REACT_APP_RPC_URL_BASE_SEPOLIA || "https://sepolia.base.org";

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
    const [contract, setContract] = useState(null);
    const [lastPlaced, setLastPlaced] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const { connected, account, provider } = useAppKit();
    const [web3, setWeb3] = useState(null);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    // Initialisation du Web3 et du contrat
    useEffect(() => {
        const init = async () => {
            try {
                const w3 = new Web3(provider || new Web3.providers.HttpProvider(RPC_URL));
                setWeb3(w3);

                const pixelContract = new w3.eth.Contract(PixelBoardABI, CONTRACT_ADDRESS);
                setContract(pixelContract);

                await loadPixelsFromChain(pixelContract);
            } catch (err) {
                console.error("Error initializing Web3:", err);
                showMessage("Failed to connect to the blockchain");
            }
        };
        init();
    }, [provider]);

    const loadPixelsFromChain = async (pixelContract) => {
        setLoading(true);
        const newPixels = Array(PIXEL_COUNT)
            .fill(null)
            .map(() => Array(PIXEL_COUNT).fill("#000000"));

        for (let y = 0; y < PIXEL_COUNT; y++) {
            try {
                const row = await pixelContract.methods.getRow(y).call();
                row.forEach((color, x) => {
                    newPixels[y][x] = uint32ToHexColor(color);
                });
            } catch (err) {
                console.warn(`Error reading row ${y}:`, err);
            }
        }
        setPixels(newPixels);
        setLoading(false);
    };

    const handlePixelClick = (x, y) => setSelectedPixel({ x, y });

    const applyColor = async (color) => {
        if (!contract || !connected) {
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
            return showMessage(`Please wait ${waitTime} seconds`);
        }

        try {
            const colorInt = parseInt(color.replace("#", ""), 16);
            await contract.methods
                .setPixel(selectedPixel.x, selectedPixel.y, colorInt)
                .send({ from: account });

            setLastPlaced(Date.now());
            setPixels((prev) => {
                const copy = prev.map((row) => [...row]);
                copy[selectedPixel.y][selectedPixel.x] = color;
                return copy;
            });
            showMessage("Pixel placed!");
        } catch (err) {
            console.error(err);
            showMessage("Error placing pixel");
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            {!loading && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
                        gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
                        gap: "0px",
                        padding: "6px",
                        borderRadius: "12px",
                        marginTop: "20px",
                        justifyContent: "center",
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
                                            : "1px solid #444",
                                    cursor: "pointer",
                                    boxSizing: "border-box",
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
                    gap: "6px",
                    marginTop: "24px",
                    justifyContent: "center",
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
                            borderRadius: "6px",
                        }}
                    />
                ))}
            </div>

            <button
                onClick={() => applyColor(selectedColor)}
                style={{
                    ...buttonStyle("#2196F3"),
                    marginTop: "20px",
                    opacity: connected ? 1 : 0.6,
                    cursor: connected ? "pointer" : "not-allowed",
                }}
                disabled={!connected}
            >
                Apply color
            </button>

            {message && (
                <div
                    style={{
                        marginTop: "14px",
                        padding: "10px 16px",
                        backgroundColor: "#fffbe6",
                        border: "1px solid #ffe58f",
                        borderRadius: "8px",
                        fontWeight: "500",
                        color: "#333",
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}

const buttonStyle = (bg) => ({
    padding: "10px 20px",
    margin: "10px",
    backgroundColor: bg,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
});
