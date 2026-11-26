
document.addEventListener('DOMContentLoaded', () => {

  // 1. API KEY
  let API_KEY = localStorage.getItem('jarvis_key');

  if (!API_KEY) {
    API_KEY = prompt('Enter your Gemini API Key:');
    if (API_KEY) {
      localStorage.setItem('jarvis_key', API_KEY);
    }
  }

  const chat = document.getElementById('chat');
  const input = document.getElementById('msg');
  const send = document.getElementById('send');
  const micBtn =
    document.getElementById('mic') ||
    document.getElementById('mic-btn');
  const boot = document.getElementById('boot-screen');

  // 2. BOOT SCREEN
  if (boot) {
    setTimeout(() => boot.remove(), 4000);
  }

  if (!chat || !input || !send) {
    alert('JARVIS error: Chat elements not found!');
    return;
  }

  // 3. CHAT MESSAGE
  function add(text, who) {
    const message = document.createElement('div');
    message.className = 'msg ' + who;
    message.textContent = text;
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
    return message;
  }

  // 4. GEMINI AI BRAIN
  const MODELS = [
    'gemini-3.8-flash'
  ];

  async function callGemini(promptText) {
    if (!API_KEY) {
      throw new Error('Gemini API key is missing.');
    }

    let lastError;

    for (const model of MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: promptText }]
              }]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          lastError = new Error(
            data.error?.message || 'Gemini API error'
          );

          if (
            response.status === 404 ||
            response.status === 429 ||
            response.status >= 500
          ) {
            continue;
          }

          throw lastError;
        }

        const answer =
          data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || '')
            .join('');

        if (!answer) {
          throw new Error('Gemini returned an empty response.');
        }

        return answer;

      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('All Gemini models failed.');
  }

  // 5. TEXT TO SPEECH
  let voices = [];

  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }

  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;

  function speak(text) {
    if (!('speechSynthesis' in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.85;

    const voice = voices.find(v =>
      v.lang.startsWith('en')
    );

    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
  }

  // 6. ASK JARVIS
  async function askGemini(promptText) {
    const reply = add(
      'J.A.R.V.I.S: Thinking...',
      'ai'
    );

    try {
      const answer = await callGemini(promptText);

      reply.textContent = 'J.A.R.V.I.S: ' + answer;
      speak(answer);

    } catch (error) {
      reply.textContent =
        'J.A.R.V.I.S ERROR: ' + error.message;
    }
  }

  // 7. SEND TEXT MESSAGE
  function sendMessage() {
    const text = input.value.trim();

    if (!text) return;

    add('YOU: ' + text, 'user');
    input.value = '';

    askGemini(text);
  }

  send.addEventListener('click', sendMessage);

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // 8. SPEECH RECOGNITION
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (micBtn && SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      try {
        recognition.start();
        micBtn.textContent = '🔴';
      } catch (error) {
        console.log(error);
      }
    });

    recognition.onresult = event => {
      const spokenText =
        event.results[0][0].transcript;

      add('YOU: ' + spokenText, 'user');
      askGemini(spokenText);
    };

    recognition.onend = () => {
      micBtn.textContent = '🎙️';
    };

    recognition.onerror = event => {
      micBtn.textContent = '🎙️';
      add(
        'J.A.R.V.I.S: Microphone error - ' + event.error,
        'ai'
      );
    };

  } else if (micBtn) {
    micBtn.addEventListener('click', () => {
      alert('Voice recognition is not supported. Try Chrome.');
    });
  }

});
