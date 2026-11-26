
document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const input = document.getElementById('msg');
  const send = document.getElementById('send');
  const mic = document.getElementById('mic');

  const boot = document.getElementById('boot-screen');

  if (boot) {
    setTimeout(() => boot.remove(), 4000);
  }

  function addMessage(text, who) {
    const message = document.createElement('div');
    message.className = 'msg ' + who;
    message.textContent = text;
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
    return message;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('YOU: ' + text, 'user');
    input.value = '';

    const reply = addMessage(
      'J.A.R.V.I.S: Processing...',
      'ai'
    );

    setTimeout(() => {
      reply.textContent =
        'J.A.R.V.I.S: Systems online. How may I assist you, Boss?';
    }, 800);
  }

  send.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendMessage();
  });

  // VOICE RECOGNITION
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    mic.addEventListener('click', () => {
      alert('Voice recognition is not supported in this browser. Try Chrome.');
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  mic.addEventListener('click', () => {
    try {
      recognition.start();
      mic.textContent = '🔴';
    } catch (error) {
      console.log('Microphone is already active.');
    }
  });

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.onend = () => {
    mic.textContent = '🎙️';
  };

  recognition.onerror = (event) => {
    mic.textContent = '🎙️';
    alert('Microphone error: ' + event.error);
  };
});
