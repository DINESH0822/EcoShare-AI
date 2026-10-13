# EcoShare AI

EcoShare AI is a full-stack food rescue and redistribution platform designed to reduce food waste by connecting surplus food donors with verified NGOs, organizations, and volunteers. The project follows a complete donation lifecycle: donor submission, AI-powered matching, organization claim, pickup coordination, delivery tracking, and impact analytics.

The platform was built as a realistic internship / AIML project for food rescue operations, with a strong focus on explainable matching, operational visibility, and a polished SaaS-style experience.

## Live Demo

- Frontend: https://eco-share-ai.vercel.app/
- Production API fallback configured in the frontend points to: https://ecoshare-ai.onrender.com

## Problem Addressed

Food waste is a significant operational and sustainability problem. In many cases, surplus food is discarded because donors cannot quickly find a suitable recipient, NGOs are hard to discover, pickups are delayed, and there is no transparent way to track the rescue process end to end.

EcoShare AI addresses these issues by providing:

- A donation workflow for food suppliers and kitchens
- Verified NGO / organization discovery
- Explainable AI-based food matching
- Pickup and delivery operation tracking
- Real-time notifications and updates
- Operational analytics and sustainability impact summaries
- Admin verification and audit oversight

---

## Workflow

Donor
↓
Create Food Donation
↓
AI Matching Engine
↓
Verified NGO / Organization
↓
Claim Donation
↓
Pickup Assignment
↓
Rescue Operation
↓
Delivery / Completion
↓
Impact Analytics

---

## Key Features

### AI-Powered Food Matching

The project includes an explainable recommendation engine rather than a trained ML model. The scoring logic is implemented in the backend AI utility and evaluates donation matches using measurable operational factors such as:

- Geographic proximity
- Pickup distance and route estimation
- Organization capacity and daily load
- Food expiry urgency
- Food category compatibility
- Storage / refrigeration needs
- Operating hours and availability
- Verification status
- Historical assignment load and operational fit

The engine produces ranked matches with reason strings and confidence scores so each recommendation can be explained to the user.

### Food Donation Management

The application supports:

- Donor food listing creation
- Food description and category data
- Quantity, expiry time, and pickup deadline tracking
- Storage and refrigeration metadata
- Donation status lifecycle tracking
- Donation detail pages and history visibility

### NGO / Organization Management

The platform includes:

- Organization registration flows
- Capacity and storage information
- Verification and approval workflows
- Organization listings and detail pages
- Donation claims and matching support
- Geographic organization discovery

### Rescue Operations

The backend and frontend manage a full rescue flow with support for statuses including:

- matching
- matched
- claim_requested
- claimed
- pickup_scheduled
- en_route
- arrived
- collected
- delivered
- completed
- failed
- cancelled

This is reflected in MongoDB models and the operation lifecycle logic used by the application.

### Interactive Map and Routing

The project includes geospatial support using the configured routing and map stack. The codebase is structured for map-based food rescue visualization, geolocation-based matching, and route-aware operation planning. It is implemented using a routing / geospatial service layer and is compatible with the existing frontend map views.

### Real-Time Features

The repository includes Socket.IO integration for real-time updates and notifications. This is used for live operation communication and notification delivery, with frontend support for socket-based state updates and offline fallback behavior.

### EcoBot AI Assistant

EcoBot is implemented as a product-facing assistant that helps users understand the platform. The backend combines intent classification, grounded project FAQs, and account-scoped queries using the authenticated role; it is not an LLM. It supports:

- EcoShare AI overview
- Donation management guidance
- NGO / organization workflows
- AI matching explanation
- Rescue tracking
- Analytics and sustainability
- Admin and audit workflows
- Navigation help

When the backend is unavailable, the frontend shows a readable error and a retry action; it does not present fabricated live records.

### Analytics and Sustainability

The application includes analytics pages for operational metrics and impact, including:

- Donations and rescue stats
- Organization counts and operational health
- AI recommendation and matching data
- Impact summaries and sustainability indicators
- Performance dashboards

Impact numbers are displayed as platform estimates where appropriate, rather than as hard scientific totals.

### Admin Controls

The admin area supports:

- Organization verification queue
- Approval / rejection workflows
- Audit log review
- System health status monitoring
- Platform administration views

---

## Roles and Authentication

The backend uses JWT-based authentication and role-based access control.

Supported user roles defined in the codebase:

- Admin
- Donor
- NGO
- Volunteer

Authentication and authorization features implemented in the project include:

- JWT token verification
- Protected routes via middleware
- Optional protection for public actions
- Role checks with `authorize(...)`
- Password hashing with `bcryptjs`
- Mongoose-backed user models
- Audit-aware operational flows

