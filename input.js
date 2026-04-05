document.addEventListener("DOMContentLoaded", () => {

  const inputBox = document.getElementById("inputBox");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");

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
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("🎤 Listening...");
    };

    recognition.onspeechstart = () => {
      console.log("🗣 Speech detected");
    };

    recognition.onresult = (event) => {
      console.log("RESULT EVENT TRIGGERED");

      const transcript = event.results[0][0].transcript;
      console.log("Mic Output:", transcript);

      inputBox.value = transcript;
      captureInput(true);
    };

    recognition.onend = () => {
      console.log("Stopped");

      if (isListening) {
        console.log("Restarting mic...");
        try {
          recognition.start();
        } catch (e) {
          console.log("Already started");
        }
      }
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

  function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;

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
    const text = userText.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello 👋 I’m Bidu AI!";
    }

    if (text.includes("time")) {
      return "Time: " + new Date().toLocaleTimeString();
    }

    if (text.includes("date")) {
      return "Date: " + new Date().toLocaleDateString();
    }

    if (text.includes("how are you")) {
      return "I’m doing great 😄 What about you?";
    }

    return "I’m still learning... try something else 🤖";
  }

  function processInput(text, isVoice = false) {
    console.log("→ Sending to Understanding Layer:", text);

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