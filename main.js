// UI
const sendActions = document.getElementById("send-actions");
const actionSendFile = document.getElementById("action-send-file");
const actionSendImage = document.getElementById("action-send-image");
const actionSendClipboard = document.getElementById("action-send-clipboard");

const display = document.getElementById("code");
const label = document.getElementById("label");

// devices
const myID = crypto.randomUUID();
const me = createDevice(myID);
const { peerID } = parseParams();

if (!peerID) {
  createCode(myID);
}

me.on("open", () => {
  if (!peerID) {
    return;
  }

  const peer = me.connect(peerID);
  peer.on("open", setupActions);
  peer.on("close", () => alert("disconnected"));
});

me.on("connection", (peer) => {
  console.log('connected')
  peer.on("data", () => processPacket(peer));
});

function setupActions(connection) {
  Array.from(document.querySelectorAll(".send-actions__button")).map(
    (button) => (button.style.filter = "unset"),
  );

  actionSendFile.addEventListener("change", () =>
    sendFile(connection, actionSendFile.files),
  );
  actionSendImage.addEventListener("change", () =>
    sendFile(connection, actionSendImage.files),
  );
  actionSendClipboard.addEventListener("click", () =>
    sendClipboard(connection),
  );
}

// helper functions
function createDevice(id) {
  return new Peer(id, {
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
}

function createCode(id) {
  display.innerHTML = "";

  new QRCode(display, {
    text: "https://qrs.snlx.net/experimental/experimental.html?connect=" + id,
    width: 1024,
    height: 1024,
    colorDark: "#4c4f69",
    colorLight: "#eff1f5",
  });
}

function parseParams() {
  const params = new URLSearchParams(document.location.search);

  return { peerID: params.get("connect") };
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
    link.href = data.data;
    link.download = data.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function handleConnection(connection) {
  console.log("connected");
  sendActions.style.filter = "unset";

  actionSendFile.addEventListener("change", () =>
    sendFile(connection, actionSendFile.files),
  );
  actionSendImage.addEventListener("change", () =>
    sendFile(connection, actionSendImage.files),
  );
  actionSendClipboard.addEventListener("click", () =>
    sendClipboard(connection),
  );
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
