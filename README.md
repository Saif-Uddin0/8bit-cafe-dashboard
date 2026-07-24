# 🎮 8bit-Cafe Dashboard

A state-of-the-art, retro-themed administrative control panel designed for managing operations, catalogs, bookings, and permissions for the **8bit-Cafe** (a retro gaming and dining experience). Built on top of **React 19**, **Vite**, **Tailwind CSS v4**, and **DaisyUI v5**.

---

## 🚀 Key Modules & Features

The dashboard empowers café operators with comprehensive management tools:

### 1. 📊 Central Analytics & Dashboard
*   **Performance Metrics:** Real-time statistics cards showing overall bookings, earnings, food items, and active games.
*   **Interactive Visualizations:** Sleek financial growth charts powered by **Recharts**.
*   **Operational Overview:** Instant view of today's active bookings and recent payment logs.

### 2. 🕹️ Game Library Management
*   **Virtual Arcade Catalog:** Add, view, edit, and deactivate games available at the café.
*   **Detailed Listings:** Track playtime duration limits, gaming categories, active status, and custom banner images.

### 3. 🍔 Menu & F&B Management
*   **Dynamic Food Inventory:** Maintain a fresh list of food items, complete with prices, descriptions, and categories.
*   **Availability Controls:** Toggle item availability instantly to update client menus.

### 4. 📅 Booking & Reservations
*   **Schedule Tracker:** View customer reservations in an interactive grid view.
*   **Check-in & Payments:** Verify check-in timings, total payments, and update reservation status.

### 5. 📞 Customer Leads & Inquiries
*   **Lead Tracker:** Consolidates inquiries from the user-facing site.
*   **Status Workflow:** Transition leads from *New* -> *Processing* -> *Contacted* -> *Inactive* as operations follow up.

### 6. 👥 Sub-Admin & Role Management
*   **Delegated Administration:** Grant access to staff members by creating sub-admin profiles.
*   **Permissions Matrix:** Assign specific operational read/write rights dynamically.

### 7. ⚙️ Cafe Settings & Customization
*   **Operation Hours:** Configure daily opening/closing schedules.
*   **Promo Banners:** Update promotional banners displayed on client-facing applications.
*   **Admin Profile:** Update master administrator credentials.

---

## 🛠️ Technology Stack

*   **Core Framework:** React 19.x (Functional Components, Hooks, Context API)
*   **Build Tooling & Bundler:** Vite 8.x (Hot Module Replacement, optimized bundling)
*   **Routing:** React Router v8
*   **State Management & Data Fetching:** TanStack React Query v5
*   **API Client:** Axios (configured with intercepts for Authorization and security)
*   **Styling & UI Components:** Tailwind CSS v4 & DaisyUI v5 (responsive layouts, modern CSS variables configuration)
*   **Forms & Validation:** React Hook Form
*   **Charts:** Recharts
*   **Notifications:** SweetAlert2 & React Hot Toast

---

## 📂 Project Directory Structure

```text
8bit-cafe-dashboard/
├── .env.example            # Environment variables configuration template
├── .gitignore              # Files and directories ignored by Git
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML shell entry point
├── package.json            # Scripts and dependencies configuration
├── vite.config.js          # Vite configuration
├── public/                 # Static assets and mock data schemas
│   ├── bookings.json       # Mock structure for reservations
│   ├── categories.json     # Mock structure for categories
│   ├── foods.json          # Mock structure for food inventory
│   ├── games.json          # Mock structure for game inventory
│   ├── leads.json          # Mock structure for customer leads
│   └── sub-admins.json     # Mock structure for admin list
└── src/
    ├── App.css             # Base application stylesheet
    ├── App.jsx             # React entry wrapper
    ├── index.css           # Tailwind CSS directives & global variables
    ├── main.jsx            # Application boostrapping point
    ├── assets/             # Images, icons, and logo assets
    ├── components/         # Reusable feature-based UI components
    │   ├── booking/        # Reservation cards and tables
    │   ├── category/       # Category modals and stats
    │   ├── food/           # F&B management forms & overlays
    │   ├── game/           # Game add, edit, and view modals
    │   ├── global/         # Navbar, Sidebar, ErrorPage, Wrappers
    │   ├── home/           # Analytics, growth charts, and payment lists
    │   ├── leads/          # Leads tables and filters
    │   ├── settings/       # Operational hour sliders and profile inputs
    │   └── subadmin/       # Sub-admin control widgets
    ├── hooks/              # Custom hooks (e.g., Axios security client)
    │   └── useAxios.jsx    # Secure API request configurations
    ├── layout/             # Master structural layouts
    │   ├── Root.jsx        # Authorized dashboard shell (Navbar + Sidebar)
    │   └── Auth.jsx        # Credentials layout (Login, OTP, Password Reset)
    ├── pages/              # Routed pages
    │   ├── Provider/       # AuthProvider and AuthContext definition
    │   ├── authentications/# Login, ForgetPassword, Otp, SetPassword screens
    │   └── dashboard/      # Home, Booking, Food, Game, Leads, Settings, etc.
    └── router/             # Routing configuration
        └── Routes.jsx      # React Router client definitions
```

---

## ⚙️ Development & Local Setup

To run this project on another computer or device, follow the steps below:

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (Recommended: **v18.x** or higher)
*   [npm](https://www.npmjs.com/) (bundled with Node.js) or **Yarn** / **pnpm**

### 2. Clone the Repository
```bash
git clone https://github.com/Saif-Uddin0/8bit-cafe-dashboard.git
cd 8bit-cafe-dashboard
```

### 3. Install Dependencies
Install all required Node modules defined in `package.json`:
```bash
npm install
```

### 4. Setup Environment Variables
Create a local `.env` file by copying the template:
```bash
cp .env.example .env
```
Open the `.env` file and set your Backend API server endpoint:
```env
VITE_API_URL=''
```


### 5. Run the Local Development Server
Start the Vite local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the URL outputted by the terminal).

### 6. Build for Production
To bundle the project in optimized assets for production environments:
```bash
npm run build
```
This generates static files inside the `dist/` directory, ready to be hosted on Netlify, Vercel, Firebase Hosting, or any web server.
