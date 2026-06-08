function detectFormat(input) {
  const cleanStr = input.trim();
  const noSpaces = cleanStr.replace(/\s/g, '');
  
  // Track scores in an object
  let scores = {
    binary: 0,
    hex: 0,
    base64: 0,
    url: 0
  };

  // --- 1. Basic Regex Passes ---
  if (/^[01\s]+$/.test(cleanStr)) scores.binary += 50;
  if (/^[0-9A-Fa-f\s]+$/.test(cleanStr)) scores.hex += 20;
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(noSpaces)) scores.base64 += 10;

  // --- 2. Byte Boundaries ---
  if (scores.binary > 0 && noSpaces.length % 8 === 0) scores.binary += 25;
  if (scores.hex > 0 && noSpaces.length % 2 === 0) scores.hex += 20;
  if (scores.base64 > 0 && noSpaces.length % 4 === 0) scores.base64 += 30;

  // --- 3. Entropy & Density ---
  // If it's valid hex, but has NO letters A-F, penalize hex
  if (scores.hex > 0 && !/[A-Fa-f]/.test(cleanStr)) {
    scores.hex -= 15; // Probably just binary or decimal
  }

  // --- 4. Signatures ---
  if (cleanStr.endsWith('=') || cleanStr.endsWith('==')) scores.base64 += 100;
  if (/%[0-9A-Fa-f]{2}/.test(cleanStr)) scores.url += 100;

  // --- Sort and Return ---
  // Convert object to an array, sort by highest score, and filter out scores of 0
  return Object.entries(scores)
    .filter(([format, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(item => item[0]); // Returns e.g., ["binary", "hex", "base64"]
} 