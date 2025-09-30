export const NETWORKS = {
  mainnet: {
    chainId: "0xa4ec",
    chainName: "Celo Mainnet",
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
  sepolia: {
    chainId: "0xAA044C",
    chainName: "Celo Sepolia Testnet",
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
  baseSepolia: {
    chainId: "0x14A34",
    chainName: "Base Sepolia Testnet",
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x4Eabc806eF4c371eb1c61A1020F89768a96A12A9", 
  },
};
