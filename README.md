# 🏛️ Property Tax Management System

A full-stack, enterprise-grade web application designed for municipal authorities, tax departments, and local governance bodies to streamline property tax surveying, field inspections, verification, and assessment approvals.

Built with **React 19 + Vite + Tailwind CSS** on the client and a high-performance **Node.js (Express) + PostgreSQL (Sequelize ORM)** backend.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [User Roles & Workflow](#-user-roles--workflow)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Configuration & Setup](#3-backend-configuration--setup)
  - [4. Frontend Configuration & Setup](#4-frontend-configuration--setup)
- [API Reference](#-api-reference)
- [Security & Best Practices](#-security--best-practices)
- [Contributing & License](#-license)

---

## 🌐 Overview & Architecture

The **Property Tax Management System** digitizes the manual paper-based field inspection and property verification process. It enforces strict **Role-Based Access Control (RBAC)** across three primary user tiers, ensuring data integrity, traceability, and rapid dispute resolution:

```
[ Field Inspector ]  ───────── (Submits Property Entry + Photo) ────────► [ Submitted ]
                                                                                │
                                                                                ▼
[ Reviewing Officer ] ◄────── (Inspects Details, Address, Image) ─────── [ Review Queue ]
        │
        ├───────────────────────────┬───────────────────────────┐
        ▼                           ▼                           ▼
   [ Approve ]                 [ Reject ]                  [ Audit Trail ]
        │                           │
        ▼                           ▼
   [ Approved ]              [ Draft / Rejected ]
                                    │
                                    └────► [ Inspector Resubmission ]
```

---

## ✨ Key Features

- 🔐 **Role-Based Authentication & Authorization**: Secure JWT-based authentication paired with granular middleware checks for Inspectors, Officers, and Admins.
- 📸 **Field Inspection Capture**: Inspectors can record property owner information, mobile contact, property address, observations, and upload photographic evidence directly from the field.
- ⚡ **Real-Time Verification Queue**: Reviewing officers can view pending submissions, verify uploaded photographs against property metadata, and provide immediate feedback.
- 🔄 **Rejection & Resubmission Cycle**: When an entry is rejected, the inspector receives specific feedback/reasons and can update and resubmit the record.
- 🛡️ **Defense-in-Depth Security**: Rate limiting for authentication and standard API endpoints, encrypted passwords via `bcrypt`, and sanitized multipart uploads via `multer`.
- 🎨 **Modern, Responsive Interface**: Clean, mobile-friendly interface styled with Tailwind CSS, Lucide icons, and responsive dashboards.

---

## 👥 User Roles & Workflow

| Role | Access Level | Primary Capabilities |
| :--- | :--- | :--- |
| **Field Inspector** (`field_inspector`) | Field Level | Create new property survey records, upload site photos, track status of submitted surveys, modify and resubmit rejected entries. |
| **Ward / Reviewing Officer** (`ward_officer`) | Verification Level | Review pending property entries, inspect photo evidence, approve verified records, reject non-compliant submissions with feedback comments, view draft archives. |
| **Administrator** (`admin`) | System Level | User management, global entry oversight, and system-wide statistical reporting. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (SPA)
- **Tooling & Bundler**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **HTTP Client**: Axios (with centralized JWT interceptor)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express 5
- **Database & ORM**: PostgreSQL, Sequelize v6
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcrypt`
- **File Uploads**: Multer
- **Rate Limiting**: `express-rate-limit`
- **Environment Management**: `dotenv`

---

## 📂 Project Structure

```plaintext
Property-Tax-Management-System/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Sequelize database connection & sync
│   │   │   └── schema.sql           # PostgreSQL table definitions & indexes
│   │   ├── controllers/
│   │   │   ├── adminController.js   # Admin metrics and management logic
│   │   │   ├── authController.js    # Registration and login logic
│   │   │   ├── inspectorController.js# Property entry submission & resubmission
│   │   │   └── officerController.js # Verification, approval & rejection logic
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT bearer token verification
│   │   │   ├── rateLimiter.js       # IP rate limiting configurations
│   │   │   ├── rbac.js              # Role-based route authorization
│   │   │   └── upload.js            # Multer disk storage and image handling
│   │   ├── models/
│   │   │   ├── Entry.js             # Sequelize Entry model definition
│   │   │   └── User.js              # Sequelize User model definition
│   │   ├── routes/
│   │   │   ├── adminRoutes.js       # /api/admin endpoints
│   │   │   ├── authRoutes.js        # /api/auth endpoints
│   │   │   ├── inspectorRoutes.js   # /api/inspector endpoints
│   │   │   └── officerRoutes.js     # /api/officer endpoints
│   │   └── utils/
│   │       └── generateToken.js     # JWT signing utility
│   ├── uploads/                     # Multer destination for property images
│   ├── .env.example                 # Backend environment variable template
│   ├── app.js                       # Express application bootstrap & middleware
│   ├── server.js                    # Server startup script
│   └── package.json
│
├── Frontend/
│   ├── public/                      # Static assets and icons
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Role-guarded route wrapper
│   │   │   ├── StatCard.jsx         # Metric display component
│   │   │   └── StatusBadge.jsx      # Colored badge for entry statuses
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & user state provider
│   │   ├── hooks/
│   │   │   ├── useEntries.js        # Hook for inspector entry operations
│   │   │   └── useOfficerEntries.js # Hook for officer verification actions
│   │   ├── pages/
│   │   │   ├── InspectorDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   └── Register.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        # Application route hierarchy
│   │   ├── App.jsx                  # Root React component
│   │   ├── index.css                # Tailwind directives & global styling
│   │   └── main.jsx                 # Vite React entrypoint
│   ├── .env.example                 # Frontend environment template
│   ├── tailwind.config.cjs          # Tailwind styling rules
│   ├── vite.config.js               # Vite build config
│   └── package.json
│
├── .gitignore                       # Multi-tier ignore rules
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [PostgreSQL](https://www.postgresql.org/) (v14.x or later)
- [Git](https://git-scm.com/)

---

### 1. Clone Repository

```bash
git clone https://github.com/akshatsahay21/Property-Tax-Management-System.git
cd Property-Tax-Management-System
```

---

### 2. Database Setup

1. Start your local PostgreSQL service.
2. Create a new database named `myapp_db` using `psql` or pgAdmin:
   ```sql
   CREATE DATABASE myapp_db;
   ```
3. Initialize the database schema and indexes:
   ```bash
   psql -U postgres -d myapp_db -f Backend/src/config/schema.sql
   ```

---

### 3. Backend Configuration & Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the values in `.env` to match your local setup:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=myapp_db
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000`.

---

### 4. Frontend Configuration & Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file if you wish to override defaults:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `role`, `phone`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT bearer token | Public |

### Field Inspector Endpoints (`/api/inspector`)

*Requires Bearer Token with `field_inspector` or `admin` role.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/inspector` | Submit a new property tax entry (multipart with `image`) |
| `GET` | `/api/inspector` | Retrieve all entries submitted by current inspector |
| `PUT` | `/api/inspector/:entryId/resubmit` | Update and resubmit a rejected draft entry |

### Reviewing Officer Endpoints (`/api/officer`)

*Requires Bearer Token with `ward_officer` or `admin` role.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/officer/pending` | Fetch all pending submissions awaiting review |
| `GET` | `/api/officer/drafts` | Fetch rejected drafts history |
| `PUT` | `/api/officer/:entryId/approve` | Approve a submitted entry |
| `PUT` | `/api/officer/:entryId/reject` | Reject an entry with a mandatory `rejection_reason` |

### Admin Endpoints (`/api/admin`)

*Requires Bearer Token with `admin` role.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Retrieve all registered users across the system |
| `GET` | `/api/admin/entries` | Retrieve all property tax entries |
| `GET` | `/api/admin/stats` | View aggregated system metrics and submission stats |

---

## 🔒 Security & Best Practices

- **Never Commit Secrets**: Never commit `.env` or configuration files containing passwords, API tokens, or secrets. Always copy from `.env.example`.
- **Environment Segregation**: Ensure separate production and development database credentials and JWT keys.
- **Upload Sanitization**: Uploaded files are strictly processed and served from isolated storage with unique timestamps to prevent name collision or script execution.
- **Rate Limiting**: Protects login and registration routes against brute-force attacks and safeguards API resources from abuse.

---

## 📄 License

This project is licensed under the [ISC License](file:///c:/Users/Innosystech_pc_72/Desktop/Property%20Tax%20Management%20System/Backend/package.json#L13).
