// --- UPGRADED AUTO-DETECTION ENGINE (WITH CYBERSEC) ---
function detectFormat(input) {
  const cleanStr = input.trim();
  const noSpaces = cleanStr.replace(/\s/g, '');
  if (!cleanStr) return [];
  
  let scores = { 
    binary: 0, hex: 0, base64: 0, url: 0, rot13: 0, 
    ascii: 0, unicode: 0, morse: 0, base32: 0, base58: 0,
    shellcode: 0, octal: 0, base64url: 0, md5_hash: 0, sha1_hash: 0, sha256_hash: 0
  };

  // --- PHASE 1: THE VETO SYSTEM (Elimination) ---
  const hasInvalidBinary = /[^01\s]/.test(cleanStr);
  const hasInvalidHex = /[^0-9A-Fa-f\s]/i.test(cleanStr);
  const hasInvalidOctal = /[^0-7\s]/.test(cleanStr);
  const hasBase58Invalid = /[0OIl+\/=\s]/g.test(cleanStr); 
  const hasBase32Invalid = /[^A-Z2-7=]/g.test(noSpaces); 

  // --- PHASE 1.5: CYBERSEC HASH DETECTION (The Intercept) ---
  if (!hasInvalidHex && !/\s/.test(cleanStr)) {
    if (cleanStr.length === 32) scores.md5_hash += 500;
    if (cleanStr.length === 40) scores.sha1_hash += 500;
    if (cleanStr.length === 64) scores.sha256_hash += 500;
  }

  // --- PHASE 2: DEFINITIVE SIGNATURES ---
  if (/^([.\-]{1,5}[\s/]*)+$/.test(cleanStr)) scores.morse += 200;
  if (/(\\u[0-9A-Fa-f]{4})+/.test(noSpaces)) scores.unicode += 200;
  if (/(%[0-9A-Fa-f]{2})+/.test(cleanStr)) scores.url += 200;
  if (/(\\x[0-9A-Fa-f]{2})+/.test(noSpaces)) scores.shellcode += 200;

  // --- PHASE 3: MACHINE & NUMBER FORMATS ---
  if (!hasInvalidBinary) scores.binary += 100;
  
  if (!hasInvalidOctal) {
    scores.octal += 60;
    if (!/^[01\s]+$/.test(cleanStr)) scores.octal += 50; 
  }

  if (!hasInvalidHex) {
    scores.hex += 50;
    if (!/[A-Fa-f]/i.test(cleanStr)) scores.hex -= 20; 
  }

  if (/^(\d{1,3}\s+)+\d{1,3}$/.test(cleanStr)) {
    const numbers = cleanStr.split(/\s+/);
    const allValid = numbers.every(num => parseInt(num) <= 255);
    if (allValid && numbers.length > 1) {
      scores.ascii += 100;
      scores.hex -= 50; 
      scores.octal -= 50;
    }
  }

  // --- PHASE 4: THE BASE COLLISION ---
  if (!/\s/.test(cleanStr)) {
    // Base64
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanStr)) {
      const unpadded = cleanStr.replace(/=+$/, '');
      if (unpadded.length % 4 !== 1) {
        scores.base64 += 40;
        if (/^[A-Za-z]+$/.test(cleanStr) && !cleanStr.endsWith('=')) scores.base64 -= 30; 
        else if (/[a-z]/.test(cleanStr)) scores.base64 += 20; 
        if (/[+/]/.test(cleanStr)) scores.base64 += 80;  
        if (cleanStr.endsWith('=')) scores.base64 += 80; 
      }
    }

    // Base64URL (JWT)
    if (/^[A-Za-z0-9-_]+$/.test(cleanStr)) {
      scores.base64url += 40;
      if (/[-_]/.test(cleanStr)) scores.base64url += 80; 
    }

    // Base32
    if (!hasBase32Invalid) {
      scores.base32 += 50;
      if (cleanStr.endsWith('=')) scores.base32 += 40; 
      if (/^[A-Z]+$/.test(cleanStr) && !cleanStr.endsWith('=')) scores.base32 -= 40; 
    }

    // Base58
    if (!hasBase58Invalid && /^[1-9A-HJ-NP-Za-km-z]+$/.test(cleanStr)) {
      scores.base58 += 60;
      if (cleanStr.startsWith('1')) scores.base58 += 20; 
      if (/^[A-Za-z]+$/.test(cleanStr)) scores.base58 -= 40; 
    }
  }

  // --- PHASE 5: THE CIPHER TIE-BREAKER ---
  if (/^[A-Za-z\s]+$/.test(cleanStr) && cleanStr.length > 2) {
    scores.rot13 += 30;
  }

  return Object.entries(scores)
    .filter(([format, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(item => item[0]); 
}

// --- UI WIRING ---
const DOM = {
  input: document.getElementById('inputText'),
  output: document.getElementById('outputText'),
  format: document.getElementById('formatSelect'),
  detection: document.getElementById('detectionResult')
};

document.getElementById('btnEncode').addEventListener('click', () => {
  try {
    DOM.output.value = FormatEngine[DOM.format.value].encode(DOM.input.value);
    DOM.detection.innerText = "Manual Encoding Successful.";
  } catch (e) {
    DOM.output.value = `Encoding failed!\nError: ${e.name} - ${e.message}`;
  }
});

document.getElementById('btnDecode').addEventListener('click', () => {
  try {
    DOM.output.value = FormatEngine[DOM.format.value].decode(DOM.input.value);
    DOM.detection.innerText = "Manual Decoding Successful.";
  } catch (e) {
    DOM.output.value = `Decoding failed!\nError: ${e.name} - ${e.message}`;
  }
});

document.getElementById('btnAutoDetect').addEventListener('click', () => {
  const formats = detectFormat(DOM.input.value);

  if (formats.length === 0) {
    DOM.detection.innerText = "Could not confidently detect format.";
    DOM.output.value = "";
    return;
  }

  const likelyFormat = formats[0]; 
  
  // Intercept one-way cryptographic hashes so it doesn't try to decode them
  if (likelyFormat.includes('hash')) {
    DOM.detection.innerText = `Detected as: ${likelyFormat.toUpperCase()}`;
    DOM.output.value = `This string is a ${likelyFormat.split('_')[0].toUpperCase()} cryptographic hash.\n\nHashes are one-way mathematical algorithms used to verify data integrity. They cannot be decoded back into plain text.`;
    return;
  }

  DOM.detection.innerText = `Detected as: ${likelyFormat.toUpperCase()}`;
  
  try {
    DOM.output.value = FormatEngine[likelyFormat].decode(DOM.input.value);
  } catch (e) {
    DOM.output.value = `Decoding failed for ${likelyFormat.toUpperCase()}!\nError: ${e.name} - ${e.message}`;
  }
});

document.getElementById('btnCopy').addEventListener('click', () => {
  DOM.output.select();
  document.execCommand('copy'); 
  DOM.detection.innerText = "Copied to clipboard!";
});