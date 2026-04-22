/**
 * NetBot — AI Networking Assistant
 * Frontend Application Logic
 *
 * Flow:
 * User types message → sendMessage() → fetch('/chat') →
 * Backend calls Groq API → Response displayed in chat UI
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  conversationHistory: [],    // Stores {role, content} pairs
  isLoading: false,           // Prevents duplicate requests
  messageCount: 0,            // For unique IDs
};

// ============================================
// DOM ELEMENTS
// ============================================
const userInput     = document.getElementById('userInput');
const sendBtn       = document.getElementById('sendBtn');
const chatWindow    = document.getElementById('chatWindow');
const messagesContainer = document.getElementById('messagesContainer');
const typingIndicator   = document.getElementById('typingIndicator');
const welcomeHero   = document.getElementById('welcomeHero');
const charCount     = document.getElementById('charCount');
const sidebar       = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  setupInputListeners();
  userInput.focus();
});

// ============================================
// BACKGROUND PARTICLES
// ============================================
function initParticles() {
  const container = document.getElementById('bgParticles');
  const colors = [
    'hsla(225, 85%, 60%, 0.4)',
    'hsla(270, 80%, 65%, 0.3)',
    'hsla(200, 70%, 55%, 0.25)',
    'hsla(240, 80%, 70%, 0.2)',
  ];

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 15;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;

    container.appendChild(particle);
  }
}

// ============================================
// INPUT SETUP
// ============================================
function setupInputListeners() {
  // Auto-resize textarea
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 140) + 'px';
    updateCharCount();
  });

  // Send on Enter (Shift+Enter for newline)
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function updateCharCount() {
  const len = userInput.value.length;
  const max = 1000;
  charCount.textContent = `${len}/${max}`;
  charCount.className = 'char-count';
  if (len > 900) charCount.classList.add('danger');
  else if (len > 750) charCount.classList.add('warning');
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendMessage() {
  const message = userInput.value.trim();

  if (!message || state.isLoading) return;
  if (message.length > 1000) {
    showToast('Message is too long. Please keep it under 1000 characters.');
    return;
  }

  // Clear input and reset height
  userInput.value = '';
  userInput.style.height = 'auto';
  updateCharCount();

  // Hide welcome hero on first message
  if (welcomeHero && welcomeHero.style.display !== 'none') {
    welcomeHero.style.opacity = '0';
    welcomeHero.style.transform = 'scale(0.97)';
    welcomeHero.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      welcomeHero.style.display = 'none';
    }, 300);
  }

  // Add user message to UI
  appendMessage('user', message);

  // Add to conversation history
  state.conversationHistory.push({ role: 'user', content: message });

  // Set loading state
  setLoading(true);

  try {
    // Send request to backend
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: state.conversationHistory.slice(0, -1), // exclude current message
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    if (data.success && data.message) {
      // Add bot reply to UI
      appendMessage('bot', data.message);

      // Add to conversation history
      state.conversationHistory.push({ role: 'assistant', content: data.message });
    } else {
      throw new Error('Unexpected response format from server.');
    }
  } catch (error) {
    console.error('Chat error:', error.message);

    const errorMsg = error.message.includes('Failed to fetch')
      ? 'Cannot connect to the server. Please make sure the backend is running.'
      : error.message;

    appendMessage('bot', errorMsg, true);
  } finally {
    setLoading(false);
  }
}

// ============================================
// QUICK MESSAGE (from sidebar)
// ============================================
function sendQuickMessage(msg) {
  if (state.isLoading) return;
  userInput.value = msg;
  updateCharCount();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }

  sendMessage();
}

// ============================================
// APPEND MESSAGE TO UI
// ============================================
function appendMessage(role, content, isError = false) {
  state.messageCount++;
  const msgId = `msg-${state.messageCount}`;
  const time = getCurrentTime();

  const row = document.createElement('div');
  row.className = `message-row ${role}`;
  row.id = msgId;

  if (role === 'bot') {
    row.innerHTML = `
      <div class="bot-avatar" aria-label="NetBot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          <path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M8.46 8.46a5 5 0 0 0 0 7.07"/>
        </svg>
      </div>
      <div class="message-content">
        <div class="message-bubble ${isError ? 'error' : ''}">${isError ? escapeHtml(content) : formatBotMessage(content)}</div>
        <span class="message-time">NetBot · ${time}</span>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">${escapeHtml(content)}</div>
        <span class="message-time">You · ${time}</span>
      </div>
      <div class="user-avatar" aria-label="You">U</div>
    `;
  }

  messagesContainer.appendChild(row);
  scrollToBottom();
}

// ============================================
// MESSAGE FORMATTING
// ============================================
function formatBotMessage(text) {
  // Escape HTML first
  let html = escapeHtml(text);

  // Convert markdown-like formatting
  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Unordered lists
  html = html.replace(/^[\-\*•] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(\n)?)+/g, (match) => `<ul>${match}</ul>`);

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Line breaks to paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.startsWith('<ul>') || para.startsWith('<ol>') || para.startsWith('<li>')) return para;
    // Replace single newlines with <br>
    para = para.replace(/\n/g, '<br>');
    return `<p>${para}</p>`;
  }).filter(Boolean).join('');

  return html;
}

// Safe HTML escape
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ============================================
// LOADING STATE
// ============================================
function setLoading(loading) {
  state.isLoading = loading;
  sendBtn.disabled = loading;
  userInput.disabled = loading;
  typingIndicator.style.display = loading ? 'flex' : 'none';

  if (loading) {
    scrollToBottom();
  } else {
    userInput.focus();
  }
}

// ============================================
// CLEAR CHAT
// ============================================
function clearChat() {
  // Reset history
  state.conversationHistory = [];
  state.messageCount = 0;

  // Clear messages
  messagesContainer.innerHTML = '';

  // Show welcome hero again
  if (welcomeHero) {
    welcomeHero.style.display = 'flex';
    welcomeHero.style.opacity = '1';
    welcomeHero.style.transform = 'none';
    welcomeHero.style.transition = 'none';
  }

  // Ensure typing is hidden
  typingIndicator.style.display = 'none';

  userInput.focus();
  scrollToBottom();
}

// ============================================
// SIDEBAR TOGGLE
// ============================================
function toggleSidebar() {
  const isOpen = sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('visible', isOpen);
}

document.getElementById('sidebarCloseBtn').addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
});

// ============================================
// HELPERS
// ============================================
function scrollToBottom() {
  requestAnimationFrame(() => {
    chatWindow.scrollTo({
      top: chatWindow.scrollHeight,
      behavior: 'smooth',
    });
  });
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showToast(message) {
  // Simple alert fallback (can be improved with a toast component)
  alert(message);
}
