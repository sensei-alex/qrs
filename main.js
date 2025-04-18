const DEFAULT_TEXT_MESSAGE = "Click one of the buttons to send";

const ui = {
  code: document.getElementById("code"),
  actions: Array.from(document.querySelectorAll(".send-actions__button")),
  sendFile: document.getElementById("action-send-file"),
  sendImage: document.getElementById("action-send-image"),
  sendClipboard: document.getElementById("action-send-clipboard"),
};
const params = new URLSearchParams(document.location.search);
const deviceID = crypto.randomUUID();
const peerID = params.get("to");
const peerLink = "https://qrs.snlx.net/experimental?to=" + deviceID;
const device = new Peer(deviceID, {
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

device.on("open", connectToPeer);
device.on("connection", handleIncomingConnection);
if (!peerID) {
  showCode(peerLink);
}

// helper functions
function connectToPeer() {
  const connection = device.connect(peerID);
  console.log("connecting");
  connection.on("open", () => setupButtons(connection));
  connection.on("data", readMessage);
}

function handleIncomingConnection(connection) {
  setupButtons(connection);
  connection.on("data", readMessage);
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

  showText(DEFAULT_TEXT_MESSAGE);
}

function showCode(link) {
  ui.code.innerHTML = "";
  new QRCode(ui.code, {
    text: link,
    width: 1024,
    height: 1024,
    colorDark: "#4c4f69",
    colorLight: "#eff1f5",
  });
}

function readMessage(message) {
  switch (message.type) {
    case "file":
      readFile(message);
      break;
    case "text":
      readText(message);
      break;
  }
}

function sendFile(connection, files) {
  const file = Array.from(files)[0];

  if (!file) return;

  showText("Uploading...", "var(--accent)");

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () =>
    connection.send({ type: "file", name: file.name, data: reader.result }); // todo listen for the end-transmission event
  reader.onerror = () => alert("Couldn't send this file");
}

function readFile(message) {
  const link = document.createElement("a");
  link.href = message.data;
  link.download = message.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function sendClipboard(connection) {
  navigator.clipboard
    .readText()
    .then((text) => connection.send({ type: "text", text }));
}

function readText(message) {
  if (message.text.startsWith("http")) {
    window.location.href = message.text;
  } else {
    showText(message.text);
  }
}

function showText(text, color) {
  const area = document.createElement("pre");

  area.classList.add("code-area__text");
  area.style.color = color;
  area.textContent = text;

  ui.code.innerHTML = "";
  ui.code.appendChild(area);
}
