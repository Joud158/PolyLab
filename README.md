# 🔐 PolyLab Platform

### A Secure Cryptography-Focused Learning & Assignment Management System

PolyLab is a **full-stack, security‑hardened academic platform**
designed for managing classrooms, assignments, submissions, grading, and
cryptography‑related computations.\
It features **role-based access controls**, **CSRF-protected
authentication**, and a built‑in **GF(2ᵐ) polynomial arithmetic
engine**, making it a powerful tool for both instructors and students
studying cryptography.

------------------------------------------------------------------------

## 👥 **Project Authors**

This project was developed by:

-   **Joud Senan**\
-   **Aya El Hajj**\
-   **Ghada Al Danab**\
-   **Roaa Hajj Chehade**

As part of the course:\
📘 **EECE 455 --- Cryptography and Network Security**

------------------------------------------------------------------------

## 🚀 **Key Features**

### 🔐 Security & Authentication

-   CSRF-hardened authentication (double-submit cookie technique)
-   HttpOnly + Secure cookies
-   Strict session validation logic
-   Fully protected file upload/download system
-   Role-based access control (Student • Instructor • Admin)

------------------------------------------------------------------------

### 🧮 GF(2ᵐ) Polynomial Calculator

Integrated cryptographic polynomial engine featuring: - Polynomial
addition, subtraction, multiplication\
- Modular reduction\
- AES Rijndael GF(2⁸) operations\
- Step-by-step visual explanations for learning

Perfect for cryptography students practicing finite field arithmetic.

------------------------------------------------------------------------

### 🏫 Classroom Management

-   Instructors can create/manage classrooms\
-   Invite students using a join code\
-   Upload learning materials\
-   Create assignments with deadlines\
-   Use assignment templates for polynomial exercises

------------------------------------------------------------------------

### 📥 Assignment & Submission System

-   Students can write answers or upload files\
-   Instructors can preview submissions inline\
-   Full submission review pages for both instructor and student\
-   Timestamp conversion to **Lebanon (Asia/Beirut)** timezone\
-   Grade entry and per-assignment review

------------------------------------------------------------------------

## 🛠️ **Tech Stack**

### 🔧 Backend

-   **FastAPI** (Python)
-   PostgreSQL database
-   Secure session middleware
-   Fully validated request and file handling

### 🎨 Frontend

-   React + TypeScript
-   Tailwind CSS
-   Role-aware routing
-   Inline rendering for materials, assignments, and submissions

### 📦 Deployment

-   Dockerized backend + frontend
-   Ready for deployment on Render, AWS, or Docker-based environments

------------------------------------------------------------------------

## 📦 **Installation Instructions**

### 1️⃣ Clone the repository

``` bash
git clone https://github.com/your-username/PolyLab.git
cd PolyLab
```

------------------------------------------------------------------------

### 2️⃣ Backend Setup

``` bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

------------------------------------------------------------------------

### 3️⃣ Frontend Setup

``` bash
cd Frontend
npm install
npm run dev
```

------------------------------------------------------------------------

## 📁 Project Structure

    PolyLab/
    │
    ├── Backend/        # FastAPI backend
    ├── Frontend/       # React + TypeScript frontend
    ├── Dockerfile      # Deployment-ready Dockerfile
    ├── README.md       # Project documentation
    └── ...

------------------------------------------------------------------------

## 📜 License

This project is created for **academic and educational purposes** as
part of the EECE 455 course.

------------------------------------------------------------------------

## ⭐ Acknowledgment

Special thanks to the EECE department and the course instructors for
guidance throughout this project.
