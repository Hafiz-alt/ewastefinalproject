# ♻️ ExoWaste – Smart E-Waste Management Platform

> A full-stack web application for responsible e-waste disposal, built with Vite, Tailwind CSS, and Supabase.

🌐 Live Demo: https://exowaste.vercel.app/

---

## 🚀 Problem

Improper disposal of electronic waste leads to:

* Environmental pollution
* Loss of recyclable materials
* Lack of awareness about nearby collection centers

ExoWaste provides a digital solution to connect users with proper e-waste disposal systems.

---

## ✨ Features

### 👤 User Side

* 🔐 Authentication (Supabase Auth)
* 📍 Locate nearby e-waste collection centers
* ♻️ Submit e-waste pickup requests
* 🧾 Track request status
* 📊 Dashboard with activity history

### 🛠 Admin Side

* 📦 Manage e-waste requests
* 👥 View registered users
* 🏢 Add / manage collection centers
* 📈 Monitor platform activity

---

## 🧠 Tech Stack

### Frontend

* ⚡ Vite
* 🎨 Tailwind CSS
* ⚛️ React
* 🧭 React Router

### Backend (BaaS)

* 🟢 Supabase

  * Authentication
  * PostgreSQL Database
  * Row Level Security
  * Storage

### Deployment

* ▲ Vercel

---

## 🏗️ Architecture

Client (React + Vite)
⬇
Supabase (Auth + Database + Storage)

No traditional backend server — fully serverless.

---

## 🔒 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🖥️ Local Setup

```bash
git clone https://github.com/Hafiz-alt/ewastefinalproject.git
cd ewastefinalproject
npm install
npm run dev
```

---

## 📸 Screenshots

*Add screenshots here*

* Home page
* Dashboard
* Request form
* Admin panel

---

## 📌 Key Learning Outcomes

* Full-stack development using Supabase (no custom backend)
* Secure authentication & database design
* Production deployment on Vercel
* Environment variable management
* Role-based access control

---

## 🗺️ Future Enhancements

* 📱 Mobile responsive optimization
* 🔔 Email notifications for pickup status
* 🧠 AI-based e-waste category detection
* 📊 Advanced analytics dashboard

---

## 👨‍💻 Author

**Hafiz**
MCA Student | Full Stack Developer

📧 [hafizmdph88172@gmail.com](mailto:hafizmdph88172@gmail.com)
💼 GitHub: https://github.com/Hafiz-alt

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!
