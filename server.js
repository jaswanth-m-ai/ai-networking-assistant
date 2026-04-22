require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// System prompt for the Networking Coach
const SYSTEM_PROMPT = `You are NetBot, an expert AI Networking Coach and Career Mentor specializing exclusively in professional networking and career development. 

Your areas of expertise include:
- Professional networking strategies (LinkedIn, industry events, online communities)
- Internship guidance and how to find, apply, and succeed in internships
- Interview preparation for networking-related roles and general tech/business roles
- Professional communication tips (emails, follow-ups, elevator pitches)
- Resume and LinkedIn profile optimization for networking
- Building and maintaining professional relationships
- Career development roadmaps and advice
- Networking etiquette and best practices
- How to approach mentors, recruiters, and industry professionals

IMPORTANT RULES:
1. ONLY answer questions related to professional networking, career development, internships, and professional communication.
2. If asked about unrelated topics (math problems, general knowledge, coding unrelated to career, etc.), politely redirect: "I specialize in professional networking and career development. Let me help you with networking strategies, internship guidance, or interview preparation instead!"
3. Never fabricate statistics, company names, or specific job listings. Only provide general guidance.
4. Be encouraging, professional, and actionable in your responses.
5. Keep responses concise but comprehensive — use bullet points and structured formatting where helpful.
6. Always end with a follow-up question or call to action to keep the conversation going.

You are here to empower users to build meaningful professional connections and advance their careers.`;

// Chat API endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string.' });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // Add conversation history (last 10 messages to manage context window)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg) => {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // Call Groq API with LLaMA 3.1 model
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024,
      stream: false,
    });

    const reply = chatCompletion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error('No response generated from the AI model.');
    }

    res.json({
      success: true,
      message: reply,
      model: 'llama-3.1-8b-instant',
      usage: chatCompletion.usage,
    });
  } catch (error) {
    console.error('Error calling Groq API:', error.message);

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please check your Groq API key.' });
    } else if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    } else {
      return res.status(500).json({ error: 'An error occurred while generating the response. Please try again.' });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    model: 'llama-3.1-8b-instant',
    api: 'Groq API',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 AI Networking Assistant running at http://localhost:${PORT}`);
  console.log(`📡 Model: llama-3.1-8b-instant (Groq API)`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health\n`);
});
