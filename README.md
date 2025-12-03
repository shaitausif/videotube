#  VideoTube: Full Stack Social Media Platform

##  Project Overview

**VideoTube** is a robust, full-stack social media platform designed to provide a rich, modern user experience centered around video content, microblogging, and real-time community interaction. Built using the **Next.js App Router** for a highly performant and SEO-friendly interface, it is backed by a powerful Node.js/Express-based API and MongoDB, enabling features ranging from secure authentication and video processing to real-time chat and asynchronous job handling.

##  Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js** (App Router), **TypeScript**, **React**, **Redux Toolkit** | High-performance, server-rendered application foundation with robust state management. |
| **Styling** | **Tailwind CSS**, **ShadCN UI** | Utility-first CSS framework for rapid, accessible, and responsive component styling. |
| **Backend/API** | **Node.js/Express.js**, **JWT** (for custom auth), **Mongoose** | RESTful API server for business logic, data persistence, and secure token management. |
| **Database** | **MongoDB** (via Mongoose) | Flexible NoSQL database for content, user data, and real-time chat messages. |
| **Authentication** | **NextAuth.js**, **OAuth** (GitHub, Google), **Custom JWT** | Secure, flexible authentication supporting password-based, social logins, and custom token generation. |
| **Media & Storage** | **Cloudinary** | Cloud-based media management for efficient storage, processing, and delivery of user-uploaded videos and images. |
| **Async & Background Jobs** | **Inngest** | Serverless function platform for handling long-running, asynchronous tasks like video processing, notifications, and scheduled CRON jobs (e.g., subscription checks). |
| **Real-time** | **Socket.IO** (WebSockets) | Enables fast, real-time bidirectional communication for chat and instant notifications. |
| **Payments** | **Razorpay** | Payment gateway integration for handling subscriptions and premium content access. |
| **AI Integration** | **Google Gemini API** | Integrated AI capabilities (e.g., advanced search, content moderation, or chatbot assistance). |
| **Email/Notifications** | **Resend (SMTP)**, **FCM** (Firebase Cloud Messaging) | Reliable transactional email delivery and cross-platform push notifications. |

##  Key Features

### 1. Robust Authentication & Profiles
* **Flexible Sign-on:** Supports username/password registration, email verification, and OAuth (Google/GitHub) via NextAuth.
* **JWT Security:** Implements JWT for custom authentication flows and secures API routes.
* **User Channels:** Comprehensive user profiles with video, post, and tweet sections, plus subscription toggles.

### 2. Content Management & Delivery
* **Video Uploads:** Seamless video and thumbnail uploads managed through **Cloudinary**.
* **Asynchronous Processing:** Utilizes **Inngest** to offload heavy tasks (like post-upload processing or notification fan-out), ensuring fast front-end responsiveness.
* **Content Types:** Supports multiple content streams: videos, micro-posts, and tweets.

### 3. Real-time Interaction & Communication
* **Live Chat:** Real-time, secure chat functionality built with **Socket.IO** for direct and group messaging.
* **Push Notifications (FCM):** Sends immediate updates to users for new comments, likes, and channel activities via Firebase Cloud Messaging.

### 4. Monetization & Premium Features
* **Subscriptions:** Allows users to subscribe to channels.
* **Razorpay Integration:** Secure payment gateway integration to handle premium subscriptions and transactions.

### 5. Enhanced Intelligence
* **Gemini API Integration:** Incorporates AI features (e.g., an AI-powered chatbot, content suggestion, or basic moderation) to enhance user experience.
* **Search Optimization:** Advanced search logic for finding users and video content.

---

##  Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18+)
* MongoDB Instance (Local or Atlas)
* Cloudinary Account
* Resend Account
* Inngest Account
* Razorpay Account
* Google/GitHub OAuth Credentials
* Firebase Project (for FCM)

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/shaitausif/videotube
    cd videotube
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Setup Environment Variables:**
    Create a file named `.env.local` in the root of your project and populate it with the required environment variables using the template below.

    ```bash
    # --- Critical Application Settings ---
    MONGO_URI=<Your_MongoDB_Connection_String>
    NEXT_PUBLIC_URL=http://localhost:3000
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=<A_Long_Random_String>

    # --- API Endpoints ---
    NEXT_PUBLIC_SERVER_URI=http://localhost:5000/api/v1  # Placeholder, adjust if using separate backend
    NEXT_PUBLIC_SOCKET_URI=http://localhost:5000         # Placeholder, adjust if using separate backend

    # --- Authentication (JWT) ---
    ACCESS_TOKEN_SECRET=<A_Strong_Secret_for_Access_Token>
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=<A_Strong_Secret_for_Refresh_Token>
    REFRESH_TOKEN_EXPIRY=10d

    # --- Authentication (OAuth) ---
    GITHUB_ID=<Your_GitHub_OAuth_ID>
    GITHUB_SECRET=<Your_GitHub_OAuth_Secret>
    GOOGLE_CLIENT_ID=<Your_Google_Client_ID>
    GOOGLE_CLIENT_SECRET=<Your_Google_Client_Secret>

    # --- Cloud Services ---
    CLOUDINARY_CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
    CLOUDINARY_API_KEY=<Your_Cloudinary_API_Key>
    CLOUDINARY_API_SECRET=<Your_Cloudinary_API_Secret>

    # --- Email & Notifications ---
    RESEND_API_KEY=<Your_Resend_API_Key>
    NEXT_PUBLIC_FIREBASE_FCM_API_KEY=<Your_FCM_Web_API_Key>
    NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY=<Your_FCM_VAPID_Key>
    FIREBASE_SERVICE_ACCOUNT_KEY=<Path_to_Firebase_Service_Account_JSON>

    # --- AI & Background Jobs ---
    GEMINI_API_KEY=<Your_Gemini_API_Key>
    NEXT_PUBLIC_AI_BOT_ID=<MongoDB_ID_for_AI_User> # Unique ID for the AI bot's profile
    INNGEST_SIGNING_KEY=<Your_Inngest_Signing_Key>

    # --- Payments (Razorpay) ---
    NEXT_PUBLIC_RAZORPAY_KEY_ID=<Your_Razorpay_Key_ID>
    NEXT_PUBLIC_RAZORPAY_KEY_SECRET=<Your_Razorpay_Key_Secret>
    MONTHLY_PLAN_PRICE=12900 # Price in paise (e.g., 12900 = 129.00)
    ```

### Running the Application

1.  **Start the Development Server:**
    ```bash
    npm run dev
    # OR
    yarn dev
    ```
2.  The application will be accessible at `http://localhost:3000`.

### Inngest Setup (For Background Tasks)

Since this project uses Inngest for asynchronous processing, you will need to start the local development server to register the functions:

1.  **Access Inngest Dashboard:** Ensure your local Inngest server is running or that your Vercel/production deployment is correctly linked to your Inngest workspace.
2.  **Function Registration:** The functions (e.g., `registrationEmail`, `subscribersNotification`, `subscriptionCron`, etc.) are automatically registered when the Next.js server runs the `/api/inngest` route. Confirm they appear in your Inngest dashboard.