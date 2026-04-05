document.addEventListener("DOMContentLoaded", () => {

  const inputBox = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const actionBtn = document.getElementById("actionBtn");

  actionBtn.addEventListener("click", () => {
    if (window.pendingAction === "youtube") {
      window.open("https://www.youtube.com", "_blank");
    }

    if (window.pendingAction === "google") {
      window.open("https://www.google.com", "_blank");
    }
  });

  let recognition;
  let isListening = false;

  // 🎯 Add message to chat
  function addMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.classList.add("message");

    if (sender === "user") {
      msg.classList.add("user-message");
      msg.innerText = "User: " + text;
    } else {
      msg.classList.add("bot-message");
      msg.innerText = "Bidu: " + text;
    }

    chatBox.appendChild(msg);

    // auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Initialize voice recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;   // 🔥 CHANGE
    recognition.interimResults = true; // 🔥 CHANGE

    recognition.onstart = () => {
      console.log("🎤 Listening...");
    };

    recognition.onspeechstart = () => {
      console.log("🗣 Speech detected");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      transcript = transcript.trim();

      if (!transcript) return;

      console.log("Mic Output:", transcript);

      inputBox.value = transcript;

      // 🔥 only final result pe trigger
      if (event.results[event.results.length - 1].isFinal) {
        captureInput(true);
      }
    };

    recognition.onend = () => {
      console.log("Stopped");
    };

    recognition.onerror = (event) => {
      console.log("Mic Error:", event.error);

      if (event.error === "no-speech") {
        console.log("⚠️ kuch nahi bola");
      }
    };
  };

  initSpeechRecognition();

  // Auto-height for textarea
  inputBox.addEventListener("input", () => {
    inputBox.style.height = "auto";
    inputBox.style.height = inputBox.scrollHeight + "px";
  });

  // Wave visualization
  let stream;
  let isMicOn = false;
  let audioContext;
  let analyser;
  let dataArray;

  async function startWave() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      isMicOn = true;

      animateWave();
    } catch (error) {
      console.log("Mic access denied:", error);
    }
  }

  function stopMic() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (audioContext) {
      audioContext.close();
    }

    isMicOn = false;

    // wave reset
    document.querySelectorAll(".wave span").forEach(bar => {
      bar.style.height = "5px";
    });
  }

  function animateWave() {
    if (!isMicOn) return;

    requestAnimationFrame(animateWave);

    analyser.getByteFrequencyData(dataArray);

    const bars = document.querySelectorAll(".wave span");

    bars.forEach((bar, i) => {
      let value = dataArray[i];

      // threshold
      if (value < 20) value = 0;

      let height = (value / 255) * 35;

      bar.style.height = height + "px";
    });
  }



  // 🎤 button
  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
        isListening = true;

        startWave();

        setTimeout(() => {
          if (isListening) {
            recognition.stop(); // 🔥 force end for mobile
          }
        }, 4000);

        console.log("🎤 Mic ON");
      } catch (e) {
        console.log("Mic already running");
      }
    } else {
      recognition.stop();
      isListening = false;

      stopMic();

      console.log("🛑 Mic OFF");
    }
  });

  function sendMessage() {
    captureInput();
  }

  function scrollToBottom() {
    const chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function triggerPulse() {
    const frame = document.querySelector(".ai-frame");

    frame.classList.add("pulse");

    setTimeout(() => {
      frame.classList.remove("pulse");
    }, 800);
  }

  // 🧠 UNDERSTANDING LAYER
  function normalizeText(text) {
    return text.toLowerCase().trim();
  }

  function detectIntent(text) {
    if (text.includes("hello") || text.includes("hi")) {
      return "greeting";
    }

    if (text.includes("time") || text.includes("date")) {
      return "question";
    }

    if (
      text.includes("open") ||
      text.includes("search") ||
      text.includes("go to")
    ) {
      return "command";
    }

    return "unknown";
  }

  function extractEntity(text) {
    if (text.includes("youtube")) return "youtube";
    if (text.includes("google")) return "google";

    if (text.includes("time")) return "time";
    if (text.includes("date")) return "date";

    return null;
  }

  function understand(text) {
    const cleanText = normalizeText(text);

    return {
      intent: detectIntent(cleanText),
      entity: extractEntity(cleanText),
      raw: text
    };
  }

  function speak(text) {
    // 🔇 mic band karo
    if (isListening) {
      recognition.stop();
    }

    const speech = new SpeechSynthesisUtterance(text);

    speech.onend = () => {
      // 🎤 wapas mic ON
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Mic restart issue");
        }
      }
    };

    window.speechSynthesis.speak(speech);
  }

  // 🎯 MAIN FUNCTION (Input Handler)
  function captureInput(isVoice = false) {
    let text = inputBox.value;

    // 1. Trim
    text = text.trim();

    // 2. Validate
    if (text === "") return;

    console.log("CAPTURE CALLED:", text);
    console.log("Clean Input:", text);

    // 3. Forward to next layer (for now just log)
    processInput(text, isVoice);

    // 4. Clear input
    inputBox.value = "";
  }

  // 🚀 TEMP CONTROLLER (next layer simulation)
  function getAIResponse(userText) {
    const data = understand(userText);

    const intent = data.intent;
    const entity = data.entity;

    // 🟢 GREETING
    if (intent === "greeting") {
      return "Hello 👋 I’m Bidu AI";
    }

    // 🔵 QUESTION
    if (intent === "question") {
      if (entity === "time") {
        return "Time: " + new Date().toLocaleTimeString();
      }

      if (entity === "date") {
        return "Date: " + new Date().toLocaleDateString();
      }
    }

    // 🟡 COMMAND
    if (intent === "command") {
      if (entity === "youtube") {
        window.pendingAction = "youtube";
        actionBtn.click(); // ✅ real click trigger
        return "Opening YouTube...";
      }

      if (entity === "google") {
        window.pendingAction = "google";
        actionBtn.click();
        return "Opening Google...";
      }
    }

    // 🔴 DEFAULT
    return "I’m still learning... try something else 🤖";
  }

  function processInput(text, isVoice = false) {
    console.log("→ Sending to Understanding Layer:", text);

    const data = understand(text);
    console.log("UNDERSTANDING:", data);

    // USER MESSAGE
    addMessage(text, "user");

    // AI RESPONSE
    setTimeout(() => {
      const response = getAIResponse(text);
      addMessage(response, "bot");

      triggerPulse();

      if (isVoice) {
        speak(response);
      }
    }, 500);

    scrollToBottom();
  }

  // 🖱 Button click
  sendBtn.addEventListener("click", () => captureInput(false));

  // ⌨ Enter press
  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      captureInput();
    }
  });

});