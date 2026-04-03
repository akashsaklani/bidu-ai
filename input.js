document.addEventListener("DOMContentLoaded", () => {

  const inputBox = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");

  let isListening = false;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    isListening = true;
    console.log("🎤 Listening...");
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    console.log("Voice:", text);

    document.getElementById("inputBox").value = text;
    sendMessage();
  };

  recognition.onerror = (event) => {
    console.log("Mic Error:", event.error);

    if (event.error === "no-speech") {
      console.log("⚠️ Retry...");
    }
  };

  recognition.onend = () => {
    isListening = false;
    console.log("Stopped");
  };

  document.getElementById("micBtn").addEventListener("click", () => {
    if (!isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  });

  function sendMessage() {
    captureInput();
  }

  // 🎯 MAIN FUNCTION (Input Handler)
  function captureInput() {
    let text = inputBox.value;

    // 1. Trim
    text = text.trim();

    // 2. Validate
    if (text === "") return;

    console.log("Clean Input:", text);

    // 3. Forward to next layer (for now just log)
    processInput(text);

    // 4. Clear input
    inputBox.value = "";
  }

  // 🚀 TEMP CONTROLLER (next layer simulation)
  function processInput(text) {
    console.log("→ Sending to Understanding Layer:", text);

    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.innerText = "User: " + text;
    msg.style.background = "#2563eb";
    msg.style.padding = "8px";
    msg.style.margin = "5px";
    msg.style.borderRadius = "8px";

    chatBox.appendChild(msg);
  }

  // 🖱 Button click
  sendBtn.addEventListener("click", captureInput);

  // ⌨ Enter press
  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      captureInput();
    }
  });

});