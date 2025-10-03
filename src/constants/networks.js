export const NETWORKS = {
  celoMainnet: {
    chainId: "0xa4ec",
    chainName: "Celo Mainnet",
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0x698b374C3B664EB5ae7A87f38CB4909eAE1231c1",
  },
  celoSepolia: {
    chainId: "0xAA044C",
    chainName: "Celo Sepolia Testnet",
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
    blockExplorerUrls: ["https://celoscan.io"],
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    contractAddress: "0xa236159c79b89ac1747d19e7880a6fb58fa7f85c",
  },
  baseSepolia: {
    chainId: "0x14A34",
    chainName: "Base Sepolia Testnet",
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x3ddc57f7d49c74d76f39a9623fece342e82fe3cd", 
  },
  baseMainnet: {
    chainId: "0x2105",
    chainName: "Base Sepolia Testnet",
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["	https://base.blockscout.com/"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    contractAddress: "0x2f6326006f29f6c78791b09a9c9911a56df83300", 
  },
};
