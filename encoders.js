const FormatEngine = {
  base64: {
    encode: (str) => btoa(str),
    decode: (str) => atob(str.replace(/[^A-Za-z0-9+/=]/g, '')) 
  },
  binary: {
    encode: (str) => str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
    decode: (str) => str.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('')
  },
  hex: {
    encode: (str) => str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
    decode: (str) => str.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join('')
  },
  url: {
    encode: (str) => encodeURIComponent(str),
    decode: (str) => decodeURIComponent(str)
  },
  rot13: {
    encode: (str) => str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)),
    decode: (str) => str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))
  },
  ascii: {
    encode: (str) => str.split('').map(c => c.charCodeAt(0)).join(' '),
    decode: (str) => str.trim().split(/\s+/).map(n => String.fromCharCode(parseInt(n, 10))).join('')
  },
  unicode: {
    encode: (str) => str.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''),
    decode: (str) => str.replace(/\\u[\dA-Fa-f]{4}/g, match => String.fromCharCode(parseInt(match.slice(2), 16)))
  },
  morse: {
    dict: { 'A':'.-', 'B':'-...', 'C':'-.-.', 'D':'-..', 'E':'.', 'F':'..-.', 'G':'--.', 'H':'....', 'I':'..', 'J':'.---', 'K':'-.-', 'L':'.-..', 'M':'--', 'N':'-.', 'O':'---', 'P':'.--.', 'Q':'--.-', 'R':'.-.', 'S':'...', 'T':'-', 'U':'..-', 'V':'...-', 'W':'.--', 'X':'-..-', 'Y':'-.--', 'Z':'--..', '1':'.----', '2':'..---', '3':'...--', '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.', '0':'-----', ',':'--..--', '.':'.-.-.-', '?':'..--..', '/':'-..-.', '-':'-....-', '(':'-.--.', ')':'-.--.-' },
    encode: function(str) {
      return str.toUpperCase().split('').map(c => {
        if (c === ' ') return '/'; 
        return this.dict[c] || c;
      }).join(' ');
    },
    decode: function(str) {
      const revDict = Object.fromEntries(Object.entries(this.dict).map(([k, v]) => [v, k]));
      return str.trim().split(/\s+/).map(m => {
        if (m === '/') return ' ';
        return revDict[m] || m;
      }).join('');
    }
  },
  base32: {
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    encode: function(str) {
      let bits = 0, value = 0, output = '';
      for (let i = 0; i < str.length; i++) {
        value = (value << 8) | str.charCodeAt(i);
        bits += 8;
        while (bits >= 5) {
          output += this.alphabet[(value >>> (bits - 5)) & 31];
          bits -= 5;
        }
      }
      if (bits > 0) output += this.alphabet[(value << (5 - bits)) & 31];
      while (output.length % 8 !== 0) output += '=';
      return output;
    },
    decode: function(str) {
      let bits = 0, value = 0, output = '';
      const cleanStr = str.replace(/=+$/, '').toUpperCase();
      for (let i = 0; i < cleanStr.length; i++) {
        const index = this.alphabet.indexOf(cleanStr[i]);
        if (index === -1) continue;
        value = (value << 5) | index;
        bits += 5;
        if (bits >= 8) {
          output += String.fromCharCode((value >>> (bits - 8)) & 255);
          bits -= 8;
        }
      }
      return output;
    }
  },
  base58: {
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    encode: function(str) {
      if (!str) return "";
      let bytes = Array.from(str).map(c => c.charCodeAt(0));
      let bigInt = bytes.reduce((acc, byte) => (acc * 256n) + BigInt(byte), 0n);
      let output = '';
      while (bigInt > 0n) {
        output = this.alphabet[Number(bigInt % 58n)] + output;
        bigInt = bigInt / 58n;
      }
      for (let byte of bytes) {
        if (byte === 0) output = '1' + output; else break;
      }
      return output;
    },
    decode: function(str) {
      if (!str) return "";
      let bigInt = 0n;
      for (let i = 0; i < str.length; i++) {
        let index = this.alphabet.indexOf(str[i]);
        if (index === -1) throw new Error("Invalid Base58 character");
        bigInt = (bigInt * 58n) + BigInt(index);
      }
      let hex = bigInt.toString(16);
      if (hex.length % 2) hex = '0' + hex; 
      let output = '';
      for (let i = 0; i < hex.length; i += 2) {
        output += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      }
      return output;
    }
  },
  shellcode: {
    encode: (str) => str.split('').map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    decode: (str) => str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  },
  octal: {
    encode: (str) => str.split('').map(c => c.charCodeAt(0).toString(8).padStart(3, '0')).join(' '),
    decode: (str) => str.trim().split(/\s+/).map(o => String.fromCharCode(parseInt(o, 8))).join('')
  },
  base64url: {
    encode: (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    decode: (str) => {
      let s = str.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '='; 
      return atob(s);
    }
  }
};