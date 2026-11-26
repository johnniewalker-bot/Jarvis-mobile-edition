
document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const input = document.getElementById('msg');
  const send = document.getElementById('send');

  if (!chat || !input || !send) {
    alert('JARVIS error: Chat elements not found!');
    return;
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

    const reply = addMessage('J.A.R.V.I.S: Processing...', 'ai');

    setTimeout(() => {
      reply.textContent =
        'J.A.R.V.I.S: Systems online. How may I assist you, Boss?';
    }, 800);
  }

  send.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
});
const boot = document.getElementById('boot-screen');

if (boot) {
  setTimeout(() => {
    boot.remove();
  }, 4000);
}