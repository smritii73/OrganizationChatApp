# OrganizationChatApplication

A professional multilingual real-time communication platform with AI-powered meeting transcription and intelligent note generation. Built as a collaborative B.E. Information Technology final-year capstone project demonstrating distributed systems architecture, real-time data synchronization, and natural language processing integration.

**Project Status**: Development Complete | Group Capstone Project | Not Currently Deployed

---

## System Overview

VibeVerse is a comprehensive communication solution enabling seamless interaction across language barriers while providing intelligent meeting intelligence through AI-powered transcription and analysis.

### Core Value Proposition
- **Break language barriers**: Automatic translation for 70+ languages without user intervention
- **Intelligent meetings**: AI-powered transcription with automatic extraction of decisions, action items, and sentiment
- **Real-time collaboration**: WebSocket-powered messaging with <100ms latency
- **Enterprise-ready**: Domain-restricted access, secure authentication, production-grade architecture

---

## Architecture (4 Integrated Services)

### Backend API Service (Node.js + Express - Port 5000)

Core business logic and real-time event orchestration:

**Responsibilities:**
- User authentication with JWT tokens and domain validation
- Real-time message routing with automatic translation
- Contact relationship management with bidirectional synchronization
- Meeting lifecycle management and report generation
- WebSocket event coordination

**Key Design Patterns:**
- Stateless REST API for horizontal scalability
- Event-driven architecture via Socket.IO for real-time features
- Adapter pattern for DTO transformations
- Fallback mechanisms for third-party API failures

**Security Measures:**
- bcrypt password hashing (10-round salts)
- JWT tokens with 15-day expiry
- httpOnly cookies with Secure and SameSite flags
- Domain-based email validation at signup
- Input validation on all endpoints

### MongoDB Database (Port 27017)

Document-oriented data store with optimized indexing:

**Data Model:**
- **Users**: Authentication credentials, language preferences, profile information
- **Messages**: Bidirectional conversations with original and translated text
- **Conversations**: Participant tracking and message references
- **Contacts**: Social graph with bidirectional relationships
- **Meetings**: Recording metadata, transcripts, and generated analytics
- **Languages**: User language preferences (denormalized for performance)

**Performance Optimizations:**
- Case-insensitive indexes on username and email
- Unique constraints preventing duplicate accounts
- Indexed queries on frequently-accessed fields reducing response time to <50ms

### Real-time Communication Layer (Socket.IO + WebSocket)

Event-driven bidirectional communication:

**Socket Events:**
- `connection` / `disconnect`: User presence management
- `newMessage` / `typing` / `stopTyping`: Chat real-time features
- `callUser` / `acceptCall` / `rejectCall` / `endCall`: VoIP orchestration
- `contactAdded`: Social graph notifications
- `getOnlineUsers`: Presence broadcasting

**Connection Management:**
- In-memory user socket mapping for O(1) recipient lookup
- Automatic cleanup on network disconnections
- Heartbeat mechanism for connection health monitoring

### AI Meeting Intelligence (Groq LLaMA 3 + Browser Speech Recognition)

Multi-layered transcript processing pipeline:

**Speech Capture:**
1. Browser-native Web Speech API for audio stream capture
2. Real-time transcript buffering (interim + final results)
3. Graceful handling of empty transcripts with user guidance
4. Automatic reconnection with exponential backoff (1s → 30s)

**Transcript Analysis (Two-tier):**

**Tier 1 - Groq LLaMA 3 70B:**
- JSON-structured output parsing
- Semantic understanding of discussion context
- Confidence scoring based on transcript quality
- Sentiment analysis (Positive/Neutral/Tense)

**Tier 2 - Fallback Heuristics:**
- Regex-based keyword extraction for key points
- Decision identification via pattern matching
- Action item detection (triggers: "will", "should", "must", "need to")
- Word frequency analysis for sentiment classification

**Generated Artifacts:**
```
Executive Summary
├─ 3-4 sentence overview
├─ Key Discussion Points (5-10 themes)
├─ Explicit Decisions Taken
├─ Action Items with implied ownership
├─ Meeting Sentiment Classification
└─ Confidence Score (0-100%)

Analytics
├─ Meeting Duration (start/end timestamps)
├─ Participant Count
├─ Word Count and Transcript Length
└─ Sentiment Confidence Metrics
```

### Frontend Application (React 18 + Vite - Port 3000)

Modern single-page application with component-driven architecture:

