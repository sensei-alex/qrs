// UI
const display = document.getElementById("code");
const label = document.getElementById("label");

// constants
const deviceID = crypto.randomUUID();
const device = new Peer(deviceID);
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

function handleConnection(connection) {
  console.log("Connected!");

  connection.on("data", processPacket);
}

function processPacket(data) {
  console.log(data);
}

// execution
showCode(link);
device.on("open", () => (label.style.filter = "unset"));
device.on("connection", handleConnection);
