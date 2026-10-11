# kawai.makes (React + Firebase + Razorpay)

Handmade bouquets, keychains, and beaded phone charms store powered by **React 18**, **Firebase (Firestore, Auth, Cloud Functions v2 in TypeScript)**, and **Razorpay**.

---

## 🌟 Architecture & Implementation (Steps 1 & 2 Completed)

### 1. Firebase & Database Setup
- **Firestore Security Rules** ([`firestore.rules`](file:///c:/project/kawai_makes/firestore.rules)):
  - `products`: Public read for active catalog items; admin-only write.
  - `orders`: Strictly locked from direct client reads or writes (all access is managed securely via Cloud Functions).
  - `config`: Admin-only read/write.
- **Product Seeding** ([`functions/src/seed.ts`](file:///c:/project/kawai_makes/functions/src/seed.ts)):
  - Cloud Function callable `seedDatabase` seeds initial products into `products/{productId}` and default shop config into `config/shop` (`shippingFee: 60`, `codCity: "dibrugarh"`).
- **Client Product Service** ([`src/services/productService.js`](file:///c:/project/kawai_makes/src/services/productService.js)):
  - Dynamically queries Firestore `products` collection with fallback to static catalog.

### 2. Secure Order Creation & COD Flow
- **Cloud Function `createOrder`** ([`functions/src/createOrder.ts`](file:///c:/project/kawai_makes/functions/src/createOrder.ts)):
  - **Rate Limiting**: IP-based rate limiting prevents spam attacks.
  - **Input Validation & Sanitization**: Enforces valid full name (1-100 chars), 10-digit Indian phone number, full address, city, and 6-digit PIN code.
  - **Server-Side Price Calculation**: Disregards client prices and queries verified prices directly from Firestore.
  - **COD Validation**: Server enforces that Cash on Delivery is only allowed if the customer's city matches `codCity` ("dibrugarh"). Non-Dibrugarh COD orders are rejected.
  - **Safe Server Logging**: Never logs customer phone numbers or full addresses in function logs.
  - **Order ID Generation**: Generates clean human-readable IDs formatted like `KM-4F2A9`.
- **Frontend Integration**:
  - **React Router Navigation** ([`src/App.jsx`](file:///c:/project/kawai_makes/src/App.jsx)): Routes for `/`, `/thanks/:orderId`, `/order/:orderId`, and `/admin/*`.
  - **Checkout Modal** ([`src/components/CheckoutModal.jsx`](file:///c:/project/kawai_makes/src/components/CheckoutModal.jsx)): Real-time COD city qualification, mandatory policy agreement, and seamless integration with `createOrder`.
  - **Fallback Option**: Includes "Prefer to order manually on Instagram?" for manual Instagram DM orders.
  - **Thanks Page** ([`src/pages/ThanksPage.jsx`](file:///c:/project/kawai_makes/src/pages/ThanksPage.jsx)): Order confirmation summary with direct prefilled Instagram message link.

---

## 🔑 Environment Variables (`.env`)

Copy [`.env.example`](file:///c:/project/kawai_makes/.env.example) to `.env`:

```env
# Frontend Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=kawai-makes.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kawai-makes
VITE_FIREBASE_STORAGE_BUCKET=kawai-makes.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Backend / Cloud Functions Secrets
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
RESEND_API_KEY=re_your_resend_api_key
OWNER_EMAIL=owner@example.com
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_optional
TELEGRAM_CHAT_ID=your_telegram_chat_id_optional
ADMIN_EMAILS=owner@example.com
```

### Where to get each value:
1. **Firebase**:
   - Create a project in [Firebase Console](https://console.firebase.google.com/).
   - Add a Web App and copy the config values (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, etc.).
   - Enable **Firestore Database**, **Authentication** (Google Provider), and **Cloud Functions**.
2. **Razorpay**:
   - Register on [Razorpay Dashboard](https://dashboard.razorpay.com/) and generate API Keys under *Settings > API Keys*.
3. **Resend** (Email):
   - Get your API key from [Resend](https://resend.com/).
4. **Telegram** (Optional):
   - Create a bot via `@BotFather` on Telegram to get `TELEGRAM_BOT_TOKEN` and get your `CHAT_ID` via `@userinfobot`.

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
npm --prefix functions install
```

### 2. Start Frontend Dev Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm --prefix functions run build
```
