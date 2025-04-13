// UI
const display = document.getElementById("code");

// constants
const deviceID = crypto.randomUUID();
const link = "https://qrs.snlx.net/send?to=" + deviceID;

// helper functions
function showCode(link) {
  display.innerHTML = "";
  new QRCode(display, {
    text: link,
    width: 1024,
    height: 1024,
    colorDark: "#4c4f69",
    colorLight: "#eff1f5",
  });
}

// execution
showCode(link);
