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
  if (data.type === "text" && data.text.startsWith("http")) {
    window.location.href = data.text;
  } else if (data.type === "text") {
    const area = document.createElement("textarea");
    area.textContent = data.text;
    display.innerHTML = "";
    display.appendChild(area);
  }
}

// execution
showCode(link);
device.on("open", () => (label.style.filter = "unset"));
device.on("connection", handleConnection);
