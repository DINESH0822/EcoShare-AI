# EcoShare AI — Production Food Rescue & Operations Platform

EcoShare AI is a realistic, production-oriented AI-powered food rescue platform connecting commercial kitchens, hotels, supermarkets, and individual donors to verified local recipient NGOs, food banks, and volunteer pickup operations.

---

## 🌟 Technology Stack

- **Frontend**: React 19 + Vite + Tailwind v4 + Plus Jakarta Sans + Lucide Icons
- **Geospatial Maps**: Leaflet + CartoDB Dark Tiles + OSRM Road Distance Engine
- **Backend API**: Express 5 + Node.js
- **Database**: MongoDB Atlas + Mongoose
- **Real-Time Push**: Socket.io Multi-Room Architecture
- **Auth & Security**: JWT Tokens (30-day), bcryptjs Password Hashing, Strict Backend RBAC
- **Explainable AI Matching**: 10-Factor Operational Compatibility Engine (Proximity, Capacity, Expiry Window, Food Category, Storage Temperature, Operating Hours, Workload, Reliability)

---

## 🚀 Key Platform Workflows

```mermaid
graph TD
  A[Food Donor / Kitchen] -->|Post Surplus Donation| B[EcoShare AI Platform]
  B -->|10-Factor Analysis| C[AI Matching Engine]
  C -->|Ranked Match| D[Verified Partner NGO]
  D -->|Claim Request| E[Pickup Operation]
  E -->|Dispatch| F[Volunteer / Transport]
  F -->|Pickup & Temp Check| G[Recipient Delivery]
  G -->|Complete| H[Traceability Ledger & ESG Metrics]
```

---

## 🔑 Roles & Permissions (RBAC)

1. **Donor**: Create and track surplus food donations, view traceability audit logs.
2. **NGO**: View recipient matches, claim food donations (Verified NGOs only), track inbound deliveries.
3. **Volunteer**: Accept pickup dispatches, record temperature logs at pickup, transition delivery pipeline.
4. **Admin**: NGO document review queue, verify/suspend organizations, view system action audit stream, inspect integration health.

---

## 🤖 EcoBot AI Tool-Calling Assistant

EcoBot is a live backend database assistant connected to MongoDB queries via `/api/chatbot/query`:
- *"What donations do I have?"* → Queries active user donations.
- *"Show my pending claims"* → Queries organization claims.
- *"What pickups are assigned to me?"* → Queries volunteer dispatches.
- *"Which NGOs can accept my donation?"* → Queries verified partner NGOs.

---

## 🛠️ Environment Configuration (.env)

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecoshare

# Server Port & JWT Secret
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key

# Provider Abstractions
GEOCODING_PROVIDER=development
ROUTING_PROVIDER=development

# Optional Third-Party Keys
GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
EMAIL_HOST=smtp.mailtrap.io
EMAIL_USER=your_user
EMAIL_PASSWORD=your_pass
WHATSAPP_API_TOKEN=your_token
TWILIO_ACCOUNT_SID=your_sid
FIREBASE_API_KEY=your_key
```

---

## ⚡ Quick Start

```bash
# Backend Setup
cd backend
npm install
npm run dev

# Frontend Setup (in a separate terminal)
cd ecoshare-frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to launch the platform.

## Live Demo

A live deployment URL is not configured yet in this repository. Replace this section with the production URL when the app is deployed.

## Deployment Notes

- Frontend is Vite-based and is compatible with Vercel.
- Backend is an Express API intended for Render, Railway, or another Node.js host.
- Production configuration should read environment variables from the deployment platform rather than hardcoded localhost URLs.
- Map and routing providers should be verified before production rollout.

## Environment Variables

Use placeholders for any required secrets and do not commit real credentials.

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
CLIENT_URL=
MAP_API_KEY=
AI_API_KEY=
EMAIL_API_KEY=
WHATSAPP_API_TOKEN=
```

## Project Structure

```text
EcoShare-AI/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
├── ecoshare-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── package-lock.json
```