---

## Backend Lifecycle State Model

```mermaid
stateDiagram-v2
    [*] --> Published
    Published --> AI_Matching
    AI_Matching --> Matched
    Matched --> Claim_Requested
    Claim_Requested --> Claimed
    Claimed --> Pickup_Scheduled
    Pickup_Scheduled --> En_Route
    En_Route --> Collected
    Collected --> Delivered
    Delivered --> Completed
    Claimed --> Failed
    Failed --> Cancelled
```

The actual implementation includes a broader set of statuses defined in the donation and operation models, including `published`, `ai_matching`, `match_found`, `claimed`, `pickup_scheduled`, `pickup_in_progress`, `delivered`, and `completed`.

---

## System Architecture

```text
                     +---------------------+
                     |   EcoShare AI UI    |
                     | React + Vite        |
                     +----------+----------+
                                |
                                v
                     +---------------------+
                     |   Frontend Routes   |
                     | Dashboard, Donations |
                     | Organizations, Ops  |
                     | Analytics, Admin    |
                     +----------+----------+
                                |
                                v
                     +---------------------+
                     |   Node.js / Express |
                     | REST API + Socket.IO|
                     +----------+----------+
                                |
                                v
                     +---------------------+
                     | MongoDB / Mongoose  |
                     | Food, NGO, User,    |
                     | Claim, Operation    |
                     | Notification, Audit |
                     +----------+----------+
                                |
                                v
                     +---------------------+
                     | AI Matching Engine  |
                     | Explainable scoring |
                     | & recommendation    |
                     +---------------------+
```

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Lucide React
- Socket.IO Client
- Axios
- Firebase configuration support

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- dotenv
- CORS

### AI / Matching Layer

- An explainable weighted rules engine filters active, verified/approved NGOs and ranks eligible candidates using food compatibility, refrigeration, distance or estimated route time, pickup radius, remaining capacity, expiry urgency, operating hours, emergency pickup, and recorded reliability.
- Rules-based match scores and factor explanations are separate from the optional Python scikit-learn `RandomForestClassifier` claim-probability estimate.
- The predictor artifact is trained by `backend/ml/train_claim_predictor.py` from 3,000 synthetic examples. Labels are sampled from a hand-written logistic formula, not historical rescue outcomes. Saved holdout metrics describe only that synthetic split and are not production or real-world performance evidence.
- When Python inference or model loading is unavailable, a deterministic heuristic can be used by the matching service; the API marks it as a fallback, not an ML prediction.
- Food-safety and role-authorization checks are independent of model scores. No prediction guarantees a claim, successful delivery, or safe food.

To recreate the synthetic training artifact, install the packages listed in `backend/ml/requirements.txt` and run:

```powershell
cd backend
python ml/train_claim_predictor.py
```

The generated metrics must be labeled synthetic-data evaluation. For deployment-quality evaluation, replace the synthetic generator with a governed, representative set of real claim outcomes and evaluate on a holdout separated by time or organization.

### Deployment / Hosting

- Vercel (frontend)
- Render fallback / production backend target in frontend config
- MongoDB Atlas compatible configuration in backend environment

---

## Project Structure

```text
EcoShare-AI/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── ecoshare-frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── vercel.json
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── README.md
├── .gitignore
└── .vscode/
```

---

## Main Application Pages

The frontend route structure implemented in the application includes:

- Login
- Register
- Dashboard
- Donations
- Add Food
- Organizations / NGOs
- Organization detail pages
- Operations
- Operation detail pages
- Analytics / Sustainability / Impact
- History
- Admin
- Notifications
- Integrations
- Register NGO / organization forms

These screens are protected or feature-gated according to the route logic in the frontend app.

---

## UI / UX Highlights

The current frontend includes several layout and product design upgrades already implemented in the codebase, including:

- Warm white, pale-green, and forest-green EcoShare theme
- Eco-focused brand palette with readable text and Emerald accents
- Improved typography and spacing hierarchy
- Responsive dashboard cards and panels
- Rescue activity timeline improvements
- Organization and NGO grid layouts
- Operations command center styling
- Analytics dashboard readability improvements
- Stronger authentication page design
- EcoBot assistant panel and local fallback messaging

---

## API Overview

The backend exposes the following route groups:

