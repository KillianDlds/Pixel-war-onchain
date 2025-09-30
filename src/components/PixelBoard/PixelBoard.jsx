import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { NETWORKS } from "../../constants/networks";
import PixelBoardABI from "../../PixelWarABI.json";
import { PALETTE } from "../../constants/palette";

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
    const [loading, setLoading] = useState(false);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const connectMetaMask = async () => {
    if (!window.ethereum) return showMessage("Please install MetaMask!");
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
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
            if (!contractAddress) return showMessage("Contract not found for this network");

            const pixelContract = new w3.eth.Contract(PixelBoardABI, contractAddress);
            setContract(pixelContract);
            await loadPixelsFromChain(pixelContract);

            // Sauvegarde connexion
            localStorage.setItem("pixelwar_account", accounts[0]);
            localStorage.setItem("pixelwar_connected", "true");

            showMessage("Connected and grid loaded!");
        } catch (err) {
            console.error(err);
            showMessage("MetaMask connection error");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setWeb3(null);
        setContract(null);

        // Sauvegarde état déconnecté
        localStorage.removeItem("pixelwar_account");
        localStorage.setItem("pixelwar_connected", "false");

    showMessage("Wallet disconnected");
    };

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
        if (!contract || !account || selectedPixel.x === null) return;
        const now = Date.now();
        if (now - lastPlaced < 60000) {
            const waitTime = Math.ceil((60000 - (now - lastPlaced)) / 1000);
            return showMessage(`Please wait ${waitTime} seconds`);
        }
        setLastPlaced(now);

        try {
            const colorInt = parseInt(color.replace("#", ""), 16);
            await contract.methods
                .setPixel(selectedPixel.x, selectedPixel.y, colorInt)
                .send({ from: account });

            setPixels((prev) => {
                const copy = prev.map((row) => [...row]);
                copy[selectedPixel.y][selectedPixel.x] = color;
                return copy;
            });
            showMessage("Pixel placed!");
        } catch (err) {
            console.error(err);
            showMessage("Error while sending pixel");
        }
    };

    // Charger la grille même sans wallet
    useEffect(() => {
        const init = async () => {
            try {
                const provider = new Web3.providers.HttpProvider(
                    NETWORKS.baseSepolia.rpcUrls[0]
                );
                const w3 = new Web3(provider);
                const pixelContract = new w3.eth.Contract(
                    PixelBoardABI,
                    NETWORKS.baseSepolia.contractAddress
                );
                await loadPixelsFromChain(pixelContract);
            } catch (err) {
                console.error("Initial loading error:", err);
            }
        };
        init();
    }, []);

    // Restaurer connexion si active
    useEffect(() => {
        const reconnect = async () => {
            const connected = localStorage.getItem("pixelwar_connected");
            if (connected === "true" && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts",
                    });
                    if (accounts.length > 0) {
                        await connectMetaMask();
                    }
                } catch (err) {
                    console.error("Reconnection error:", err);
                }
            }
        };
        reconnect();
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
            {loading && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "40px 0 30px 0"
                }}>
                    <div style={{
                        width: 54,
                        height: 54,
                        border: "7px solid #e0e0e0",
                        borderTop: "7px solid #2196F3",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}
                    className="pixelwar-spinner"
                    />
                    <div style={{marginTop: 18, fontWeight: 600, color: "#2196F3", fontSize: "18px", letterSpacing:1}}>
                        Loading grid…
                    </div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .pixelwar-spinner {
                            box-shadow: 0 2px 8px rgba(33,150,243,0.10);
                        }
                    `}</style>
                </div>
            )}

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
            {!loading && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
                        gridTemplateRows: `repeat(${PIXEL_COUNT}, ${PIXEL_SIZE}px)`,
                        gap: "0px",
                        background: "#2c2c2c",
                        padding: "6px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        marginTop: "20px",
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
                                            ? "1px solid #ff4444"
                                            : "1px solid #444",
                                    boxSizing: "border-box",
                                    cursor: "pointer",
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
                    padding: "12px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
                            border:
                                selectedColor === color ? "3px solid #000" : "1px solid #ccc",
                            cursor: "pointer",
                            borderRadius: "6px",
                        }}
                    />
                ))}
            </div>

            {/* Bouton appliquer ou connect & apply */}
            {/* Apply or Connect & Apply button */}
            {!account ? (
                <button
                    onClick={async () => {
                        await connectMetaMask();
                    }}
                    style={{ ...buttonStyle("#2196F3"), marginTop: "20px" }}
                >
                    Connect & Apply
                </button>
            ) : (
                <button
                    onClick={() => applyColor(selectedColor)}
                    style={{ ...buttonStyle("#2196F3"), marginTop: "20px" }}
                >
                    Apply color
                </button>
            )}

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