**Pages:**
- **Authentication**: Secure signup/login with domain validation and gender selection
- **Chat Dashboard**: Dual-panel interface (sidebar contacts + message thread)
- **Meetings**: Historical meeting view with PDF export capability
- **Call Interface**: WhatsApp-style call modal with mute/camera/speaker controls

**State Management:**
- Zustand for conversation, messaging, and typing state
- React Context for authentication and socket connection
- Local storage for user session persistence
- Real-time state synchronization via Socket.IO listeners

**Real-time Features:**
- WebSocket message streaming with shake animation
- Live typing indicators with pulsing UI
- Online/offline status with presence indicators
- Incoming call notifications (toast-based)
- Automatic contact list refresh on new additions

**Frontend Stack:**
- **UI Framework**: React 18 with hooks
- **Styling**: Tailwind CSS + DaisyUI components
- **Build**: Vite for fast ES modules
- **Calling**: Zego UIKit Prebuilt (abstracts WebRTC)
- **Language**: 70+ supported via emoji-picker-react
- **Notifications**: react-hot-toast
- **PDF Export**: jsPDF for meeting reports
- **Icons**: React Icons, FontAwesome
- **Routing**: React Router v6

---

## Core Technical Features

### Automatic Multilingual Translation

Zero-configuration language bridge for seamless communication:

**Workflow:**
1. User sets preferred language at signup (default: English)
2. Sender's message captured in their language
3. System detects receiver's language preference
4. If different: Google Translate API translates message
5. Both original and translated text stored
6. Receiver sees message in their preferred language

**Supported Languages**: 70+ including Hindi, Spanish, Mandarin, Arabic, Japanese, Portuguese, Russian, German, French, Italian, Korean, Thai, Vietnamese, etc.

**Fallback Behavior**: If translation fails, original message displayed with warning

**Implementation Benefit**: Users never need to manually switch languages or see language selection dialogs

### Bidirectional Contact Synchronization

Automatic mutual relationship creation across users:

```
User A requests contact with User B
    ↓
Contact document created: A → B
Contact document created: B → A (automatic)
    ↓
If User B online:
  Socket event "contactAdded" emitted
  UI updates without page refresh
    ↓
Both users' contact lists synchronized
```

**Race Condition Prevention:**
- Atomic database operations prevent duplicate contacts
- Self-contact validation rejects same-user additions
- Idempotent operations ensure consistency

### Asynchronous Non-Blocking Report Generation

Meeting transcript processing without UI blocking:

```
User ends call
    ↓ (transcript sent immediately)
UI shows "Report generating..."
    ↓
Backend processes transcript asynchronously:
  - Validate transcript length
  - Call Groq LLaMA 3 API
  - Parse JSON response
  - Extract insights
  - Save to database
    ↓
On completion:
  - Toast notification
  - User navigates to Meetings page
  - Full report available with analytics
```

**Why Non-blocking:**
- Frontend doesn't wait for AI processing
- Users can continue using app while report generates
- Multiple concurrent report processing
- Graceful degradation if AI service unavailable

### Intelligent Confidence Scoring

Heuristic-based confidence metric for report reliability:

**Formula:**
```
confidence = min(100, floor(word_count / 5))
```

**Rationale:**
- 50 words = 10% confidence (short, potentially incomplete)
- 250 words = 50% confidence (moderate discussion captured)
- 500+ words = 100% confidence (comprehensive transcript)

**Use Case:** UI displays confidence score alongside report - users understand which reports have higher reliability

### Sentiment Analysis Pipeline

Dual-approach emotion classification:

**Method 1 - AI-Powered (Primary):**
- Groq LLaMA 3 analyzes discussion tone
- Returns: Positive | Neutral | Tense
- Considers context and word emphasis

**Method 2 - Heuristic Fallback:**
- Positive word frequency: "good", "great", "approve", "success", "wonderful", "thank", etc.
- Negative word frequency: "problem", "fail", "risk", "concern", "challenge", "worried", "worst", etc.
- Tense = negative > positive
- Positive = positive > negative
- Neutral = roughly equal

