# English Capsules LMS Platform

A modern, high-performance Learning Management System (LMS) built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase Firestore/Auth, and SSLCommerz Payment Gateway.

---

## 🚀 Features

- **🎓 Student Dashboard**: Track course progress, continue video lessons, view enrolled programs, and earn completion certificates.
- **👨‍🏫 Instructor Studio**: Create, edit, and publish dynamic courses with custom video modules and lessons.
- **🛡️ Secure Admin Portal**: Protected with cryptographic JWT sessions and HTTP-only cookies for managing courses, tracking revenues, and monitoring student enrollments.
- **💳 Payment Integration**: Ready for SSLCommerz, bKash, and Nagad payment processing with simulated mock fallbacks.
- **⚡ Next.js 14 App Router**: Server-side rendering, optimized media streaming, and modern UI micro-interactions with Framer Motion.

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lms-website.git
cd lms-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Fill in your configuration variables in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Authentication
ADMIN_USERNAME=abir
ADMIN_PASSWORD=your_secure_password
ADMIN_JWT_SECRET=your_secure_random_jwt_secret

# Payment Gateway (Optional)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

> **Note**: The application is equipped with an offline demo mode. If Firebase keys are not provided, it seamlessly runs with local mock data for testing.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Best Practices Implemented

- **No Hardcoded Secrets**: All sensitive admin credentials and API secrets are loaded through environment variables.
- **Cryptographic JWT Verification**: Admin routes and stats endpoints verify HMAC SHA-256 JWT tokens.
- **Protected Environment Variables**: `.gitignore` is configured to prevent `.env*.local` and build caches from being committed to GitHub.
- **HTTP Security Headers**: Strict HTTP headers configured in `next.config.js` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc.).

---

## 🚢 Deploying to GitHub & Vercel

### Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "feat: initial commit with security hardening"
```

### Step 2: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Under **Project Settings > Environment Variables**, add the environment variables from your `.env.local`.
3. Click **Deploy**.

---

## 📄 License
This project is private and proprietary.
