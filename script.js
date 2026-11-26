
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

async function askGemini(promptText) {
  const reply = add('J.A.R.V.I.S: Thinking...', 'ai');

  const delays = [2000, 4000, 8000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const answer = await callGemini(promptText);

      reply.textContent = 'J.A.R.V.I.S: ' + answer;
      speak(answer);
      return;

    } catch (error) {
      const temporary =
        /high demand|UNAVAILABLE|503|overloaded/i.test(error.message);

      if (!temporary || attempt === delays.length) {
        reply.textContent =
          'J.A.R.V.I.S ERROR: ' + error.message;
        return;
      }

      reply.textContent =
        'J.A.R.V.I.S: Servers busy. Retrying...';

      await new Promise(resolve =>
        setTimeout(resolve, delays[attempt])
      );
    }
  }
}
