// ❌ SUPPRIMÉ : require("qrcode")
// 👉 QRCode est maintenant chargé via CDN dans le HTML

const canvas = document.getElementById("canvas");
const mode = document.getElementById("mode");
const urlInput = document.getElementById("urlInput");
const color = document.getElementById("color");
const bgColor = document.getElementById("bgColor");

const logoSizeInput = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

let logoSize = 40;
let logoImage = null;

const logoPosXInput = document.getElementById("logoPosX");
const logoPosYInput = document.getElementById("logoPosY");

const logoPosXValue = document.getElementById("logoPosXValue");
const logoPosYValue = document.getElementById("logoPosYValue");

let logoPosX = 0;
let logoPosY = 0;

// =======================
// 🎯 MODE SWITCH
// =======================
mode.addEventListener("change", () => {
  const urlBlock = document.getElementById("urlBlock");
  const wifiBlock = document.getElementById("wifiBlock");

  if (mode.value === "url") {
    urlBlock.classList.remove("urlBlockHidden");
    urlBlock.classList.add("urlBlock");
    wifiBlock.classList.remove("wifiBlock");
    wifiBlock.classList.add("wifiBlockHidden");
  } else {
    urlBlock.classList.remove("urlBlock");
    urlBlock.classList.add("urlBlockHidden");
    wifiBlock.classList.remove("wifiBlockHidden");
    wifiBlock.classList.add("wifiBlock");
  }

  generate();
});

// =======================
// 🎯 EVENTS
// =======================
[urlInput, color, bgColor].forEach((el) =>
  el.addEventListener("input", generate),
);

document.getElementById("ssid").addEventListener("input", generate);
document.getElementById("password").addEventListener("input", generate);

// =======================
// 📁 FILE CUSTOM
// =======================
const fileInput = document.getElementById("logoInput");
const fileName = document.getElementById("fileName");
const selectBtn = document.getElementById("selectFileBtn");
const removeBtn = document.getElementById("removeFileBtn");

selectBtn.onclick = () => fileInput.click();

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;
  removeBtn.style.display = "inline";

  const reader = new FileReader();

  reader.onload = () => {
    logoImage = new Image();
    logoImage.src = reader.result;
    logoImage.onload = generate;
  };

  reader.readAsDataURL(file);
});

removeBtn.onclick = () => {
  fileInput.value = "";
  logoImage = null;
  fileName.textContent = "Aucun fichier";
  removeBtn.style.display = "none";
  generate();
};

// =======================
// 🎯 LOGO SIZE
// =======================
logoSizeInput.addEventListener("input", () => {
  logoSize = parseInt(logoSizeInput.value);
  logoSizeValue.textContent = logoSize;
  generate();
});

// =======================
// 🎯 LOGO POSITION
// =======================
logoPosXInput.addEventListener("input", () => {
  logoPosX = parseInt(logoPosXInput.value);
  logoPosXValue.textContent = logoPosX;
  generate();
});

logoPosYInput.addEventListener("input", () => {
  logoPosY = parseInt(logoPosYInput.value);
  logoPosYValue.textContent = logoPosY;
  generate();
});

// =======================
// 🧠 REMOVE WHITE BACKGROUND
// =======================
function removeWhiteBackground(image) {
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");

  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return tempCanvas;
}

// =======================
// 🧠 VALUE
// =======================
function getValue() {
  if (mode.value === "wifi") {
    const ssid = document.getElementById("ssid").value;
    const password = document.getElementById("password").value;

    if (!ssid) return null;

    return `WIFI:T:WPA;S:${ssid};P:${password};;`;
  } else {
    let url = urlInput.value;
    if (!url) return null;

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    return url;
  }
}

// =======================
// ⚡ GENERATE PREVIEW (170px)
// =======================
function generate() {
  const value = getValue();
  if (!value) return;

  QRCode.toCanvas(
    canvas,
    value,
    {
      width: 170,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: color.value,
        light: bgColor.value,
      },
    },
    () => {
      if (logoImage) {
        const ctx = canvas.getContext("2d");

        const processedLogo = removeWhiteBackground(logoImage);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const maxOffset = (canvas.width - logoSize) / 2;

        const safeX = Math.max(-maxOffset, Math.min(maxOffset, logoPosX));
        const safeY = Math.max(-maxOffset, Math.min(maxOffset, logoPosY));

        ctx.drawImage(
          processedLogo,
          centerX - logoSize / 2 + safeX,
          centerY - logoSize / 2 + safeY,
          logoSize,
          logoSize,
        );
      }
    },
  );
}

// =======================
// 📥 PNG HD (1000px)
// =======================
document.getElementById("pngBtn").onclick = () => {
  const value = getValue();
  if (!value) return;

  const tempCanvas = document.createElement("canvas");

  QRCode.toCanvas(
    tempCanvas,
    value,
    {
      width: 1000,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: color.value,
        light: bgColor.value,
      },
    },
    () => {
      if (logoImage) {
        const ctx = tempCanvas.getContext("2d");

        const processedLogo = removeWhiteBackground(logoImage);

        const size = tempCanvas.width;
        const scale = size / canvas.width;

        const logoSizeHD = logoSize * scale;
        const offsetX = logoPosX * scale;
        const offsetY = logoPosY * scale;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          processedLogo,
          size / 2 - logoSizeHD / 2 + offsetX,
          size / 2 - logoSizeHD / 2 + offsetY,
          logoSizeHD,
          logoSizeHD,
        );
      }

      const link = document.createElement("a");
      link.download = "qr.png";
      link.href = tempCanvas.toDataURL("image/png", 1.0);
      link.click();
    },
  );
};

// =======================
// 📥 SVG HD
// =======================
document.getElementById("svgBtn").onclick = () => {
  const value = getValue();
  if (!value) return;

  QRCode.toString(
    value,
    {
      type: "svg",
      width: 1000,
      margin: 2,
      color: {
        dark: color.value,
        light: bgColor.value,
      },
    },
    (err, svg) => {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "qr.svg";
      a.click();

      URL.revokeObjectURL(url);
    },
  );
};

// =======================
// INIT
// =======================
generate();