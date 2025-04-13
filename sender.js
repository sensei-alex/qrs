// UI
const sendActions = document.getElementById("send-actions");
const actionSendFile = document.getElementById("action-send-file");
const actionSendImage = document.getElementById("action-send-image");
const actionSendClipboard = document.getElementById("action-send-clipboard");

// constants
const device = new Peer();
const params = new URLSearchParams(document.location.search);
const deviceID = params.get("to");

// helper functions
function connect() {
  const connection = device.connect(deviceID);
  connection.on("open", () => handleConnection(connection));
}

function handleConnection(connection) {
  sendActions.style.filter = "unset";

  connection.send("hi");
}

// execution
device.on("open", connect);
