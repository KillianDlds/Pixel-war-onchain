import React from "react";

export default function Palette({ palette, selectedColor, onSelect }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(10,28px)", gridAutoRows:"28px", gap:"4px", marginTop:"20px" }}>
      {palette.map(color => (
        <div
          key={color}
          onClick={() => onSelect(color)}
          style={{
            width:"28px",
            height:"28px",
            backgroundColor: color,
            border: selectedColor === color ? "3px solid #000" : "1px solid #ccc",
            cursor:"pointer",
            borderRadius:"4px"
          }}
        />
      ))}
    </div>
  );
}
