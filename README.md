# 🔐 PolyLab Platform

### A Secure Cryptography-Focused Learning & Assignment Management System

PolyLab is a **full-stack, security-hardened academic platform** for managing classrooms, assignments, submissions, grading, and cryptography-related computations. It features **role-based access control**, **CSRF-protected authentication**, and an integrated **GF(2ᵐ) polynomial arithmetic engine**, making it ideal for cryptography coursework.

---

## 👥 Project Authors

Developed by:

- **Joud Senan**
- **Aya El Hajj**
- **Ghada Al Danab**
- **Roaa Hajj Chehade**

As part of the course:  
📘 **EECE 455: Cryptography and Network Security**

---

## 🚀 Key Features

### 🔐 Security & Authentication
- CSRF-safe login using a **double-submit cookie** pattern  
- HttpOnly + Secure cookies  
- Strict session validation  
- Rate limiting & request throttling  
- Secure file upload & serving  
- Role-based access (Student • Instructor • Admin)

---

### 🧮 GF(2ᵐ) Polynomial Calculator
Includes a full finite-field arithmetic engine for:
- Addition / subtraction  
- Multiplication  
- Modular reduction  
- AES Rijndael GF(2⁸) operations  
- Step-by-step visual explanations  

---

### 🏫 Classroom Management
- Instructor-created classrooms  
- Students join using a unique join-code  
- Upload course materials  
- Assignments with deadlines  
- Built-in polynomial exercise templates  

---

### 📥 Assignment & Submission System
- File or text submissions  
- Inline preview for instructors  
- Student & instructor submission review pages  
- Auto time conversion to **Asia/Beirut**  
- Grade submission interface  

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python)  
- PostgreSQL  
- Secure authentication & session middleware  
- File validation & streaming

### Frontend
- **React + TypeScript**  
- Tailwind CSS  
- Role-aware routing  
- Context-based authentication state  

### Deployment
- Fully Dockerized (Backend + Frontend)  
- Multi-stage Dockerfile  
- Deployment on **Render** with:
  - Auto builds  
  - Environment variables  
  - HTTPS  
  - Containerized service runtime  

---

## 📦 Installation Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Joud158/PolyLab.git
cd PolyLab
```

---

## 2️⃣ Backend Setup (Local)
```bash
cd Backend
pip install -r requirements.txt
uvicorn Backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3️⃣ Frontend Setup (Local)
```bash
cd Frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
PolyLab/
│
├── .venv/
├── Backend/
│   ├── __pycache__/
│   ├── .venv/
│   ├── core/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── csrf.py
│   │   ├── ratelimit.py
│   │   └── security.py
│   ├── middleware/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   └── security_headers.py
│   ├── routers/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── assignment.py
│   │   ├── auth.py
│   │   ├── classrooms.py
│   │   ├── instructor_requests.py
│   │   ├── materials.py
│   │   ├── me.py
│   │   ├── mfa.py
│   │   ├── quiz.py
│   │   └── submission.py
│   ├── utils/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── email.py
│   │   ├── tokens.py
│   │   └── totp.py
│   ├── venv/
│   ├── __init__.py
│   ├── database.py
│   ├── deps.py
│   ├── Dockerfile
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── README.md
│   └── start.sh
│
├── Frontend/
│   ├── node_modules/
│   ├── src/
│   │   ├── assets/
|   │   │   ├── background.png
|   │   │   └── polylab-hero.png
│   │   ├── components/
|   │   │   ├── ui/
|   |   │   │   ├── badge.tsx
|   |   │   │   ├── button.tsx
|   |   │   │   ├── card.tsx
|   |   │   │   ├── CopyButton.tsx
|   |   │   │   ├── input.tsx
|   |   │   │   ├── Navbar.tsx
|   |   │   │   ├── NavBarUser.tsx
|   |   │   │   ├── StudentNavbar.tsx
|   |   │   │   └── tabs.tsx
|   │   │   └── PageHeader.tsx
│   │   ├── contexts/
|   │   │   └── AuthContext.tsx
│   │   ├── lib/
|   │   │   ├── api.ts
|   │   │   ├── cn.ts
|   │   │   ├── gf2m.test.ts
|   │   │   ├── gf2m.ts
|   │   │   ├── irreducibles.ts
|   │   │   └──  utils.ts
│   │   ├── pages/
|   │   │   ├── admin/
|   |   │   │   ├── AdminDashboard.tsx
|   |   │   │   └── AdminRequestDetail.tsx
|   │   │   ├── instructor/
|   |   │   │   ├── AssignmentDetail.tsx
|   |   │   │   ├── ClassroomDetail.tsx
|   |   │   │   ├── ClassroomsList.tsx
|   |   │   │   ├── InstructorDashboard.tsx
|   |   │   │   └── InstructorSubmissionPage.tsx
|   │   │   ├── student/
|   |   │   │   └── StudentSubmissionPage.tsx
|   │   │   ├── Calculator.tsx
|   │   │   ├── ForgotPassword.tsx
|   │   │   ├── InfoPages.tsx
|   │   │   ├── LandingPage.tsx
|   │   │   ├── Login.tsx
|   │   │   ├── PageGallery.tsx
|   │   │   ├── RequestInstructor.tsx
|   │   │   ├── ResetConfirm.tsx
|   │   │   ├── SignUp.tsx
|   │   │   ├── StudentClassroom.tsx
|   │   │   ├── StudentDashboard.tsx
|   │   │   └── VerifyEmail.tsx
│   │   ├── store/
|   │   │   └── mockInstructor.ts
│   │   └── types/
|   │   │   └── assets.d.ts
│   │   └── App.tsx
│   │   └── index.css
│   │   └── main.tsx
│   ├── .env
│   ├── .gitignore
│   ├── components.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── services/
├── uploads/
├── polylab.db
├── docker-compose.yml
├── .env
└── README.md
```

---

## 📜 License

This project is created for **academic and educational purposes** as part of the EECE 455 course.

---

## ⭐ Acknowledgment

Special thanks to the EECE Department and **Professor Ali l Hussein** for their support and guidance.

----------

➡️ To explore the live platform, visit the deployed site here: https://polylab-website.onrender.com
➡️ Check out our full demo video here: https://www.youtube.com/watch?v=tLylCZbrl5U&t=130s

