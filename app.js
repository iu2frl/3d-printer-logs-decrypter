// Anycubic log_1 / log_2 AES-256-CBC key+IV, as published by a community member on the
// Klipper forum (https://klipper.discourse.group/t/printer-cfg-for-anycubic-kobra-2-plus-pro-max/11658/106).
const KEY_HEX = "6DE30155B7964E8CF0F3D2465997A458F8B56FF7E1E537597E9B5861062B4742";
const IV_HEX = "001F35A46358F76877C3382764460775";

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const statusEl = document.getElementById("status");
const outputWrap = document.getElementById("output-wrap");
const outputEl = document.getElementById("output");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");

let lastPlainText = "";
let lastFileName = "decrypted.txt";

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = kind || "";
}

async function decryptBuffer(buffer) {
  const keyBytes = hexToBytes(KEY_HEX);
  const ivBytes = hexToBytes(IV_HEX);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: ivBytes },
    cryptoKey,
    buffer
  );

  return new TextDecoder("utf-8", { fatal: false }).decode(plainBuffer);
}

async function handleFile(file) {
  outputWrap.hidden = true;
  setStatus(`Decrypting ${file.name}…`);

  if (file.size === 0) {
    setStatus(`${file.name} is empty — nothing to decrypt.`, "error");
    return;
  }

  if (file.size % 16 !== 0) {
    setStatus(
      `${file.name} isn't a multiple of the AES block size (16 bytes) — this doesn't look like an encrypted log file.`,
      "error"
    );
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const text = await decryptBuffer(buffer);

    lastPlainText = text;
    lastFileName = file.name.replace(/\.[^.]+$/, "") + ".decrypted.txt";

    outputEl.textContent = text;
    outputWrap.hidden = false;
    setStatus(`Decrypted ${file.name} successfully.`, "ok");
  } catch (err) {
    setStatus(
      `Failed to decrypt ${file.name}: ${err.message}. This key only works for log_1/log_2 files, not firmware update files.`,
      "error"
    );
  }
}

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

dropZone.addEventListener("click", () => fileInput.click());

["dragenter", "dragover"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  })
);

dropZone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([lastPlainText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = lastFileName;
  a.click();
  URL.revokeObjectURL(url);
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(lastPlainText);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy to clipboard"), 1500);
});