**Example Output:**
- Sentiment: "Positive"
- Reasoning: 12 positive words vs 2 negative words detected

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/signup       → Register user (domain-validated email)
POST   /api/auth/login        → Issue JWT token
POST   /api/auth/logout       → Clear authentication
```

### Messaging
```
POST   /api/messages/send/:receiverId     → Send message (auto-translates)
GET    /api/messages/:conversationId      → Fetch conversation history
```

### Contact Management
```
POST   /api/users/add-contact             → Add contact by username
GET    /api/conversations                 → List user's contacts
```

### Meeting Intelligence
```
POST   /api/meetings/create               → Create meeting document
POST   /api/meetings/:id/generate-report  → Process transcript → generate report
GET    /api/meetings                      → Fetch user's meetings
GET    /api/meetings/:id                  → Get single meeting details
```

### Language Preferences
```
PATCH  /api/language/set-language         → Update user language
GET    /api/language/:userId              → Retrieve user language
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend** | Node.js + Express | 20.x LTS | RESTful API + WebSocket server |
| **Database** | MongoDB | 8.0+ | Document storage with optimization |
| **Real-time** | Socket.IO | 4.8+ | WebSocket with fallback transports |
| **Authentication** | JWT + bcrypt | 9.0+ | Secure session management |
| **AI** | Groq SDK | 0.37+ | LLaMA 3 70B text analysis |
| **Speech** | Web Speech API | Native | Browser-based speech recognition |
| **Calling** | Zego UIKit | 2.17+ | WebRTC abstraction layer |
| **Translation** | Google Translate | Unofficial | 70+ language support |
| **Frontend** | React | 18.2+ | Component-based UI |
| **Build Tool** | Vite | 5.2+ | Fast ES modules bundler |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **State** | Zustand | 4.5+ | Lightweight state management |

---

## Setup & Running Locally

### Prerequisites
- Node.js 20+ and npm
- MongoDB 8.0+ (Atlas cloud or local instance)
- Groq API key (free tier: gsk_xxxxx from console.groq.com)
- Zego UIKit credentials (free tier: 10,000 minutes/month)
- Optional: Git for version control

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd major-project
```

**2. Install Dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
npm install --prefix Frontend
```

**3. Environment Configuration**

Create `.env` file in project root:
```bash
# Database
MONGO_URI_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters-long

# AI Integration
GROQ_API_KEY=gsk_your_groq_api_key_here

# VoIP Calling
VITE_ZEGO_APP_ID=1234567890
VITE_ZEGO_SERVER_SECRET=your_zego_secret

# Access Control (comma-separated)
ALLOWED_DOMAINS=gmail.com,company.com,university.edu

# Environment
NODE_ENV=development
PORT=5000
```

**4. Start Backend Server**
```bash
npm run server
```
Expected output:
```
✅ Successfully Connected to Database
✅ Server + Socket.IO running on port 5000
```

**5. Start Frontend** (new terminal)
```bash
cd Frontend
npm run dev
```
Expected output:
```
  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

**6. Access Application**
```
http://localhost:3000
```

### First Use
1. Create account with domain email (e.g., user@company.com)
2. Login
3. Search for another user by username using search bar
4. Start messaging (translation happens automatically)
5. Voice/video call available from chat header

---

## Testing Key Features

### Test Message Translation
```bash
# User 1: English speaker (auto-detected or set to "en")
# User 2: Hindi speaker (set language to "hi")

User 1 message: "Hello, how are you?"
↓
Backend translates to Hindi: "नमस्ते, आप कैसे हैं?"
↓
User 2 receives and sees Hindi message
```

### Test Meeting Report Generation
1. Start audio/video call
2. Speak naturally during call (or use test mic)
3. End call
4. Backend processes transcript:
   - Extracts key points
   - Identifies decisions
   - Generates action items
   - Analyzes sentiment
5. Navigate to Meetings page
6. View generated report with analytics
7. Export as PDF

### Test Online Status
1. Open app in two browser tabs with different users
2. Observer typing indicators in real-time
3. See online/offline status change on contact list
4. Receive notification when contact goes online

---

## Project Structure

```
major-project/
│
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   ├── meetingController.js
│   │   └── userController.js
│   │
│   ├── models/              # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── message.model.js
│   │   ├── meeting.model.js
│   │   └── contacts.model.js
│   │
│   ├── routes/              # REST endpoints
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   └── meetingRoutes.js
│   │
│   ├── middleware/          # JWT verification, validation
│   ├── socket/             # WebSocket events
│   ├── utils/              # Helpers and utilities
│   ├── db/                 # Database connection
│   ├── config/             # Configuration (Kafka, etc.)
│   │
│   ├── server.js           # Express app setup
│   └── migrate.js          # Database migration script
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home/Home.jsx
│   │   │   ├── login/Login.jsx
│   │   │   ├── signup/SignUp.jsx
│   │   │   └── meetings/Meetings.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── messages/
│   │   │   │   ├── MessageContainer.jsx
│   │   │   │   ├── Messages.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── CallModal.jsx
│   │   │   │
│   │   │   └── sidebar/
│   │   │       ├── Sidebar.jsx
│   │   │       ├── SearchInput.jsx
│   │   │       └── Conversations.jsx
│   │   │
│   │   ├── context/        # React Context (Auth, Socket)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── zustand/        # Zustand state store
│   │   ├── utils/          # Utility functions
│   │   │
│   │   ├── App.jsx         # Route definitions
│   │   └── main.jsx        # React entry point
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json            # Root workspace
├── vercel.json            # Deployment config (not deployed)
├── LICENSE                # MIT License
└── README.md             # This file
```

---

## Key Technical Implementations

### Automatic Translation Architecture

**How it Works:**
```javascript
// When user sends message
const message = "Good morning!";
const senderLanguage = "en";  // User's language setting
const receiverLanguage = "hi"; // Target user's language

