// UI
const display = document.getElementById("code");
const label = document.getElementById("label");

// constants
const deviceID = crypto.randomUUID();
const device = new Peer(deviceID, {
  host: "peer-server.snlx.net",
  port: 443,
  path: "/",
  config: {
    iceServers: [
      { url: "stun:stun.l.google.com:19302" },
      {
        url: "turn:snlx.net:3478?transport=udp",
        credential: "hunter2",
        username: "qrs",
      },
    ],
  },
});
const link = "https://qrs.snlx.net/send.html?to=" + deviceID;

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
    const area = document.createElement("pre");
    area.style.overflow = "auto";
    area.style.maxWidth = "80vw";
    area.style.maxHeight = "100%";
    area.textContent = data.text;
    display.innerHTML = "";
    display.appendChild(area);
  } else if (data.type === "file") {
    const link = document.createElement("a");
    link.href = data.file;
    link.download = data.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// execution
showCode(link);
device.on("open", () => (label.style.filter = "unset"));
device.on("connection", handleConnection);
