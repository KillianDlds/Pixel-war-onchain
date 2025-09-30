import React from "react";

export default function Pixel({ color, selected, size, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        border: selected ? "2px solid #ff4444" : "1px solid #555",
        boxSizing: "border-box",
        cursor: "pointer"
      }}
    />
  );
}
