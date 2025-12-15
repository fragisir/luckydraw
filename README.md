# 🎫 Nepal Loto 6 - Official Lottery System

A complete, production-ready full-stack lottery website built with Next.js 14, Node.js, Express, and MongoDB. This system features a transparent, cryptographically secure draw mechanism that is publicly auditable.

## 🚀 Key Features

*   **Production-Grade Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Node.js, Express, MongoDB.
*   **Secure Payment**: Integrated Stripe payment gateway for ticket purchases.
*   **Unique Tickets**: Auto-generated `NPL6-YYYY-XXXXXX` format unique ticket numbers.
*   **Provably Fair**: Cryptographically secure random number generation (CSPRNG) with verifiable SHA-256 hash proofs.
*   **Transparency**: Public draw history and independent audit tools for users.
*   **User Notifications**: Automated HTML emails with downloadable PDF tickets and QR codes.
*   **Admin Dashboard**: comprehensive admin panel to manage draws, view statistics, and monitor ticket sales.

## 📁 Project Structure

The project is divided into two independent applications:

*   `/frontend` - Next.js client application
*   `/backend` - Node.js Express API server

## 🛠️ Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URL)
*   Stripe Account (for API keys)
*   Gmail Account (for email notifications)

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    *   Create a `.env` file in the `backend` folder based on `.env.example`.
    *   Fill in your MongoDB URI, Stripe Keys, and Gmail App Password.

4.  Start the server:
    ```bash
    npm run dev
    ```
    *   Server runs on `http://localhost:5000`

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    *   Create a `.env.local` file in the `frontend` folder based on `.env.example`.
    *   Add your Stripe Publishable Key and API URL.

4.  Start the application:
    ```bash
    npm run dev
    ```
    *   App runs on `http://localhost:3000`

## 🧪 Testing the Flow

1.  **Buy a Ticket**: Go to `/buy`, select 6 numbers, fill in details, and pay (use Stripe Test Card: `4242 4242...`).
2.  **Verify Ticket**: Check email or go to `/search` to find your ticket.
3.  **Run Draw**: Go to `/admin` to run the lottery draw (selects winner from paid tickets).
4.  **Check Results**: Go to `/draw-history` to view the winner and verify cryptographic proof.

## 🔒 Security & Fairness

*   **Fisher-Yates Shuffle**: Used for unbiased ticket selection.
*   **SHA-256 Hashing**: Generates an immutable proof of the draw result.
*   **Input Validation**: Strict server-side validation for all inputs.
*   **Payment Verification**: Webhook integration ensures only paid tickets enter the draw.

---
© 2025 Nepal Loto Ticket System
