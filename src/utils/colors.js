export const uint32ToHexColor = (uint32Color) => {
  const n = Number(uint32Color);
  return "#" + n.toString(16).padStart(6, "0").slice(-6);
};
