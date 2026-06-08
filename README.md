# 🕵️‍♂️ Universal Encoder/Decoder (CyberSec Edition)

A lightweight, zero-dependency, client-side web application for encoding, decoding, and auto-detecting 13 different data formats, machine hashes, and ciphers. 

Live Demo: [Insert your GitHub Pages link here]

## ✨ Features

* **100% Client-Side:** No backend server required. All mathematical conversions happen instantly in your browser.
* **Zero Dependencies:** Built entirely with Vanilla JavaScript, HTML5, and CSS3.
* **The "Magic" Auto-Detector:** A custom-built heuristic scoring engine that analyzes unknown strings and intelligently guesses their format.
* **Cryptographic Hash Interception:** Automatically identifies one-way hashes (MD5, SHA-1, SHA-256) and prevents the engine from attempting mathematically impossible decodes.

## 🧮 Supported Formats

**Machine, Data & Web Standards**
* Base64 (with aggressive whitespace cleaning)
* Base64URL (JWT standard)
* Base32 (RFC 4648)
* Base58 (Bitcoin standard)
* URL Encoding (Percent-encoding)
* Unicode Escape Sequences (`\uXXXX`)
* Shellcode / Hex Escapes (`\xNN`)

**Binary & Number Formats**
* Binary
* Hexadecimal
* Octal
* ASCII Decimal

**Ciphers & Novelty**
* ROT13
* Morse Code

## 🧠 How the Auto-Detection Engine Works

Auto-detecting formats is notoriously difficult due to **Heuristic Collisions** (e.g., `1010` is valid Binary, Hex, ASCII, Octal, and Base58 simultaneously). This project solves this using a custom 5-phase heuristic engine:

1. **The Veto System:** Instantly eliminates formats if a strictly forbidden character is found (e.g., a lowercase letter instantly eliminates Base32).
2. **Definitive Signatures:** Looks for guaranteed markers (e.g., `%20` for URL encoding, or `\x` for Shellcode).
3. **Number Density & Range:** Splits numeric strings to check if they fall within standard ASCII limits (0-255) to accurately differentiate between Hex, Octal, and Decimal.
4. **The "Base" Collision Handler:** Differentiates between Base64, Base58, and Base32 by running entropy checks (e.g., penalizing Base58 if the string contains zero numbers, as real cryptographic hashes are highly randomized).
5. **Base64 Mathematical Validation:** Validates unpadded Base64 strings by ensuring their length does not result in a mathematically impossible modulo of 1.

## 🚀 Getting Started

Since this project has no build steps or dependencies, running it locally is incredibly simple:

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/universal-encoder-decoder.git](https://github.com/yourusername/universal-encoder-decoder.git)
