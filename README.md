# 🚀 OrganizationChatApp  
### Real-Time Professional Chat & AI Meeting Platform  

A secure, organization-restricted real-time chat and meeting platform built using the MERN stack with WebSocket.io, ZEGO Cloud integration, and Groq LLM for AI-powered meeting summarization.

This platform allows only verified organizational email users (e.g., `@slrtce.in`) to register, ensuring professional-only communication and reduced spam traffic.

---

## 🧠 Features

- 🔐 JWT Authentication with bcrypt password hashing
- 🏢 Organizational email restriction (`ALLOWED_DOMAINS`)
- 💬 Real-time one-to-one chat using Socket.io
- 😀 Emoji-supported chat interface
- 🛢 MongoDB persistent message storage
- 🎥 ZEGO Cloud meeting/video integration
- 🤖 AI meeting summarization using Groq (LLaMA 3-70B-8192)
- 📊 Structured meeting report generation
- 🌍 Multilingual-ready architecture
- 🛡 Secure environment variable configuration

---

## 🛠 Tech Stack

### Frontend
- ReactJS
- Tailwind CSS
- Axios
- React Router DOM
- Context API
- Vite

### Backend
- NodeJS
- ExpressJS
- WebSocket.io
- JWT (jsonwebtoken)
- bcrypt
- Mongoose

### Database
- MongoDB (Local / Compass)

### AI & External Services
- Groq API (LLaMA 3-70B-8192)
- ZEGO Cloud SDK

---

## 📂 Project Structure
OrganizationChatApp
│
├── backend
│ ├── controllers
│ ├── middleware
│ ├── models
│ ├── routes
│ ├── socket
│ ├── db
│ └── server.js
│
├── frontend
│ ├── src
│ ├── components
│ ├── context
│ ├── pages
│ ├── hooks
│ └── main.jsx
│
└── README.md


---

# ⚙️ Local Setup Guide (Step-by-Step)

Follow these instructions carefully.

---

## ✅ 1. Prerequisites

Install:

- Node.js (v16+ recommended)
- MongoDB (Local installation)
- Git
- VS Code (or any code editor)

Check installation:

```bash
node -v
npm -v
✅ 2. Clone the Repository
git clone https://github.com/smritii73/OrganizationChatApp.git
cd OrganizationChatApp
✅ 3. MongoDB Setup

Ensure MongoDB is running locally.

Database used:

mongodb://localhost:27017/ChatAppDB

If using MongoDB Compass:

Open Compass

Connect to mongodb://localhost:27017

The database will auto-create on first run

🔧 Backend Setup
Step 1: Install Dependencies
cd backend
npm install
Step 2: Create .env File (Inside backend folder)

Create a file named .env and paste:

PORT=5000

MONGO_URI_URI=mongodb://localhost:27017/ChatAppDB

JWT_SECRET=your_super_secret_key_here

CLIENT_URL=http://localhost:3000

ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret

ALLOWED_DOMAINS=slrtce.in

NODE_ENV=development

GROQ_API_KEY=your_groq_api_key

⚠️ Important:

Never commit .env

Replace credentials with your own values

Keep GROQ_API_KEY private

Step 3: Start Backend
npm start

Expected output:

Server running on port 5000
Connected to MongoDB
🎨 Frontend Setup
Step 1: Install Dependencies

Open a new terminal:

cd frontend
npm install
Step 2: Create .env (Inside frontend folder)

Create a file named .env:

VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
Step 3: Start Frontend
npm run dev

App will run at:

http://localhost:3000
🔐 Authentication Rules

Only organizational emails are allowed.

Example:

Email	Access
smriti@slrtce.in
	✅ Allowed
smriti@gmail.com
	❌ Blocked

This ensures:

Professional-only communication

Reduced spam traffic

Controlled user ecosystem

💬 Chat System

Real-time one-to-one messaging via Socket.io

Emoji support

Persistent storage in MongoDB

JWT-protected routes

Automatic user authentication validation

🎥 ZEGO Cloud Integration

Used for real-time meeting/video functionality.

Requires:

ZEGO_APP_ID

ZEGO_SERVER_SECRET

Provides:

Secure token-based meeting access

Professional video interaction

🤖 Groq AI Integration

Uses:

Groq API

LLaMA 3-70B-8192 model

Capabilities:

Meeting transcript summarization

Executive summary generation

Structured business report creation

🛡 Security Architecture

Passwords hashed using bcrypt

JWT token-based authentication

Protected backend routes

Environment variables secured

CORS restricted via CLIENT_URL

Organizational domain filtering

🚨 Common Errors & Fixes
MongoDB Not Connecting

Ensure MongoDB service is running locally.

Invalid Token Error

Check JWT_SECRET

Ensure token is sent in headers

ZEGO Not Working

Verify App ID & Server Secret

Confirm frontend .env setup

Groq API Error

Validate GROQ_API_KEY

Ensure API key is active

🧪 API Base URL
http://localhost:5000/api

Test endpoints using Postman:

Register

Login

Chat routes

Meeting routes
