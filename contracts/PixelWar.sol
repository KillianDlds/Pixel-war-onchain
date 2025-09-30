// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PixelWar {
    struct Pixel {
        uint32 color;      
        uint256 lastChanged; 
    }

    uint256 public width;
    uint256 public height;

    mapping(uint256 => Pixel) public pixels;


    event PixelUpdated(uint256 x, uint256 y, uint32 color, address indexed user, uint256 timestamp);

    constructor(uint256 _width, uint256 _height) {
        width = _width;
        height = _height;
    }

    // Récupérer un pixel
    function getPixel(uint256 x, uint256 y) external view returns (uint32 color, uint256 lastChanged) {
        require(x < width && y < height, "Invalid coordinates");
        Pixel storage p = pixels[x + y * width];
        return (p.color, p.lastChanged);
    }

    // Changer un pixel
    function setPixel(uint256 x, uint256 y, uint32 color) external {
        require(x < width && y < height, "Invalid coordinates");
        Pixel storage p = pixels[x + y * width];
        p.color = color;
        p.lastChanged = block.timestamp;

        emit PixelUpdated(x, y, color, msg.sender, block.timestamp);
    }
}
