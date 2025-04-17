// UI
const sendActions = document.getElementById("send-actions");
const actionSendFile = document.getElementById("action-send-file");
const actionSendImage = document.getElementById("action-send-image");
const actionSendClipboard = document.getElementById("action-send-clipboard");

// constants
const device = new Peer(undefined, {
  host: "peer-server.snlx.net",
  port: 443,
  debug: 3,
  path: "/",
  config: {
    iceServers: [
      { url: "stun:stun.l.google.com:19302" },
      { url: "turn:snlx.net:3478", credential: "hunter2", username: "qrs" },
    ],
  },
});
const params = new URLSearchParams(document.location.search);
const deviceID = params.get("to");

// helper functions
function connect() {
  const connection = device.connect(deviceID);
  console.log("connecting");
  connection.on("open", () => handleConnection(connection));
}

function handleConnection(connection) {
  console.log("connected");
  sendActions.style.filter = "unset";

  actionSendFile.addEventListener("change", () => sendFile(connection));
  actionSendClipboard.addEventListener("click", () =>
    sendClipboard(connection),
  );
}

function sendFile(connection) {
  const file = Array.from(actionSendFile.files)[0];

  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => connection.send({ type: "file", file: reader.result });
  reader.onerror = alert("Couldn't send this file");
}

function sendClipboard(connection) {
  navigator.clipboard
    .readText()
    .then((text) => connection.send({ type: "text", text }));
}

// execution
device.on("open", connect);
