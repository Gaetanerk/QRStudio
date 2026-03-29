const { contextBridge } = require("electron");
const QRCode = require("qrcode");

contextBridge.exposeInMainWorld("api", {
  generateQR: (canvas, value, options) => {
    QRCode.toCanvas(canvas, value, options);
  },

  generateSVG: (value) => {
    return QRCode.toString(value, { type: "svg" });
  }
});