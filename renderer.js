const canvas = document.getElementById("canvas");
const mode = document.getElementById("mode");
const urlInput = document.getElementById("urlInput");
const color = document.getElementById("color");
const bgColor = document.getElementById("bgColor");

let logoSize = 40;
let logoImage = null;
let logoPosX = 0;
let logoPosY = 0;

let qrStyled = null;

let logoBase64 = null;

// =======================
// MODE SWITCH
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
// EVENTS
// =======================
[urlInput, color, bgColor].forEach((el) =>
  el.addEventListener("input", generate),
);

document.getElementById("ssid").addEventListener("input", generate);
document.getElementById("password").addEventListener("input", generate);

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

    return (
      r > 200 &&
      g > 200 &&
      b > 200 &&
      Math.abs(r - g) < 20 &&
      Math.abs(r - b) < 20
    );
  }

  for (let x = 0; x < width; x++) {
    stack.push([x, 0]);
    stack.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    stack.push([0, y]);
    stack.push([width - 1, y]);
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

  ctx.drawImage(img, x, y, width, height);
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

  let url = urlInput.value;
  if (!url) return null;
  if (!url.startsWith("http")) url = "https://" + url;
  return url;
}

// =======================
// GENERATE
// =======================
function generate() {
  const value = getValue();

  const ctx = canvas.getContext("2d");
  canvas.width = 170;
  canvas.height = 170;

  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!value) return;

  if (!qrStyled) {
    qrStyled = new QRCodeStyling({
      width: 170,
      height: 170,
      margin: 2,
      qrOptions: { errorCorrectionLevel: "H" },
    });

    const temp = document.createElement("div");
    qrStyled.append(temp);
  }

  qrStyled.update({
    data: value,
    dotsOptions: { type: "classy-rounded", color: color.value },
    cornersSquareOptions: { type: "extra-rounded", color: color.value },
    cornersDotOptions: { type: "dot", color: color.value },
    backgroundOptions: { color: bgColor.value },
    image: "",
  });

  setTimeout(() => {
    const tempContainer = qrStyled._container;
    if (!tempContainer) return;

    let generated = tempContainer.querySelector("canvas");

    if (!generated) {
      const svg = tempContainer.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          drawLogoSafe(ctx);
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
        return;
      }
    }

    if (!generated) return;

    function drawLogoSafe(ctx) {
      if (!logoImage) return;

      const processed = removeWhiteBackground(logoImage);

      const size = canvas.width;
      const logoPx = (logoSize / 100) * size;

      const x = size / 2 - logoPx / 2 + (logoPosX / 100) * size;
      const y = size / 2 - logoPx / 2 + (logoPosY / 100) * size;

      drawLogo(ctx, processed, size);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);
    drawLogoSafe(ctx);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);

    if (logoImage) {
      const processed = removeWhiteBackground(logoImage);

      const size = canvas.width;
      const logoPx = (logoSize / 100) * size;

      const x = size / 2 - logoPx / 2 + (logoPosX / 100) * size;
      const y = size / 2 - logoPx / 2 + (logoPosY / 100) * size;

      drawLogo(ctx, processed, size);
    }
  }, 10);
}

// =======================
// PNG
// =======================
document.getElementById("pngBtn").onclick = () => {
  const value = getValue();
  if (!value) return;

  const size = 1000;

  const qrHD = new QRCodeStyling({
    width: size,
    height: size,
    margin: 2,
    data: value,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: "classy-rounded",
      color: color.value,
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: color.value,
    },
    cornersDotOptions: {
      type: "dot",
      color: color.value,
    },
    backgroundOptions: {
      color: bgColor.value,
    },
    image: "",
  });

  const temp = document.createElement("div");
  qrHD.append(temp);

  setTimeout(() => {
    let generated = temp.querySelector("canvas");

    if (!generated) {
      const svg = temp.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => drawHD(img);
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
        return;
      }
    }

    if (generated) {
      drawHD(generated);
    }
  }, 50);

  function drawHD(source) {
    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");

    finalCanvas.width = size;
    finalCanvas.height = size;

    ctx.drawImage(source, 0, 0, size, size);

    if (logoImage) {
      const processed = removeWhiteBackground(logoImage);

      const logoPx = (logoSize / 100) * size;
      const x = size / 2 - logoPx / 2 + (logoPosX / 100) * size;
      const y = size / 2 - logoPx / 2 + (logoPosY / 100) * size;

      drawLogo(ctx, processed, size);
    }

    const link = document.createElement("a");
    link.download = "qr-hd.png";
    link.href = finalCanvas.toDataURL("image/png", 1.0);
    link.click();
  }
};

// =======================
// SVG
// =======================
document.getElementById("svgBtn").onclick = () => {
  const value = getValue();
  if (!value) return;

  const size = 1000;

  const qrHD = new QRCodeStyling({
    width: size,
    height: size,
    margin: 2,
    data: value,
    type: "svg",
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: "classy-rounded",
      color: color.value,
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: color.value,
    },
    cornersDotOptions: {
      type: "dot",
      color: color.value,
    },
    backgroundOptions: {
      color: bgColor.value,
    },
    image: "",
    imageOptions: {
      margin: 5,
    },
  });

  const temp = document.createElement("div");
  qrHD.append(temp);

  setTimeout(() => {
    const svg = temp.querySelector("svg");
    if (!svg) return;

    if (logoBase64) {
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image",
      );

      const logoSizePx = size * (logoSize / 100);
      const x = size / 2 - logoSizePx / 2 + (logoPosX / 100) * size;
      const y = size / 2 - logoSizePx / 2 + (logoPosY / 100) * size;

      const cleanLogo = getProcessedLogoBase64();
      image.setAttributeNS(null, "href", cleanLogo);
      image.setAttribute("x", x);
      image.setAttribute("y", y);
      image.setAttribute("width", logoSizePx);
      image.setAttribute("height", logoSizePx);

      svg.appendChild(image);
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-hd.svg";
    a.click();

    URL.revokeObjectURL(url);
  }, 50);
};

// INIT
generate();
