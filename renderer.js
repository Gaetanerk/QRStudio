const canvas = document.getElementById("canvas");
const mode = document.getElementById("mode");
const urlInput = document.getElementById("urlInput");
const color = document.getElementById("color");
const bgColor = document.getElementById("bgColor");

let logoSize = 25;
let logoImage = null;
let logoPosX = 0;
let logoPosY = 0;

let qrStyled = null;
let logoBase64 = null;

mode.addEventListener("change", updateModeVisibility);

function updateModeVisibility() {
  const currentMode = mode.value;

  const urlBlock = document.getElementById("urlBlock");

  const wifiBlock = document.getElementById("wifiBlock");

  const mapsBlock = document.getElementById("mapsBlock");

  // RESET
  urlBlock.classList.add("urlBlockHidden");
  wifiBlock.classList.add("wifiBlockHidden");
  mapsBlock.classList.add("wifiBlockHidden");

  // URL
  if (currentMode === "url") {
    urlBlock.classList.remove("urlBlockHidden");
  }

  // WIFI
  if (currentMode === "wifi") {
    wifiBlock.classList.remove("wifiBlockHidden");
  }

  // MAPS
  if (currentMode === "maps") {
    mapsBlock.classList.remove("wifiBlockHidden");
  }

  generate();
}

// =======================
// EVENTS
// =======================
[urlInput, color, bgColor, document.getElementById("qrStyle")].forEach((el) =>
  el.addEventListener("input", generate),
);

document.getElementById("ssid").addEventListener("input", generate);
document.getElementById("password").addEventListener("input", generate);
document.getElementById("mapsAddress").addEventListener("input", generate);
document.getElementById("latitude").addEventListener("input", generate);
document.getElementById("longitude").addEventListener("input", generate);
document.getElementById("mapsType").addEventListener("change", () => {
  const type = document.getElementById("mapsType").value;

  document.getElementById("addressBlock").style.display =
    type === "address" ? "block" : "none";

  document.getElementById("coordsBlock").style.display =
    type === "coords" ? "block" : "none";

  generate();
});

// =======================
// LOGO
// =======================
const fileInput = document.getElementById("logoInput");
const fileName = document.getElementById("fileName");
const removeBtn = document.getElementById("removeFileBtn");

document.getElementById("selectFileBtn").onclick = () => fileInput.click();

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;
  removeBtn.style.display = "inline";

  const reader = new FileReader();
  reader.onload = () => {
    logoBase64 = reader.result;

    const img = new Image();
    img.src = reader.result;

    img.onload = () => {
      logoImage = img;
      generate();
    };
  };

  reader.readAsDataURL(file);
});

removeBtn.onclick = () => {
  fileInput.value = "";
  logoImage = null;
  logoBase64 = null;
  fileName.textContent = "Aucun fichier";
  removeBtn.style.display = "none";
  generate();
};

// =======================
// SLIDERS
// =======================
document.getElementById("logoSize").addEventListener("input", (e) => {
  logoSize = parseInt(e.target.value);
  document.getElementById("logoSizeValue").textContent = logoSize;
  generate();
});

document.getElementById("logoPosX").addEventListener("input", (e) => {
  logoPosX = parseInt(e.target.value);
  document.getElementById("logoPosXValue").textContent = logoPosX;
  generate();
});

document.getElementById("logoPosY").addEventListener("input", (e) => {
  logoPosY = parseInt(e.target.value);
  document.getElementById("logoPosYValue").textContent = logoPosY;
  generate();
});

// =======================
// REMOVE BG
// =======================
function removeWhiteBackground(image) {
  const temp = document.createElement("canvas");
  const ctx = temp.getContext("2d");

  temp.width = image.width;
  temp.height = image.height;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, temp.width, temp.height);
  const data = imageData.data;

  const width = temp.width;
  const height = temp.height;

  const visited = new Uint8Array(width * height);
  const stack = [];

  function isBg(i) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    return r > 200 && g > 200 && b > 200;
  }

  for (let x = 0; x < width; x++) {
    stack.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    stack.push([0, y], [width - 1, y]);
  }

  while (stack.length) {
    const [x, y] = stack.pop();
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const i = idx * 4;
    if (!isBg(i)) continue;

    data[i + 3] = 0;

    if (x > 0) stack.push([x - 1, y]);
    if (x < width - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < height - 1) stack.push([x, y + 1]);
  }

  ctx.putImageData(imageData, 0, 0);
  return temp;
}

