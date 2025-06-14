const DEFAULT_TEXT_MESSAGE = "Click one of the buttons to send";
const BYE_MESSAGE = { type: "bye" };

const ui = {
  code: document.getElementById("code"),
  actions: Array.from(document.querySelectorAll(".send-actions__button")),
  sendFile: document.getElementById("action-send-file"),
  sendImage: document.getElementById("action-send-image"),
  sendClipboard: document.getElementById("action-send-clipboard"),
};

const params = new URLSearchParams(document.location.search);

const myId = crypto.randomUUID();
const peerId = params.get("to");

if (!peerId) {
  showCode("https://qrs.snlx.net/?to=" + myId);
}

main(myId, peerId);

async function main(myId, peerId) {
  const { sendData, connect } = await setupNode({
    id: myId,
    onConnect: setupButtons,
    onDisconnect: showGhost,
    onData: (message) => readMessage(message, sendData),
  });

  if (!peerId) {
    return;
  }

  connect(peerId);
  window.addEventListener("beforeunload", () => sendData(BYE_MESSAGE));
}

function setupButtons(sendData) {
  document.documentElement.style.setProperty("--accent", "#1e66f5");
  ui.actions.map((button) => (button.style.filter = "unset"));

  ui.sendFile.addEventListener("change", () =>
    sendFile(sendData, ui.sendFile.files),
  );
  ui.sendImage.addEventListener("change", () =>
    sendFile(sendData, ui.sendImage.files),
  );
  ui.sendClipboard.addEventListener("click", () => sendClipboard(sendData));

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

function readMessage(message, sendMessage) {
  console.log("READ", message);

  switch (message.type) {
    case "file":
      readFile(message);
      break;
    case "text":
      showText(message);
      break;
    case "received":
      showText(DEFAULT_TEXT_MESSAGE);
      return;
    case "bye":
      setTimeout(showGhost, 200);
      break;
  }

  sendMessage({ type: "received" });
}

function sendFile(sendData, files) {
  const file = Array.from(files)[0];

  if (!file) return;

  showSpinner();

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () =>
    sendData({ type: "file", name: file.name, data: reader.result });
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

function sendClipboard(sendData) {
  navigator.clipboard
    .readText()
    .then((text) => sendData({ type: "text", text }));
}

function readText(message, connection) {
  if (message.text.startsWith("http")) {
    sendBye(connection);
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
