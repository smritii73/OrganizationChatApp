🚀 OrganizationChatApp
Real-Time Professional Chat & AI Meeting Platform

MERN + Socket.io + ZEGO + Groq LLM

A professional organization-restricted real-time chat and meeting platform built using the MERN stack with WebSocket.io, ZEGO Cloud integration, and Groq LLM for AI-powered summarization.

This platform allows only verified organizational email users (e.g., @slrtce.in) to communicate, reducing spam and ensuring professional interaction.

🧠 Features

🔐 JWT Authentication with bcrypt hashing

🏢 Organizational email restriction (ALLOWED_DOMAINS)

💬 Real-time one-to-one chat using Socket.io

😀 Emoji-supported chat interface

📡 MongoDB persistent storage

🎥 ZEGO Cloud video/meeting integration

🤖 AI meeting summarization using Groq (LLaMA 3-70B-8192)

📊 Structured meeting record generation

🌍 Multilingual-ready architecture

🛡 Secure environment variable configuration

🛠 Tech Stack
Frontend

ReactJS, Tailwind CSS, Axios, React Router DOM, Context API, Vite

Backend

NodeJS, ExpressJS, WebSocket.io, JWT, bcrypt, Mongoose

Database

MongoDB (Compass / Local)

AI / External Services

Groq API (LLaMA 3-70B-8192)
ZEGO Cloud SDK

📂 Project Structure
OrganizationChatApp
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── socket
│   ├── db
│   └── server.js
│
├── frontend
│   ├── src
│   ├── components
│   ├── context
│   ├── pages
│   ├── hooks
│   └── main.jsx
⚙️ FULL SETUP GUIDE (Noob Friendly)

Follow these steps carefully.

🧩 1️⃣ Install Requirements

Install these first:

Node.js (v16+)

MongoDB (Local) OR MongoDB Compass

Git

VS Code

Check installation:

node -v
npm -v
📥 2️⃣ Clone Repository
git clone https://github.com/smritii73/OrganizationChatApp.git
cd OrganizationChatApp
🛢 3️⃣ MongoDB Setup

Make sure MongoDB is running locally.

Database used:

mongodb://localhost:27017/ChatAppDB

If using MongoDB Compass:

Open Compass

Connect to mongodb://localhost:27017

Database will auto-create when app runs

🖥 4️⃣ Backend Setup

Go inside backend:

cd backend
npm install
📄 Create .env file inside backend folder

Paste EXACTLY this:

PORT=5000

MONGO_URI_URI=mongodb://localhost:27017/ChatAppDB

JWT_SECRET=sdfghhgfd.......

CLIENT_URL=http://localhost:3000

ZEGO_APP_ID=116910XXXXX
ZEGO_SERVER_SECRET=fb32057250XXXXXXXXXX69d5

ALLOWED_DOMAINS=slrtce.in

NODE_ENV=development

GROQ_API_KEY=gsk_E9WBlzJJuN2p2pxgiROMWXXXXXXXXGeFPwRxPer

⚠ IMPORTANT:

Do NOT commit .env

Replace secrets with your actual credentials

Never expose GROQ_API_KEY publicly

▶ Start Backend
npm start

Expected Output:

Server running on port 5000
Connected to MongoDB
🎨 5️⃣ Frontend Setup

Open new terminal:

cd frontend
npm install
📄 Create .env inside frontend
VITE_ZEGO_APP_ID=1169XXX
VITE_ZEGO_SERVER_SECRET=fb32057250176XXXXXXXXXXXXXXXXX
▶ Start Frontend
npm run dev

App will run at:

http://localhost:3000
🔐 Authentication Rules

Only emails with domain @slrtce.in are allowed

Example:

smriti@slrtce.in
 ✅ Allowed

smriti@gmail.com
 ❌ Blocked

This prevents spam and ensures professional communication.

💬 Chat System

Real-time messaging via Socket.io

One-to-one communication

Emoji support

Persistent message storage in MongoDB

JWT-protected routes

🎥 ZEGO Meeting Integration

Uses:

ZEGO_APP_ID

ZEGO_SERVER_SECRET

Provides:

Real-time meeting/video capability

Secure token generation

Professional meeting environment

🤖 Groq AI Integration

Uses:

GROQ_API_KEY

Model:
LLaMA 3-70B-8192

Used For:

Meeting transcript summarization

Executive summary generation

Structured professional report creation

🛡 Security Architecture

Password hashed using bcrypt

JWT token authentication

Protected routes middleware

Environment variable protection

Organizational email restriction

CORS configured via CLIENT_URL

🚨 Common Errors & Fixes
❌ MongoDB not connecting

Make sure MongoDB service is running.

❌ Invalid Token Error

Check:

JWT_SECRET matches

Token being sent in headers

❌ ZEGO Not Working

Verify:

Correct App ID

Correct Server Secret

Frontend .env configured properly

❌ Groq API Error

Make sure:

GROQ_API_KEY is valid

API key not expired

Correct model name used

🧪 API Testing

Use Postman:

Base URL:

http://localhost:5000/api

Test:

Register

Login

Chat endpoints

Meeting routes

🏗 Production Deployment Notes

For Production:

Backend:

Deploy on Render / Railway / AWS

Change CLIENT_URL to deployed frontend URL

Frontend:

Deploy on Vercel

Update API base URL

🧑‍💻 Developer Notes

Environment Variables Used:

Backend:
PORT
MONGO_URI_URI
JWT_SECRET
CLIENT_URL
ZEGO_APP_ID
ZEGO_SERVER_SECRET
ALLOWED_DOMAINS
NODE_ENV
GROQ_API_KEY

Frontend:
VITE_ZEGO_APP_ID
VITE_ZEGO_SERVER_SECRET

📌 Final Words

This project demonstrates:

Full MERN stack architecture

Real-time communication engineering

AI integration using Groq

Secure authentication design

Professional domain-based access restriction

Video meeting integration via ZEGO

It is production-ready, scalable, and extensible.
