# 🚨 Reunite AI - Missing Persons Identification Platform

> **An AI-powered real-time missing person identification platform that uses facial recognition and natural language processing to match sighting reports with missing persons in under 5 seconds.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-darkgreen.svg)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup-nodejs)
  - [AI Service Setup](#ai-service-setup-python-fastapi)
  - [Frontend Setup](#frontend-setup-react)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AI Pipeline](#-ai-pipeline)
- [Real-Time Features](#-real-time-features)
- [Performance Metrics](#-performance-metrics)
- [Testing](#-testing)
- [Security](#-security)
- [Deployment](#-deployment)
- [Scalability](#-scalability)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**Reunite AI** is a distributed, AI-powered platform designed to accelerate the identification and recovery of missing persons. It combines **facial recognition** (DeepFace with Facenet512) and **natural language processing** (spaCy NER) to automatically match crowd-sourced sighting reports against registered missing persons in real-time.

### Core Capabilities

- 👤 **Missing Person Registration** with photos and metadata
- 📸 **Crowdsourced Sighting Reports** from citizens
- 🤖 **AI-Powered Face Matching** using DeepFace
- 📝 **NLP Entity Extraction** from text descriptions using spaCy
- 🗺️ **Interactive Live Map** with location intelligence
- 🛡️ **Admin Dashboard** for verification and monitoring
- ⚡ **Real-Time Alerts** via Socket.io
- 📍 **Geocoding Service** for address-to-coordinate conversion

---

## ❗ The Problem

Every year, **millions of people go missing worldwide**. The first **48 hours** are critical for successful recovery, yet:

- ⏱️ **Manual matching** of sightings to missing persons takes hours or days
- 🔒 **Information silos** prevent coordination between agencies and citizens
- 📝 **Unstructured sighting reports** are difficult to process at scale
- 🚫 **No facial recognition** in most public platforms
- 🌐 **Limited real-time coordination** between reporters and responders

**Result:** Precious time is lost, and families endure prolonged uncertainty.

---

## 💡 The Solution

Reunite AI addresses these challenges through:

| Challenge | Our Solution |
|-----------|--------------|
| Slow manual matching | AI-powered instant matching (< 5 seconds) |
| Information silos | Centralized MongoDB database with real-time sync |
| Unstructured reports | spaCy NLP extracts people, locations, dates |
| No face matching | DeepFace with 512-dimensional embeddings |
| Delayed coordination | Socket.io real-time alerts to responders |
| Poor location data | Automatic geocoding + interactive map |

---

## ✨ Key Features

### 🧑‍🤝‍🧑 For Citizens & Families
- ✅ Register missing persons with photos and detailed metadata
- ✅ Submit sighting reports with images and GPS coordinates
- ✅ Auto-upgrade from citizen to family status when reporting a missing person
- ✅ Receive real-time notifications when matches are found
- ✅ Track case status from your personal dashboard

### 👮 For Administrators & Responders
- ✅ **Admin Dashboard** with real-time statistics
- ✅ **Match Review Queue** with side-by-side photo comparison
- ✅ **Verify/Reject/Investigate** workflow for AI matches
- ✅ **Live Interactive Map** with markers and clustering
- ✅ **User Management** with role assignment
- ✅ **System Health Monitoring**
- ✅ **Broadcast Notifications** to all users
- ✅ **Batch Geocoding** for legacy reports

### 🤖 AI Capabilities
- ✅ **Face Recognition** using DeepFace Facenet512 (512-D embeddings)
- ✅ **Cosine Similarity** matching with confidence scoring
- ✅ **Named Entity Recognition** using spaCy (PERSON, LOCATION, DATE, ORG, GPE)
- ✅ **Urgency Detection** from description keywords
- ✅ **Pre-computed embeddings** at registration for fast matching

### 🗺️ Location Intelligence
- ✅ **Interactive Map** with Leaflet + OpenStreetMap
- ✅ **Marker Clustering** for performance at scale
- ✅ **Proximity Search** within radius (km)
- ✅ **Heatmap Visualization** for density analysis
- ✅ **Reverse Geocoding** for coordinate-to-address
- ✅ **Auto-geocoding** on address submission

---

## 🏗 System Architecture

```
                    ┌──────────────────────────────┐
                    │        React Frontend         │
                    │  (Citizen + Admin Portal)     │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      Node.js Backend API      │
                    │  (Auth, Routing, Logic)       │
                    │        Port: 5000             │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
   │    MongoDB      │   │  FastAPI AI     │   │    Socket.io    │
   │  (Metadata DB)  │   │  Microservice   │   │  (Real-time)    │
   │   Port: 27017   │   │   Port: 8000    │   │   Port: 5000    │
   └─────────────────┘   └────────┬────────┘   └─────────────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │ AI Processing Engine   │
                     │ - DeepFace (Facenet512)│
                     │ - Cosine Similarity    │
                     │ - spaCy NER            │
                     └────────────────────────┘
```

### Service Communication Flow

```
Citizen → React → Node.js → MongoDB (store metadata)
                      ↓
                  FastAPI (AI processing)
                      ↓
                  DeepFace → Face Embedding
                      ↓
                  Cosine Similarity → Match Score
                      ↓
                  Node.js → MongoDB (store match)
                      ↓
                  Socket.io → Admin Dashboard (real-time alert)
```

---

## 🛠 Technology Stack

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime environment |
| Express.js | Web framework |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcrypt | Authentication & password hashing |
| Multer | File upload handling |
| Socket.io | Real-time bidirectional communication |
| Axios | HTTP client for AI service |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |

### AI Service (Python)
| Technology | Purpose |
|------------|---------|
| Python 3.9+ | Runtime environment |
| FastAPI | Async web framework |
| Uvicorn | ASGI server |
| DeepFace | Face recognition |
| Facenet512 | Face embedding model |
| RetinaFace | Face detector |
| spaCy | NLP & named entity recognition |
| OpenCV | Image processing |
| NumPy | Vector operations |
| Pillow | Image manipulation |

### Frontend (React)
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Routing |
| Axios | HTTP client |
| Socket.io-client | Real-time communication |
| Leaflet + React-Leaflet | Interactive maps |
| Tailwind CSS | Styling |
| React Hot Toast | Notifications |
| Chart.js | Data visualization |
| Lucide React | Icons |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB | Primary data store |
| GeoJSON 2dsphere Index | Geospatial queries |
| Compound Unique Index | Prevent duplicate matches |

---

## 📂 Project Structure

```
reunite-ai/
│
├── backend-node/                    # Node.js API Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── missingPerson.controller.js
│   │   │   ├── sighting.controller.js
│   │   │   └── match.controller.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── MissingPerson.model.js
│   │   │   ├── Sighting.model.js
│   │   │   └── Match.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── missingPerson.routes.js
│   │   │   ├── sighting.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── map.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── services/
│   │   │   ├── ai.service.js
│   │   │   └── geocoding.service.js
│   │   └── utils/
│   ├── uploads/
│   │   └── faces/
│   ├── tests/
│   │   ├── performance-test.js
│   │   └── stress-test.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── ai-service/                      # Python FastAPI AI Service
│   ├── app.py                       # Main FastAPI application
│   ├── config.py                    # Configuration
│   ├── face_recognition.py          # DeepFace logic
│   ├── nlp_processor.py             # spaCy logic
│   ├── requirements.txt
│   └── venv/
│
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.9+ | [python.org](https://www.python.org/) |
| MongoDB | v6+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Backend Setup (Node.js)

#### 1. Navigate to Backend
```bash
cd backend-node
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment

Create `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/missing_persons_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg
UPLOAD_DIR=uploads

# Optional Geocoding
GOOGLE_MAPS_API_KEY=
MAPBOX_API_KEY=
GEOCODING_PROVIDER=nominatim
```

#### 4. Create Upload Folders
```bash
mkdir uploads
mkdir uploads/faces
```

#### 5. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Cloud Alternative (MongoDB Atlas):**
1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

#### 6. Start Backend
```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📡 WebSocket ready for real-time updates
🌐 http://localhost:5000
❤️  Health check: http://localhost:5000/health
```

---

### AI Service Setup (Python FastAPI)

#### 1. Navigate to AI Service
```bash
cd ai-service
```

#### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

If pip is slow:
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 4. Download spaCy Model
```bash
python -m spacy download en_core_web_sm
```

#### 5. Start AI Service
```bash
python app.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
✅ spaCy model loaded successfully
```

#### 6. Verify AI Service
```bash
curl http://localhost:8000/health
```

---

### Frontend Setup (React)

#### 1. Navigate to Frontend
```bash
cd frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:5000
```

#### 4. Start Frontend
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📡 API Documentation

### Base URLs

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:5000/api` |
| AI Service | `http://localhost:8000` |
| WebSocket | `http://localhost:5000` |

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/update-profile` | Update profile | Private |
| POST | `/api/auth/change-password` | Change password | Private |

**Register Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "citizen",
    "phone": "+1234567890"
  }'
```

### Missing Person Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/missing-person` | Register missing person | All Auth (auto-upgrade) |
| GET | `/api/missing-person` | Get all with filters | Private |
| GET | `/api/missing-person/:id` | Get single | Private |
| PUT | `/api/missing-person/:id` | Update | Creator/Admin |
| PATCH | `/api/missing-person/:id/status` | Update status | Creator/Admin |
| POST | `/api/missing-person/:id/add-photo` | Add photo | Creator/Admin |
| GET | `/api/missing-person/stats/overview` | Statistics | Admin |
| GET | `/api/missing-person/nearby` | Proximity search | Private |
| GET | `/api/missing-person/map/summary` | Map data | Private |

**Create Missing Person (Multipart):**
```bash
curl -X POST http://localhost:5000/api/missing-person \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fullName=Jane Doe" \
  -F "age=25" \
  -F "gender=Female" \
  -F "lastSeenLocation=Central Park, NY" \
  -F "contactInfo={\"name\":\"John Doe\",\"phone\":\"+1234567890\",\"relationship\":\"Brother\"}" \
  -F "photo=@/path/to/photo.jpg"
```

### Sighting Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/sighting` | Submit sighting | Private |
| GET | `/api/sighting` | Get all with filters | Private |
| GET | `/api/sighting/:id` | Get single | Private |
| PATCH | `/api/sighting/:id/status` | Update status | Admin |
| DELETE | `/api/sighting/:id` | Delete | Admin |
| GET | `/api/sighting/stats/overview` | Statistics | Admin |

### Match Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/matches` | Get all matches | Admin |
| GET | `/api/matches/high-confidence` | High confidence matches | Admin |
| GET | `/api/matches/:id` | Get single | Admin |
| PUT | `/api/matches/:id/verify` | Verify match | Admin |
| PUT | `/api/matches/:id/reject` | Reject match | Admin |
| PUT | `/api/matches/:id/investigate` | Start investigation | Admin |
| POST | `/api/matches/:id/notes` | Add note | Admin |
| PUT | `/api/matches/:id/resolve` | Resolve | Admin |
| GET | `/api/matches/stats/overview` | Statistics | Admin |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:userId/role` | Change role |
| PUT | `/api/admin/users/:userId/verify` | Verify user |
| DELETE | `/api/admin/users/:userId` | Delete user |
| GET | `/api/admin/system/health` | System health |
| GET | `/api/admin/activity/logs` | Activity logs |
| POST | `/api/admin/notification/broadcast` | Broadcast |

### Map Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/all` | Combined map data |
| GET | `/api/map/heatmap` | Heatmap data |
| GET | `/api/map/clusters` | Clustered markers |
| GET | `/api/map/bounds` | Auto-calculate bounds |
| GET | `/api/map/sightings/nearby` | Nearby sightings |
| GET | `/api/map/missing/nearby` | Nearby missing persons |
| POST | `/api/map/admin/geocode-batch` | Batch geocode |

### AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/generate-embedding` | Generate face embedding |
| POST | `/compare-faces` | Compare two embeddings |
| POST | `/extract-entities` | NLP entity extraction |
| POST | `/find-best-match` | Find best match |
| POST | `/batch-generate-embeddings` | Batch processing |
| POST | `/process-sighting-text` | Comprehensive NLP |

---

## 💾 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: String, // 'citizen' | 'family' | 'admin'
  phone: String,
  isVerified: Boolean,
  lastLogin: Date,
  
  // Auto-upgrade tracking
  upgradedFromCitizen: Boolean,
  upgradedAt: Date,
  upgradeReason: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### MissingPersons Collection

```javascript
{
  _id: ObjectId,
  fullName: String,
  age: Number,
  gender: String,
  lastSeenLocation: String,
  lastSeenDate: Date,
  
  // Map coordinates
  lastSeenCoordinates: {
    lat: Number,
    lng: Number,
    geoJSON: { type: 'Point', coordinates: [lng, lat] },
    accuracy: String,
    source: String
  },
  
  physicalDescription: {
    height, weight, hairColor, eyeColor,
    distinguishingMarks, clothing
  },
  
  photos: [{
    url, publicId, isPrimary, embeddingId, uploadedAt
  }],
  
  faceEmbedding: [Number], // 512-dim vector
  
  contactInfo: {
    name, phone, email, relationship
  },
  
  status: String, // 'missing' | 'found' | 'archived'
  additionalInfo: String,
  createdBy: ObjectId (ref: User),
  foundDate: Date,
  foundNotes: String,
  
  createdAt, updatedAt
}
```

### Sightings Collection

```javascript
{
  _id: ObjectId,
  image: { url, publicId, embeddingId, capturedAt },
  description: String,
  
  location: {
    lat: Number,
    lng: Number,
    address: String,
    placeName: String,
    geoJSON: { type: 'Point', coordinates: [lng, lat] },
    accuracy: String,
    source: String
  },
  
  sightingTime: Date,
  
  entities: {
    PERSON: [String],
    LOCATION: [String],
    DATE: [String],
    ORGANIZATION: [String],
    GPE: [String]
  },
  
  faceEmbedding: [Number], // 512-dim vector
  reportedBy: ObjectId (ref: User),
  status: String, // 'pending' | 'reviewed' | 'matched' | 'dismissed'
  isUrgent: Boolean,
  
  witnessInfo: { name, phone, email },
  reviewedBy: ObjectId,
  reviewedAt: Date,
  reviewerNotes: String,
  
  createdAt, updatedAt
}
```

### Matches Collection

```javascript
{
  _id: ObjectId,
  missingPersonId: ObjectId (ref: MissingPerson),
  sightingId: ObjectId (ref: Sighting),
  similarityScore: Number, // 0-100
  confidence: String, // 'low' | 'medium' | 'high'
  status: String, // 'pending' | 'verified' | 'rejected' | 'investigating' | 'resolved'
  
  investigationNotes: [{
    note, createdBy, createdAt
  }],
  
  verifiedBy: ObjectId,
  verifiedAt: Date,
  adminNotes: String,
  resolutionDetails: { resolvedAt, resolvedBy, notes },
  
  createdAt, updatedAt
}

// Unique compound index
{ missingPersonId: 1, sightingId: 1 } // unique
```

---

## 🤖 AI Pipeline

### Face Recognition Pipeline

```
Input Image
     │
     ▼
RetinaFace Detector (Face Detection)
     │
     ▼
Face Cropping & Alignment
     │
     ▼
DeepFace Facenet512 (Embedding Generation)
     │
     ▼
512-Dimensional Vector
     │
     ▼
Cosine Similarity Comparison
     │
     ▼
similarity = (A · B) / (||A|| × ||B||)
     │
     ▼
Match Score (%) → Confidence Level
```

**Confidence Thresholds:**
| Score | Confidence | Action |
|-------|------------|--------|
| ≥ 85% | 🔴 High | Immediate admin alert |
| 65-84% | 🟡 Medium | Queue for review |
| 40-64% | 🟠 Low | Store for records |
| < 40% | ⚪ Very Low | Discard |

### NLP Pipeline

```
Text Input
     │
     ▼
spaCy (en_core_web_sm)
     │
     ▼
Named Entity Recognition
     │
     ├── PERSON        → "John", "Mary"
     ├── LOCATION      → "Central Park"
     ├── DATE          → "yesterday", "Jan 15"
     ├── ORGANIZATION  → "Red Cross"
     └── GPE           → "New York", "Lagos"
     │
     ▼
Structured JSON Output
```

---

## ⚡ Real-Time Features

Socket.io events for instant updates:

| Event | Trigger | Recipients |
|-------|---------|------------|
| `new-high-confidence-match` | Sighting matches ≥85% | All admins |
| `missing-person-status-update` | Status changes | Subscribed users |
| `sighting-status-update` | Admin updates sighting | All users |
| `match-verified` | Match verified | Family + admins |
| `broadcast-notification` | Admin broadcast | All users |

**Client Example:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('new-high-confidence-match', (data) => {
  console.log('🚨 New match:', data);
  // Show notification
});
```

---

## 📊 Performance Metrics

| Operation | Target | Achieved |
|-----------|--------|----------|
| Face Embedding Generation | < 2s | ~1.2s |
| Face Comparison | < 100ms | ~50ms |
| NLP Extraction | < 100ms | ~30ms |
| Complete Match Pipeline | < 5s | ~4.5s |
| Socket.io Broadcast | < 100ms | ~80ms |
| Map Data Aggregation (500 markers) | < 300ms | ~200ms |

### Optimization Strategies
1. ✅ **Pre-computed embeddings** at registration time
2. ✅ **Vector-only comparison** (no image reprocessing)
3. ✅ **Limited search space** to active missing persons only
4. ✅ **Async parallel processing** with ThreadPoolExecutor
5. ✅ **Efficient FaceNet512 model** (512-D vectors)
6. ✅ **Database indexes** for all common queries
7. ✅ **Marker clustering** for map performance

---

## 🧪 Testing

### Run Performance Tests
```bash
cd backend-node
npm run test:performance
```

### Run Stress Test
```bash
node tests/stress-test.js
```

### Manual API Tests
```bash
# Health check
curl http://localhost:5000/health

# AI Service health
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","role":"citizen"}'
```

---

## 🔐 Security

| Layer | Implementation |
|-------|----------------|
| Authentication | JWT tokens (7-day expiry) |
| Password Storage | bcrypt (10 salt rounds) |
| Authorization | Role-based access control (RBAC) |
| Rate Limiting | 100 requests / 15 min per IP |
| File Validation | Type + size checks (max 5MB) |
| CORS | Whitelist frontend origin |
| HTTP Headers | Helmet.js security headers |
| Input Validation | express-validator on all endpoints |
| Data Sanitization | Mongoose schema validation |

---

## 🚢 Deployment

### Docker (Recommended)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**AI Service Dockerfile:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend-node
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/missing_persons_db
      - AI_SERVICE_URL=http://ai-service:8000

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"

volumes:
  mongo_data:
```

### Cloud Deployment Options

| Service | Platform |
|---------|----------|
| Backend | Heroku, Railway, Render, AWS ECS |
| AI Service | AWS EC2, Google Cloud Run, Railway |
| Database | MongoDB Atlas (free tier) |
| Frontend | Vercel, Netlify, Cloudflare Pages |
| Storage | AWS S3, Cloudinary |

---

## 📈 Scalability

### Current Limitations
- Single MongoDB instance
- CPU-bound AI inference
- No caching layer

### Scale-Up Path

| Stage | Users | Upgrade |
|-------|-------|---------|
| MVP | 1-100 | Current setup |
| Growth | 100-10K | Redis caching + CDN |
| Scale | 10K-100K | FAISS/Pinecone vector DB |
| Enterprise | 100K+ | Microservices + Kubernetes |

### Recommended Upgrades
1. **FAISS/Pinecone** for million-scale vector search
2. **Redis** for caching frequent queries
3. **Celery** for background batch processing
4. **CDN** for image storage and delivery
5. **Load balancer** for horizontal scaling
6. **MongoDB sharding** for large datasets

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if running
mongosh --eval "db.runCommand({ping:1})"

# Start service
net start MongoDB          # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### Port Already in Use
```bash
# Find and kill process (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### AI Service - spaCy Model Missing
```bash
python -m spacy download en_core_web_sm
```

### Pillow Build Error
```bash
pip install --upgrade pip
pip install Pillow==10.1.0
```

### CORS Errors
Update `FRONTEND_URL` in `.env` to match your frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

### Face Not Detected
- Use a clearer, well-lit photo
- Ensure face is front-facing
- Minimum resolution: 200x200px
- Try multiple photos of the same person

---

## 🗺 Roadmap

### ✅ Completed (v1.0)
- [x] User authentication with JWT
- [x] Missing person registration
- [x] Sighting submission
- [x] Face recognition with DeepFace
- [x] NLP entity extraction with spaCy
- [x] Match verification workflow
- [x] Admin dashboard
- [x] Real-time alerts via Socket.io
- [x] Interactive map with clustering
- [x] Auto-upgrade citizen → family
- [x] Geocoding service
- [x] Performance testing

### 🚧 In Progress (v1.1)
- [ ] SMS/Email notifications
- [ ] Age progression AI
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### 🔮 Future (v2.0)
- [ ] FAISS vector database migration
- [ ] Predictive analytics for high-risk areas
- [ ] Integration with law enforcement APIs
- [ ] Voice-based reporting
- [ ] Public API for third parties
- [ ] White-label solution for municipalities

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **JavaScript**: ESLint + Prettier
- **Python**: PEP 8 + Black
- **Commits**: Conventional Commits

---

## 👥 Team

| Name | Role | Contact |
|------|------|---------|
| [Your Name] | Backend Developer | your.email@example.com |
| [Teammate 2] | AI/ML Engineer | teammate2@example.com |
| [Teammate 3] | Frontend Developer | teammate3@example.com |
| [Teammate 4] | UI/UX Designer | teammate4@example.com |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Reunite AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

We are deeply grateful to:

- **[DeepFace Team](https://github.com/serengil/deepface)** by Sefik Ilkin Serengil for providing production-ready face recognition models
- **[spaCy Team](https://spacy.io/)** at Explosion AI for industrial-strength NLP
- **[OpenStreetMap](https://www.openstreetmap.org/)** & **[Nominatim](https://nominatim.org/)** for free geocoding services
- **[MongoDB](https://www.mongodb.com/)** for the flexible, developer-friendly database
- **[FastAPI](https://fastapi.tiangolo.com/)** creators for the modern Python framework
- **[Leaflet](https://leafletjs.com/)** for the best open-source map library
- **[Socket.io](https://socket.io/)** for making real-time effortless
- All **hackathon organizers, mentors, and judges** for the opportunity

---


<div align="center">

## 💙 Built with Passion for a Safer World

**"Technology united with human compassion can bring loved ones home."**

⭐ Star this repo if you believe in the mission ⭐

[⬆ Back to Top](#-reunite-ai---missing-persons-identification-platform)

</div>
