# 🌐 AI Networking Assistant — NetBot

An **AI-powered Networking Chatbot** built with Node.js, Express.js, and the **Groq API** using the **LLaMA 3.1-8b-instant** model. NetBot specializes in professional networking, internship guidance, interview preparation, and professional communication tips.

---

## 🚀 Features

- ✅ Real-time AI chat interface
- ✅ AI-generated responses via Groq API (LLaMA 3.1)
- ✅ Internship guidance
- ✅ Interview question suggestions
- ✅ Professional communication tips
- ✅ Typing indicator for better UX
- ✅ Conversation history (multi-turn chat)
- ✅ Sidebar with quick topic shortcuts
- ✅ Responsive design (mobile-friendly)
- ✅ Domain-restricted: only answers networking/career questions

---

## 🛠️ Technologies Used

| Component        | Technology                     |
|------------------|-------------------------------|
| Frontend         | HTML, CSS, JavaScript          |
| Backend          | Node.js, Express.js            |
| AI API           | Groq API (LLaMA 3.1-8b-instant)|
| Hosting          | Render (Cloud Deployment)      |
| Version Control  | GitHub                         |

---

## ⚙️ Model Configuration

| Parameter     | Value | Reason                              |
|---------------|-------|-------------------------------------|
| Temperature   | 0.7   | Balanced creativity and accuracy    |
| Top-p         | 0.9   | Diverse but safe responses          |
| Max Tokens    | 1024  | Comprehensive yet concise answers   |

---

## 🔧 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-networking-assistant.git
cd ai-networking-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key

Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

> 🔑 Get your free API key at [console.groq.com](https://console.groq.com)

### 4. Run Locally
```bash
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## ☁️ Deployment on Render

1. Push your code to GitHub (`.env` must NOT be pushed — it's in `.gitignore`)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variable: `GROQ_API_KEY` = your key
6. Click **Deploy**

---

## 📁 Project Structure

```
ai-networking-assistant/
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Styling & animations
│   └── app.js          # Frontend JavaScript
├── server.js           # Express.js backend + Groq API
├── package.json        # Dependencies
├── render.yaml         # Render deployment config
├── .env                # API keys (NOT in GitHub)
├── .gitignore
└── README.md
```

---

## 🌊 Data Flow

```
User Input → fetch('/chat') → Express Backend → Groq API → LLaMA 3.1 → Response → UI
```

---

## 🎯 Domain Restrictions

NetBot is configured to only answer questions about:
- Professional networking strategies
- Internship guidance
- Interview preparation  
- Professional communication (emails, LinkedIn)
- Mentor outreach
- Career development

Off-topic questions are gracefully redirected back to networking topics.

---

## 📄 License

MIT License — Feel free to use and modify.
