
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
    throw new Error('API key missing. Refresh and enter your key.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        }),
        signal: controller.signal
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || 'API error: ' + response.status
      );
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('');

    if (!answer) {
      throw new Error('Gemini returned no text. Check API response.');
    }

    return answer;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Check your internet.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function askGemini(promptText) {
  const reply = add('J.A.R.V.I.S: Thinking...', 'ai');

  try {
    const answer = await callGemini(promptText);
    reply.textContent = 'J.A.R.V.I.S: ' + answer;
    speak(answer);

  } catch (error) {
    reply.textContent = 'J.A.R.V.I.S ERROR: ' + error.message;
    console.error('Gemini error:', error);
  }
}

