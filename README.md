# 🍔 Cravings - Full Stack Food Delivery Web Application (MERN)

A modern, responsive, and comprehensive Full-Stack Food Delivery platform built by **Vishal Tiwari** with the **MERN Stack** (MongoDB, Express, React 19, Node.js), **Tailwind CSS**, **Razorpay**, **Cloudinary**, and **Nodemailer**.

---

## 🌟 Key Features

- **Multi-Role Authentication & Dashboards**:
  - 👤 **Customer**: Browse restaurants, search meals by cuisine/macro-nutrients, add items to cart, group pool ordering, Razorpay checkout, track order status, download PDF invoices.
  - 🍽️ **Restaurant Owner / Manager**: Manage menus, dish pricing, live orders, preparation times, and store operations.
  - 🛵 **Delivery Rider**: View available orders, claim delivery tasks, real-time status progression (Picked Up, Delivered), earnings overview.
  - 🛡️ **Admin**: Oversee platform metrics, users, restaurant onboarding approvals, contact messages, customer feedback.
- **Group Ordering ("Delivery Pool")**:
  - Share order pools to split and consolidate deliveries.
- **Nutrition & Macros Display**:
  - Detailed calorie, protein, carbohydrate, and fat breakdown per dish.
- **Automated Invoicing**:
  - Client-side PDF bill generation with `jspdf` and `html2canvas`.
- **Integrated Payments**:
  - Razorpay payment checkout integration with HMAC SHA256 signature verification.
- **Interactive UI**:
  - Built with Vite and React 19, styled using Tailwind CSS, featuring toast notifications, modals, and dynamic responsive layouts.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management & Context**: Native Context API (`AuthContext`, `CartContext`)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications & UI**: `react-hot-toast`, `react-icons`
- **PDF Generation**: `jspdf`, `html2canvas`

### Backend (`/server`)
- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) + HTTP-only cookies + `bcrypt`
- **File Uploads**: `multer` + `cloudinary`
- **Payments**: `razorpay`
- **Emails / OTP**: `nodemailer`

---

## 📁 Project Structure

```text
cravings_vn/
├── client/                     # Frontend React 19 + Vite Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images, logos, loaders
│   │   ├── components/         # Modals, Navbar, Footer, Dish cards, Dashboards
│   │   ├── config/             # Axios and API configuration (ApiConfig.jsx)
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/              # Home, OrderNow, RestaurantDetails, Dashboards, etc.
│   │   ├── utils/              # Client utility functions
│   │   ├── App.jsx             # Route definitions & layout
│   │   └── main.jsx            # React root entry point
│   ├── .env.example            # Client env template
│   └── package.json
│
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB, Cloudinary, Razorpay, Nodemailer configs
│   │   ├── controller/         # Auth, Order, Menu, Restaurant, Pool, Payment controllers
│   │   ├── middleware/         # Role-based JWT auth middlewares
│   │   ├── models/             # Mongoose schemas (User, Restaurant, Menu, Order, Pool, etc.)
│   │   ├── router/             # Express routes (/auth, /public, /menu, /order, etc.)
│   │   ├── seeders/            # Database seed scripts with sample Bhopal restaurants & menus
│   │   └── utils/              # Email, auth helper utilities
│   ├── index.js                # Server entry point
│   ├── fixMacros.js            # Utility to enrich menu items with macros
│   ├── .env.example            # Server env template
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** installed and running locally on port 27017 (or a free MongoDB Atlas connection string)

### 2. Environment Variables Configuration

Both `client` and `server` include `.env.example` templates. Default development `.env` files are already configured:

#### Server (`server/.env`):
```env
PORT=5000
MONGO_DB_URI=mongodb://127.0.0.1:27017/cravings_vn
JWT_SECRET=cravings_dev_secret_key_2026

# Optional for external integrations:
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GMAIL_USERNAME=
GMAIL_PASSCODE=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

#### Client (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

---

### 3. Seed Database with Sample Data

Run the database seed script to populate default accounts, real restaurants (e.g. Manohar Dairy, Sagar Gaire, Zam Zam, Bake N Shake), and comprehensive menus:

```bash
npm run seed
```

---

### 4. Run the Project

You can start both server and client concurrently with a single command from the root directory:

```bash
npm run dev
```

Or run them individually:

- **Server only**:
  ```bash
  npm run server
  ```
  *(Runs on http://localhost:5000)*

- **Client only**:
  ```bash
  npm run client
  ```
  *(Runs on http://localhost:5173)*

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with test accounts for all user roles:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin1@gmail.com` | `Admin@123` |
| **Admin (Alt)** | `admin@cravingsfsd08.com` | `StrongPassword@123` |
| **Customer** | `customer1@gmail.com` | `Customer@123` |
| **Delivery Rider** | `rider1@gmail.com` | `Rider@123` |
| **Restaurant Manager 1** | `manager1@gmail.com` | `Manager@123` |
| **Restaurant Manager 2** | `manager2@gmail.com` | `Manager@123` |
| **Restaurant Manager 3** | `manager3@gmail.com` | `Manager@123` |
| **Restaurant Manager 4** | `manager4@gmail.com` | `Manager@123` |
| **Restaurant Manager 5** | `manager5@gmail.com` | `Manager@123` |

---

## 📡 API Endpoints Overview

| Prefix | Description |
|---|---|
| `/auth` | Register, login, logout, verify OTP, session checks |
| `/public` | Public restaurants directory, search, and dishes |
| `/menu` | Restaurant menu item CRUD operations |
| `/restaurant`| Restaurant profile, opening hours, status updates |
| `/order` | Place orders, retrieve user orders, update order status |
| `/pools` | Group delivery pool creation and item aggregation |
| `/payment` | Razorpay order creation and signature verification |
| `/rider` | Available delivery orders, pickup, delivery confirmation |
| `/admin` | System overview, approvals, feedback, contacts |
| `/common` | Shared resources and utilities |
