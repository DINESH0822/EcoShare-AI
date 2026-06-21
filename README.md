# EcoShare AI – Smart Food Waste Management System

## 📌 Project Overview

EcoShare AI is a full-stack MERN application designed to reduce food waste by connecting food donors with NGOs. The platform allows admins to manage food donations, NGOs to claim available food, and provides dashboard analytics for monitoring donations and claims.

---

## 🚀 Live Demo

### Frontend (Vercel)

🌐 **[https://eco-share-ai.vercel.app](https://eco-share-ai.vercel.app)**

### Backend API (Render)

🌐 **[https://ecoshare-ai.onrender.com](https://ecoshare-ai.onrender.com)**

### GitHub Repository

🌐 **[https://github.com/DINESH0822/EcoShare-AI](https://github.com/DINESH0822/EcoShare-AI)**

---

## ✨ Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Role-Based Access Control (Admin / NGO)

### Food Management

* Add Food Donations
* View Available Foods
* Delete Food Donations
* Food Expiry Tracking

### NGO Management

* Add NGOs
* View NGO List
* Delete NGOs

### Food Claim System

* NGOs can claim food donations
* Status updates automatically
* Claim history tracking

### AI Recommendation

* Suggests suitable NGO based on donation location

### Dashboard Analytics

* Total Food Donations
* Total NGOs
* Total Claimed Foods
* Visual Analytics Charts

### Search & Filter

* Search by Location
* Filter Available / Claimed / Expired Foods

---

## 🛠 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* React Router DOM
* Recharts
* React Hot Toast

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT (JSON Web Token)
* bcryptjs

### Deployment

* Vercel (Frontend)
* Render (Backend)

### Version Control

* Git & GitHub

---

## 📂 Project Structure

```text
EcoShare-AI
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── server.js
│
└── ecoshare-frontend
    ├── src
    │   ├── components
    │   ├── pages
    │   └── assets
    └── main.jsx
```

---

## 🔄 Application Workflow

1. User logs into the system.
2. Admin adds food donation details.
3. Food data is stored in MongoDB Atlas.
4. AI suggests a suitable NGO.
5. NGOs view available food donations.
6. NGO claims food donation.
7. Status changes to Claimed.
8. Dashboard analytics update automatically.

---

## 🗄 Database Collections

### Users

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "encrypted",
  "role": "Admin"
}
```

### Foods

```json
{
  "foodName": "Veg Biryani",
  "quantity": 50,
  "location": "Tirupati",
  "expiryTime": "2026-06-30",
  "status": "Available"
}
```

### NGOs

```json
{
  "ngoName": "Helping Hands",
  "location": "Tirupati"
}
```

### Claim History

```json
{
  "foodId": "...",
  "ngoName": "Helping Hands",
  "claimedAt": "2026-06-21"
}
```

---

## 📊 Deployment Architecture

```text
Frontend (Vercel)
        │
        ▼
Backend API (Render)
        │
        ▼
MongoDB Atlas
```

---

## 🎯 Key Achievements

* Developed a complete MERN Stack application.
* Implemented JWT-based Authentication.
* Added Role-Based Authorization.
* Connected MongoDB Atlas Cloud Database.
* Integrated AI NGO Recommendation Feature.
* Built Dashboard Analytics using Recharts.
* Successfully deployed on Vercel and Render.
* Managed source code using GitHub.

---

## 🔮 Future Enhancements

* Real AI Integration (IBM Watson/OpenAI)
* Google Maps Integration
* Email Notifications
* SMS Alerts
* Mobile Application
* Real-Time Tracking
* Multi-Language Support

---

## 👨‍💻 Developed By

**Dinesh M**

### Project Title

**EcoShare AI – Smart Food Waste Management System**

---

## 🙏 Thank You

Reducing food waste through technology and intelligent food distribution. 🌱🍛🚀