- `/api/users` — user registration, login, and profile access
- `/api/food` — food donation listing, detail retrieval, matching, creation, and deletion
- `/api/ngo` — NGO listing, detail retrieval, verification flows, and approval controls
- `/api/organizations` — organization registration and invitation flows
- `/api/claim` — donation claim operations
- `/api/operations` — rescue operation lifecycle and assignment logic
- `/api/notifications` — in-app notification retrieval and read state updates
- `/api/analytics` — summary metrics and operational analytics
- `/api/history` — history and audit timeline records
- `/api/chatbot` — assistant query endpoint
- `/api/audit` — admin audit log access
- `/api/health` — backend and integration health checks
- `/api/search` — global search functionalities
- `/api/volunteers` — volunteer data and status management
- `/api/config` — platform configuration and public metadata endpoint

---

## Database Models

The backend includes these models:

- User
- Food
- NGO
- Claim
- Operation
- Volunteer
- Notification
- NotificationPreference
- History
- AuditLog
- MatchFeedback
- Partnership
- AIRecommendation

These models support the donation lifecycle, matching workflow, admin oversight, notifications, and traceability across the rescue process.

---

## AI Architecture

The project uses an explainable recommendation engine implemented in the backend. This is intentionally honest and transparent rather than a black-box model.

The AI component calculates a recommendation score using measurable operational factors such as:

- Distance between donor and organization
- Pickup feasibility and time estimate
- Food category compatibility
- Refrigeration / storage suitability
- Donation urgency and expiry time
- Capacity availability
- Organization verification status
- Rescue priority level

The engine returns recommended matches with reasons and warnings so users can understand why a match was suggested.

---

## Real-Time Architecture

The project includes Socket.IO for push-based communication between the Node backend and frontend clients.

Typical uses include:

- Real-time operation updates
- Notification delivery
- Live activity flow updates
- User awareness of rescue progress

---

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create a `.env` file from the sample values and replace placeholders with your own configuration.

Minimum backend variables typically required:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoshare
JWT_SECRET=replace_with_a_strong_secret
```

For Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd ecoshare-frontend
npm install
npm run dev
```

This starts the React + Vite frontend locally, usually on port `5173` unless a port override is used.

---

## Production Build

The frontend build was verified in the project using:

```bash
cd ecoshare-frontend
npm run build
```

This generates the production bundle under the Vite `dist` directory.

---

## Deployment

The repository includes Vercel configuration for the frontend (`ecoshare-frontend/vercel.json`) and the live frontend URL is:

- https://eco-share-ai.vercel.app/

The frontend code also contains a non-localhost production API fallback using:

- https://ecoshare-ai.onrender.com

This means the app is designed to use a deployed backend when it is not running on `localhost`, while still supporting local development with `http://localhost:5000`.

---

## Security Notes

The project includes the following security fundamentals:

- Password hashing with `bcryptjs`
- JWT authentication
- Protected API routes
- Role-based authorization
- Environment variable configuration
- Audit logs and operational tracking
- Validation and restricted action handling in backend controllers

---

## Testing and Verification

The repository includes working backend and frontend runtime capabilities, and the frontend production build was verified successfully during project validation.

The following project-level verification was used:

```bash
cd ecoshare-frontend
npm run build
```

This completed successfully in the current workspace.

---

## Current Limitations

This project is a strong operational prototype and internship-grade implementation, but there are a few honest limitations:

- The AI engine is explainable scoring logic, not a trained ML model
- Environmental impact values are estimates rather than scientific measurements
- Real NGO partner integrations are not automatically connected to external APIs unless configured separately
- Routing and map behavior depend on service configuration and connection availability
- Live production behavior depends on deployed backend availability and environment configuration

---

## Future Enhancements

The following are realistic future improvements, not current implemented features:

- Trained ML-based food demand prediction
- Better food expiry prediction models
- Route optimization and dispatch planning
- Automated volunteer assignment
- SMS / WhatsApp notifications
- More advanced monitoring and analytics dashboards
- Real-time anomaly detection
- Computer vision-based food classification
- Multi-city logistics scaling
- More advanced AI assistant integration

---

## Internship / Project Value

This project demonstrates a broad set of real-world software engineering capabilities:

- Full-stack application development
- REST API design
- MongoDB schema modeling
- Authentication and authorization
- Explainable AI and recommendation logic
- Real-time app communication with Socket.IO
- Geospatial and routing awareness
- Operations and logistics workflow design
- Analytics and sustainability impact dashboarding
- Responsive SaaS-style frontend UI/UX

---

## Developer

Dinesh M

Project: EcoShare AI

---

## Summary

EcoShare AI is a practical food rescue and redistribution platform that connects surplus food donors to verified organizations, volunteers, and rescue operations. The project is built as a full-stack JavaScript application with explainable AI matching, real-time notifications, analytics, and admin oversight, and it is designed to be presented as a credible internship AIML / full-stack product demonstration.