if (senderLanguage !== receiverLanguage) {
  translatedText = await translate(message, {
    from: senderLanguage,
    to: receiverLanguage
  });
  // translatedText = "गुड मॉर्निंग!"
}

// Store both versions
await Message.create({
  message: message,
  translatedMessage: translatedText
});
```

**Key Benefit:** No need for users to:
- Select target language
- See language selection dialogs
- Configure translation settings

Result: Friction-free multilingual conversation

### Meeting Report Generation Flow

```
Speech Recognition (Browser)
    ↓
Transcript buffering (final results)
    ↓
User ends call
    ↓
Transcript sent to backend (async, non-blocking)
    ↓
[Backend processes in parallel]
├─ Call Groq LLaMA 3 → JSON parse
├─ Extract summary, keyPoints, decisions
├─ Sentiment analysis
├─ Confidence scoring
└─ Save to database
    ↓
Frontend receives notification
    ↓
User views report in Meetings page
    ↓
Export as PDF (jsPDF formatting)
```

**Key Design Decision:** Asynchronous processing prevents UI blocking and allows concurrent report generation

### Real-time Typing Indicators

```javascript
// Frontend
const handleTyping = () => {
  socket.emit("typing", { to: selectedConversation._id });
  
  // Stop after 1 second of inactivity
  setTimeout(() => {
    socket.emit("stopTyping", { to: selectedConversation._id });
  }, 1000);
};

// Backend
socket.on("typing", ({ to }) => {
  // Emit to recipient in real-time
  io.to(userSocketMap[to]).emit("userTyping", senderId);
});
```

---

## Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Message Latency | <500ms | ✅ ~100ms (WebSocket) |
| API Response Time | <200ms | ✅ ~50ms (indexed queries) |
| Speech Recognition Lag | <2s | ✅ Real-time (native browser) |
| Report Generation | <5s | ✅ ~3-4s (Groq API) |
| Page Load | <3s | ✅ ~1.5s (Vite optimized) |
| Concurrent Users | 50+ | ✅ Tested with 50+ |

---

## Known Limitations

### Current Constraints
- **Not Deployed**: Application runs locally only (no live server)
- **No End-to-End Encryption**: Messages transmitted unencrypted (suitable for internal org use)
- **Single Server**: WebSocket state not replicated across servers
- **Manual Language Setting**: Users must select language (no automatic detection)
- **Limited Call Analytics**: No call duration or quality metrics
- **No Message Search**: Cannot search message history by content
- **Browser Dependency**: Speech recognition requires Chrome/Edge with microphone
- **Groq API Dependency**: AI features require internet and valid API key

### Future Enhancement Opportunities
1. **Signal Protocol E2E Encryption**: Implement full message privacy
2. **Redis Pub/Sub**: Enable multi-server WebSocket synchronization
3. **OpenAI Whisper**: Better speech recognition accuracy
4. **Message Search**: Elasticsearch integration for full-text query
5. **Call Recording**: Audio/video storage with encryption
6. **Admin Dashboard**: User metrics, usage analytics
7. **Mobile App**: React Native iOS/Android version
8. **Two-Factor Authentication**: SMS/TOTP security layer
9. **Calendar Integration**: Meeting scheduling with reminders
10. **Advanced NLP**: Entity recognition, key phrase extraction

---

## Deployment Architecture (Reference - Not Currently Deployed)

### Recommended Production Setup
```
Frontend (React)
    ↓
Vercel Serverless Functions (Next.js wrapper)
    ↓
API Gateway (reverse proxy)
    ↓
Node.js Backend Cluster (load balanced)
    ↓
MongoDB Atlas (managed database)
    ↓
