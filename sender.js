const ui = {
  actions: Array.from(document.qureySelectorAll(".send-actions__button")),
  sendFile: document.getElementById("action-send-file"),
  sendImage: document.getElementById("action-send-image"),
  sendClipboard: document.getElementById("action-send-clipboard"),
};
const params = new URLSearchParams(document.location.search);
const peerID = params.get("to");
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

device.on("open", setupConnection);

// helper functions
function setupConnection() {
  const connection = device.connect(peerID);
  console.log("connecting");
  connection.on("open", () => setupButtons(connection));
}

function setupButtons(connection) {
  ui.actions.map((button) => (button.style.filter = "unset"));

  ui.sendFile.addEventListener("change", () =>
    sendFile(connection, ui.sendFile.files),
  );
  ui.sendImage.addEventListener("change", () =>
    sendFile(connection, ui.sendImage.files),
  );
  ui.sendClipboard.addEventListener("click", () => sendClipboard(connection));
}

function sendFile(connection, files) {
  const file = Array.from(files)[0];

  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () =>
    connection.send({ type: "file", name: file.name, data: reader.result });
  reader.onerror = () => alert("Couldn't send this file");
}

function sendClipboard(connection) {
  navigator.clipboard
    .readText()
    .then((text) => connection.send({ type: "text", text }));
}