// =======================
// DRAW LOGO
// =======================
function drawLogo(ctx, img, size) {
  const ratio = img.width / img.height;

  let width = (logoSize / 100) * size;
  let height = width;

  if (ratio > 1) {
    height = width / ratio;
  } else {
    width = height * ratio;
  }

  const x = size / 2 - width / 2 + (logoPosX / 100) * size;

  const y = size / 2 - height / 2 + (logoPosY / 100) * size;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // =========================
  // WHITE CIRCLE
  // =========================

  const circleSize = Math.max(width, height) + size * 0.045;

  ctx.beginPath();

  ctx.arc(centerX, centerY, circleSize / 2, 0, Math.PI * 2);

  ctx.fillStyle = "white";

  ctx.fill();

  // =========================
  // BLACK BORDER
  // =========================

  ctx.lineWidth = size * 0.005;

  ctx.strokeStyle = "#111";

  ctx.stroke();

  // =========================
  // LOGO
  // =========================

  ctx.drawImage(img, x, y, width, height);
}

function drawLogoBorder(ctx, size) {
  const logoFinalSize = (logoSize / 100) * size;

  const centerX = size / 2 + (logoPosX / 100) * size;
  const centerY = size / 2 + (logoPosY / 100) * size;

  const circleSize = logoFinalSize + size * 0.045;

  // =========================
  // CUT REAL HOLE
  // =========================

  ctx.save();

  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();

  ctx.arc(centerX, centerY, circleSize / 2, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

  // =========================
  // WHITE CIRCLE
  // =========================

  ctx.beginPath();

  ctx.arc(centerX, centerY, circleSize / 2, 0, Math.PI * 2);

  ctx.fillStyle = "white";

  ctx.fill();

  // =========================
  // BORDER
  // =========================

  ctx.lineWidth = size * 0.005;

  ctx.strokeStyle = "#111";

  ctx.stroke();
}

function getProcessedLogoBase64() {
  if (!logoImage) return null;

  const processed = removeWhiteBackground(logoImage);
  const c = document.createElement("canvas");
  c.width = processed.width;
  c.height = processed.height;

  const ctx = c.getContext("2d");
  ctx.drawImage(processed, 0, 0);

  return c.toDataURL("image/png");
}

// =======================
// VALUE
// =======================
function getValue() {
  if (mode.value === "wifi") {
    const ssid = document.getElementById("ssid").value;
    const password = document.getElementById("password").value;
    if (!ssid) return null;
    return `WIFI:T:WPA;S:${ssid};P:${password};;`;
  }

  if (mode.value === "maps") {
    const type = document.getElementById("mapsType").value;

    // ===================
    // ADRESSE
    // ===================
    if (type === "address") {
      const address = document.getElementById("mapsAddress").value;

      if (!address) return null;

      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }

    // ===================
    // COORDONNÉES GPS
    // ===================
    const lat = document.getElementById("latitude").value;

    const lng = document.getElementById("longitude").value;

    if (!lat || !lng) return null;

    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  let url = urlInput.value;
  if (!url) return null;
  if (!url.startsWith("http")) url = "https://" + url;
  return url;
}

function getStyleOptions(style) {
  switch (style) {
    case "rounded":
      return {
        dots: "rounded",
        cornersSquare: "extra-rounded",
        cornersDot: "dot",
      };

    case "dots":
      return {
        dots: "dots",
        cornersSquare: "dot",
        cornersDot: "dot",
      };

    case "extra-rounded":
      return {
        dots: "extra-rounded",
        cornersSquare: "extra-rounded",
        cornersDot: "dot",
      };

    case "classy":
      return {
        dots: "classy",
        cornersSquare: "classy",
        cornersDot: "square",
      };

    case "classy-rounded":
      return {
        dots: "classy-rounded",
        cornersSquare: "extra-rounded",
        cornersDot: "dot",
      };

    default:
      return {
        dots: "square",
        cornersSquare: "square",
        cornersDot: "square",
      };
  }
}

// =======================
// GENERATE PREVIEW
// =======================
function generate() {
  const value = getValue();
  const ctx = canvas.getContext("2d");

  canvas.width = 1000;
  canvas.height = 1000;

  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!value) return;

  const style = document.getElementById("qrStyle").value;

  const styleOptions = getStyleOptions(style);

  const qrContainer = document.createElement("div");

  qrContainer.style.display = "none";

  document.body.appendChild(qrContainer);

  qrStyled = new QRCodeStyling({
    width: 1000,
    height: 1000,
    margin: 0,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
  });

  qrStyled.append(qrContainer);

  const processedLogo = logoImage ? getProcessedLogoBase64() : null;

  qrStyled.update({
    data: value,
    dotsOptions: {
      type: styleOptions.dots,
      color: color.value,
    },
    cornersSquareOptions: {
      type: styleOptions.cornersSquare,
      color: color.value,
    },
    cornersDotOptions: {
      type: styleOptions.cornersDot,
      color: color.value,
    },
    backgroundOptions: { color: bgColor.value },
  });

  setTimeout(() => {
    const generated = qrContainer.querySelector("canvas");

    if (!generated) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = canvas.width * 0.08;
    const radius = canvas.width * 0.08;
    const qrSize = canvas.width - padding * 2;

    // IMPORTANT
    // évite les dots coupés
    const safe = canvas.width * 0.02;

    ctx.save();

    roundRect(
      ctx,
      padding - safe,
      padding - safe,
      qrSize + safe * 2,
      qrSize + safe * 2,
      radius * 0.35,
    );

    ctx.clip();

    ctx.drawImage(
      generated,
      padding - safe,
      padding - safe,
      qrSize + safe * 2,
      qrSize + safe * 2,
    );

    ctx.restore();

    if (logoImage) {
      const processed = removeWhiteBackground(logoImage);

      drawLogoBorder(ctx, canvas.width);

      drawLogo(ctx, processed, canvas.width);
    }

    qrContainer.remove();
  }, 50);
}

// =======================
// PNG EXPORT
// =======================
document.getElementById("pngBtn").onclick = () => {
  const value = getValue();

  if (!value) return;

  const size = 1000;

  const style = document.getElementById("qrStyle").value;

  const styleOptions = getStyleOptions(style);

  const processedLogo = logoImage ? getProcessedLogoBase64() : null;

  const qr = new QRCodeStyling({
    width: size,
    height: size,
    data: value,
    qrOptions: {
      errorCorrectionLevel: "H",
    },

    dotsOptions: {
      type: styleOptions.dots,
      color: color.value,
    },

    cornersSquareOptions: {
      type: styleOptions.cornersSquare,
      color: color.value,
    },

    cornersDotOptions: {
      type: styleOptions.cornersDot,
      color: color.value,
    },

    backgroundOptions: {
      color: bgColor.value,
    },
  });

  const temp = document.createElement("div");

  qr.append(temp);

  setTimeout(() => {
    const source = temp.querySelector("canvas");

    if (!source) return;

    const finalCanvas = document.createElement("canvas");

    const ctx = finalCanvas.getContext("2d");

    finalCanvas.width = size;
    finalCanvas.height = size;

    const padding = size * 0.08;
    const radius = size * 0.08;
    const qrSize = size - padding * 2;

    // IMPORTANT
    const safe = size * 0.02;

    // BACKGROUND
    ctx.fillStyle = bgColor.value;

    roundRect(ctx, 0, 0, size, size, radius);

    ctx.fill();

    // QR
    ctx.save();

    roundRect(
      ctx,
      padding - safe,
      padding - safe,
      qrSize + safe * 2,
      qrSize + safe * 2,
      radius * 0.35,
    );

    ctx.clip();

    ctx.drawImage(
      source,
      padding - safe,
      padding - safe,
      qrSize + safe * 2,
      qrSize + safe * 2,
    );

    ctx.restore();

    if (logoImage) {
      const processed = removeWhiteBackground(logoImage);

      drawLogoBorder(ctx, size);

      drawLogo(ctx, processed, size);
    }

    const link = document.createElement("a");

    link.download = "qr.png";

    link.href = finalCanvas.toDataURL("image/png");

    link.click();
  }, 50);
};

// =======================
// SVG EXPORT
// =======================
document.getElementById("svgBtn").onclick = () => {
  const value = getValue();

  if (!value) return;

  const size = 1000;

  const style = document.getElementById("qrStyle").value;

  const styleOptions = getStyleOptions(style);

  const processedLogo = logoImage ? getProcessedLogoBase64() : null;

  const qr = new QRCodeStyling({
    width: size,
    height: size,
    type: "svg",
    data: value,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: styleOptions.dots,
      color: color.value,
    },
    cornersSquareOptions: {
      type: styleOptions.cornersSquare,
      color: color.value,
    },
    cornersDotOptions: {
      type: styleOptions.cornersDot,
      color: color.value,
    },
    backgroundOptions: {
      color: bgColor.value,
    },
  });

  const temp = document.createElement("div");

  qr.append(temp);

  setTimeout(() => {
    const originalSvg = temp.querySelector("svg");

    if (!originalSvg) return;

    const padding = size * 0.08;

    const radius = size * 0.08;

    const qrSize = size - padding * 2;

    // =========================
    // FINAL SVG
    // =========================

    const finalSvg = `
    
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${size}"
        height="${size}"
      >

        <!-- BACKGROUND -->

        <rect
          width="${size}"
          height="${size}"
          rx="${radius}"
          fill="${bgColor.value}"
        />

        <!-- QR CLIP -->

        <clipPath id="clipQR">
          <rect
            x="${padding - size * 0.02}"
            y="${padding - size * 0.02}"
            width="${qrSize + size * 0.04}"
            height="${qrSize + size * 0.04}"
            rx="${radius * 0.35}"
          />
        </clipPath>

        ${
          logoImage
            ? `
      <mask id="logoHole">

        <rect
          width="${size}"
          height="${size}"
          fill="white"
        />

        <circle
          cx="${size / 2 + (logoPosX / 100) * size}"
          cy="${size / 2 + (logoPosY / 100) * size}"
          r="${((logoSize / 100) * size + size * 0.045) / 2}"
          fill="black"
        />

      </mask>
    `
            : ""
        }

        <!-- QR -->

        <g
          clip-path="url(#clipQR)"
          ${logoImage ? `mask="url(#logoHole)"` : ""}
        >
          <g
            transform="
              translate(${padding}, ${padding})
              scale(${qrSize / size})
            "
          >
            ${originalSvg.innerHTML}
          </g>
        </g>
          ${
            logoImage
              ? `
                <circle
                  cx="${size / 2 + (logoPosX / 100) * size}"
                  cy="${size / 2 + (logoPosY / 100) * size}"
                  r="${((logoSize / 100) * size + size * 0.045) / 2}"
                  fill="white"
                  stroke="#111"
                  stroke-width="${size * 0.005}"
                />

                <image
                  href="${processedLogo}"
                  x="${size / 2 - ((logoSize / 100) * size) / 2 + (logoPosX / 100) * size}"
                  y="${size / 2 - ((logoSize / 100) * size) / 2 + (logoPosY / 100) * size}"
                  width="${(logoSize / 100) * size}"
                  height="${(logoSize / 100) * size}"
                />
              `
              : ""
          }
      </svg>
    `;

    const blob = new Blob([finalSvg], { type: "image/svg+xml" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "qr.svg";

    a.click();

    URL.revokeObjectURL(url);
  }, 50);
};

// =======================
// UTILS
// =======================
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

updateModeVisibility();
generate();