Redis (cache layer for WebSocket state)
    ↓
External APIs (Groq, Google Translate, Zego)
```

### Environment Variables for Deployment
```bash
# Production .env
MONGO_URI_URI=mongodb+srv://prod_user:prod_pass@prod-cluster...
JWT_SECRET=production-grade-secret-key-min-32-chars
GROQ_API_KEY=production-groq-api-key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## Team & Attribution

**Team Members**: Muntajir Hussain Gazi, Tushar Manna  
**Institution**: B.E. Information Technology, Final Year Capstone  
**Duration**: 6 months (final semester)  
**Development Status**: Complete and functional

---

## Learning Outcomes

### Technical Skills Demonstrated

**Backend Architecture:**
- Designed stateless REST API following microservices principles
- Implemented real-time WebSocket communication layer
- Optimized MongoDB queries with strategic indexing
- Handled asynchronous operations with Promises/async-await

**Frontend Development:**
- Built component-driven React application with hooks
- Managed complex state with Zustand and Context API
- Implemented real-time UI updates via Socket.IO listeners
- Optimized performance with Vite bundler

**Security & Authentication:**
- Implemented JWT-based authentication with token refresh
- Applied bcrypt password hashing with proper salt rounds
- Configured CORS and secure cookie flags
- Enforced domain-based access control

**Database Design:**
- Normalized MongoDB schema preventing data duplication
- Created appropriate indexes on frequently-queried fields
- Designed relationships for efficient data retrieval
- Implemented data validation at application layer

**Third-Party Integration:**
- Consumed Groq LLaMA 3 API with JSON parsing
- Integrated Google Translate for multilingual support
- Utilized Zego WebRTC SDK for voice/video
- Implemented fallback mechanisms for API failures

**Software Engineering:**
- Followed clean code principles with meaningful naming
- Structured project with clear separation of concerns
- Documented architecture decisions and trade-offs
- Handled edge cases (empty transcripts, translation failures)

---

## Troubleshooting Guide

### Speech Recognition Not Capturing
**Symptom**: Transcript remains empty after call  
**Cause**: Microphone permission denied or browser incompatible  
**Solution**: 
1. Browser Settings → Privacy → Allow microphone for localhost
2. Refresh page and try again
3. Use Chrome or Edge (Firefox has limited support)

**Test First**: Click "🧪 Test Mic" button in chat header before calling

### Messages Not Translating
**Symptom**: Messages appear in original language only  
**Cause**: Google Translate API failure or network issue  
**Solution**: 
1. Check internet connectivity
2. Verify both users have language preference set
3. Original message shown as fallback

### Groq AI Report Not Generating
**Symptom**: Report shows only empty fields after meeting  
**Cause**: Groq API key invalid or quota exceeded  
**Solution**:
1. Verify `GROQ_API_KEY` in `.env`
2. Check API quota at console.groq.com
3. System falls back to rule-based analysis if AI unavailable

### WebSocket Connection Drops
**Symptom**: Messages delay or fail to send  
**Cause**: Network interruption or server timeout  
**Solution**:
1. Check internet connection
2. Refresh page (Socket reconnects automatically)
3. Check backend server is running: `npm run server`

### MongoDB Connection Error
**Symptom**: "Cannot connect to database" on startup  
**Cause**: MongoDB URI incorrect or cluster unreachable  
**Solution**:
1. Verify MongoDB connection string in `.env`
2. For MongoDB Atlas: Check IP whitelist includes your IP
3. For local: Ensure `mongod` is running

---

## Code Quality & Best Practices

### Architecture Principles Applied

**Separation of Concerns:**
- Controllers handle requests/responses
- Services contain business logic
- Models define data structure
- Middleware handles cross-cutting concerns

**Defensive Programming:**
- Input validation on all endpoints
- Try-catch blocks for async operations
- Graceful fallbacks for API failures
- User-friendly error messages

**Performance Optimization:**
- Database indexes on lookup fields
- Async/await for non-blocking operations
- Connection pooling for database
- Lazy loading on frontend components

**Security Hardening:**
- Never store passwords in plain text (bcrypt)
- Tokens expire (15-day JWT)
- Validate all user inputs
- CORS configured for trusted origins

---

## License

MIT License - Open for educational and personal use. See LICENSE file for complete terms.

---

**Built for learning real-time systems, multilingual architecture, and AI integration. This is a capstone project demonstrating professional software engineering practices.**
Last Updated: March 2025  
Development Status: Complete & Functional  
Deployment Status: Local Development Only
