export const NETWORKS = {
  mainnet: {
    chainId: "0xa4ec",
    chainName: "Celo Mainnet",
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0x8e1198805653809F72dA42b8CF049f6337EE65Ed",
  },
  sepolia: {
    chainId: "0xAA044C",
    chainName: "Celo Sepolia Testnet",
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0xfd897a7523f99122ae3ca9b118cf7628dd9c471d",
  },
};