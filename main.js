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
  connection.on("data", (message) => readMessage(message, connection));
  connection.on("close", showGhost);
  window.addEventListener("beforeunload", () => sendBye(connection));
}

function handleIncomingConnection(connection) {
  setupButtons(connection);
  connection.on("data", (message) => readMessage(message, connection));
  connection.on("close", showGhost);
  window.addEventListener("beforeunload", () => sendBye(connection));
}

function setupButtons(connection) {
  document.documentElement.style.setProperty("--accent", "#1e66f5");
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

function readMessage(message, connection) {
  switch (message.type) {
    case "file":
      readFile(message);
      break;
    case "text":
      readText(message, connection);
      break;
    case "received":
      showText(DEFAULT_TEXT_MESSAGE);
      break;
    case "bye":
      setTimeout(showGhost, 200);
      break;
  }

  connection.send({ type: "received" });
}

function sendFile(connection, files) {
  const file = Array.from(files)[0];

  if (!file) return;

  showSpinner();

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () =>
    connection.send({ type: "file", name: file.name, data: reader.result });
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

function readText(message, connection) {
  if (message.text.startsWith("http")) {
    sendBye(connection);
    window.location.href = message.text;
  } else {
    showText(message.text);
  }
}

function sendBye(connection) {
  connection.send({ type: "bye" });
}

function showText(text, color) {
  const area = document.createElement("pre");

  area.classList.add("code-area__text");
  area.style.color = color;
  area.textContent = text;

  ui.code.innerHTML = "";
  ui.code.appendChild(area);
}

function showSpinner() {
  ui.code.innerHTML = `
    <div class="single-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-pinwheel-icon lucide-loader-pinwheel"><path d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0"/><path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6"/><path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6"/><circle cx="12" cy="12" r="10"/></svg>
      <p>Uploading</p>
    </div>
  `;
}

function showGhost() {
  ui.code.innerHTML = `
    <div class="single-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ghost-icon lucide-ghost"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
      <p>Device<br>disconnected</p>
    </div>
  `;

  document.documentElement.style.setProperty("--accent", "#e64553");

  ui.actions.map((button) => (button.style.filter = "opacity(0)"));
}
