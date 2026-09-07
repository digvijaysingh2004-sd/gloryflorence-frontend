# 🏥 Glory Florence Physiotherapy Management System — Frontend

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=blac](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, clinical-grade **Physiotherapy & Rehabilitation Practice Management System (EHR/ERP)** frontend built for clinics, multi-specialty physiotherapists, doctors, receptionists, accountants, and patients.

Developed with **React 19**, **TypeScript**, and **Vite**, featuring a slate-teal healthcare aesthetic, role-based access control (RBAC), timeline scheduling with conflict detection, visual clinical assessments, and treatment plan trackers.

---

## 🌟 Key Features

### 👥 Comprehensive Patient Management (EHR)

- **Patient Directory**: Real-time filtering, search by name/phone/email, and status tags (`Active` / `Inactive`).
- **360° Patient Dossier**:
  - **Overview & Vitals**: Blood pressure, heart rate, height, weight, BMI, and emergency contact details.
  - **Medical History**: Chronic and acute conditions with severity and diagnostic timeline.
  - **Documents Repository**: Medical attachment storage with file metadata.
  - **History & Sessions**: Tabular view of all past appointments, clinical assessments, and active treatment plans.

### 📅 Smart Appointment Scheduling

- **Dual View Modes**: Switch seamlessly between a visual **Day Timeline Schedule** and an interactive **Table / List View**.
- **Conflict Prevention**: Built-in therapist conflict checking prevents overlapping bookings for the same practitioner.
- **Status Lifecycle**: Track appointments across `Scheduled`, `Completed`, `Cancelled`, and `No Show` statuses.
- **Quick Booking**: Modals with pre-populated patient and therapist selectors, duration calculation, and fee tracking.

### 🩺 Clinical Assessment & Treatment Plans

- **Visual Pain Assessment**: Interactive **VAS (Visual Analogue Scale) 0–10** pain slider with dynamic color grading and descriptor mapping (Sharp, Dull Aching, Burning, Throbbing, Radiating, Stiffness).
- **Physical Examination**: Systematic inputs for Range of Motion (ROM) findings, posture and gait assessment, functional limitations, and clinical diagnosis.
- **Dynamic Treatment Plans**: Prescribe multi-session treatment packages with modality bundles, target dates, and frequency.
- **Session Check-In & Delta Tracking**: Record pre-session vs. post-session pain scores to measure patient recovery delta and tolerance levels.

### 🏋️ Clinical Exercise & Treatment Library

- **Treatment Modalities**: Categorized catalog covering Manual Therapy, Electrotherapy, Hydrotherapy, Exercise Therapy, and Specialized Rehabilitation.
- **Exercise Directory**: Filterable database by target muscle group, difficulty level, sets/repetitions, hold times, and precautions.

### 🔐 Role-Based Access Control (RBAC)

- Fine-grained permission guards across **7 roles**:
  - `superadmin` / `admin`
  - `physiotherapist`
  - `doctor`
  - `receptionist`
  - `accountant`
  - `patient`
- Context-aware sidebar navigation automatically hides inaccessible pages.
- Unauthorized access attempts are intercepted and routed to a dedicated **403 Access Denied** page.

### ⚡ Hybrid Connectivity (Live REST API + Offline Fallback)

- Fully functional in offline/demo mode backed by browser local storage and in-memory mock datasets.
- Automatically connects to live REST endpoints via Axios with JWT token interceptors and auto-logout on `401 Unauthorized`.

---

## 🏗️ Tech Stack

| Layer               | Technology                                                     |
| :------------------ | :------------------------------------------------------------- |
| **Framework**       | [React 19](https://react.dev/)                                 |
| **Language**        | [TypeScript](https://www.typescriptlang.org/)                  |
| **Build & Bundler** | [Vite 8](https://vite.dev/)                                    |
| **Routing**         | [React Router DOM v7](https://reactrouter.com/)                |
| **HTTP Client**     | [Axios](https://axios-http.com/) with interceptors             |
| **Icons**           | [Lucide React](https://lucide.dev/)                            |
| **Linter**          | [Oxlint](https://oxc.rs/)                                      |
| **Styling**         | Modular Vanilla CSS with CSS custom properties (Design System) |

---

## 📁 Project Structure

```text
Frontend/
├── public/                 # Static assets and favicon
├── src/
│   ├── assets/             # Images, icons, and logos
│   ├── components/
│   │   └── common/         # Reusable UI component library
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── FeedbackStates.tsx  # Spinners, empty states, error alerts
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       └── Toast.tsx
│   ├── context/
│   │   ├── AuthContext.tsx         # User authentication & RBAC state
│   │   └── NotificationContext.tsx # Toast alert management
│   ├── layouts/
│   │   ├── AppLayout.tsx           # Main dashboard layout with sidebar & header
│   │   └── AuthLayout.tsx          # Clean layout for login & public flows
│   ├── pages/
│   │   ├── AppointmentsPage.tsx    # Timeline & tabular scheduler
│   │   ├── DashboardPage.tsx       # Clinical KPI cards & overview
│   │   ├── LoginPage.tsx           # Authentication page
│   │   ├── NotFoundPage.tsx        # 404 page
│   │   ├── PatientDetailsPage.tsx  # Full patient EHR & assessment dossier
│   │   ├── PatientsPage.tsx        # Patient registry & creation
│   │   ├── PlaceholderPage.tsx     # Generic page placeholder for pending modules
│   │   ├── TreatmentsPage.tsx      # Treatment modalities & exercise library
│   │   └── UnauthorizedPage.tsx    # 403 Forbidden screen
│   ├── routes/
│   │   ├── AppRoutes.tsx           # Central application routing tree
│   │   ├── ProtectedRoute.tsx      # Auth guard
│   │   └── RoleProtectedRoute.tsx  # RBAC permission guard
│   ├── services/
│   │   ├── api.ts                  # Axios instance with auth interceptors
│   │   ├── appointmentService.ts   # Appointment CRUD & conflict logic
│   │   ├── patientService.ts       # Patient EHR data operations
│   │   └── treatmentService.ts     # Modality & exercise library operations
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces & domain types
│   ├── App.tsx                     # Top-level wrapper & providers
│   ├── index.css                   # Global CSS tokens, reset, & theme variables
│   └── main.tsx                    # React DOM entry point
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules for node, dist, and secrets
├── package.json            # Project manifest & dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/digvijaysingh2004-sd/gloryflorence-frontend.git
cd gloryflorence-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Open `.env` and verify your backend API base URL:

```env
# .NET 8 Web API backend (HTTP: http://localhost:5222/api | HTTPS: https://localhost:7145/api)
VITE_API_BASE_URL=http://localhost:5222/api
```

> 📖 **Backend API Documentation**: For complete endpoint contracts, request/response models, and status codes, see [API_DOCUMENTATION.md](file:///d:/Digvijay/Projects/Glory%20Florence%20Mangement%20System/Frontend/API_DOCUMENTATION.md).

_(Note: If the backend server is offline, the app automatically switches to offline mock mode with built-in demo data)._

### 4. Run Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 🔑 Default Accounts & Testing Credentials

The application supports both live authentication against the .NET 8 backend API and instant offline mock fallback:

### Backend Seed Accounts (.NET 8 Web API)
| Username | Role | Password | Access Level |
| :--- | :--- | :--- | :--- |
| `admin` | **SuperAdmin** | `Admin123!` | Full cross-module administration |
| `clinicadmin` | **Admin** | `Admin123!` | Clinic operations & clinical access |
| `therapist` | **Physiotherapist** | `Therapist123!` | Patients, Appointments, Assessments, Treatments & Prescriptions |
| `doctor` | **Doctor** | `Doctor123!` | Patients, Appointments, Assessments & Prescriptions |
| `receptionist` | **Receptionist** | `Receptionist123!` | Patient intake & Appointment scheduling |
| `accountant` | **Accountant** | `Accountant123!` | Billing & Invoicing |
| `patientuser` | **Patient** | `Patient123!` | Personal rehabilitation records |

### Offline / Mock Email Presets
You can also sign in with any of the demo emails (e.g. `therapist@gloryflorence.com`, `admin@gloryflorence.com`) using password `admin123`.

---

## 📜 Available Scripts

| Command           | Description                                                                                      |
| :---------------- | :----------------------------------------------------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server with Hot Module Replacement (HMR).                            |
| `npm run build`   | Runs TypeScript type checking (`tsc -b`) and produces an optimized production bundle in `dist/`. |
| `npm run preview` | Locally serves the production build from `dist/` for verification.                               |
| `npm run lint`    | Runs [Oxlint](https://oxc.rs/) for blazing-fast code quality and linting checks.                 |

---

## 🗺️ Project Roadmap

- [x] **Day 1**: Architecture setup, design system tokens, responsive shell layout, core common components.
- [x] **Day 2**: Authentication context, JWT bearer token interceptors, role-based route guards (RBAC), 403 screen.
- [x] **Day 3**: Patient directory, creation forms, multi-tab EHR dossier (vitals, medical history, documents).
- [x] **Day 4**: Timeline and table appointment scheduler, therapist conflict checker, treatment modality & exercise library.
- [x] **Day 5**: Clinical assessment workflow (VAS 0–10 pain scale, ROM, diagnosis), treatment plan builder, session progress check-in.
- [ ] **Day 6**: Exercise prescription module (sets, reps, hold times, patient exercise sheets).
- [ ] **Day 7**: Billing, invoices generation, printable PDF receipts, payment drawer.
- [ ] **Day 8**: Live documents upload stream, system audit logs viewer, real-time analytics dashboard widgets.
- [ ] **Day 9**: Backend end-to-end integration & UX polish.
- [ ] **Day 10**: Final QA pass, performance optimization, and production deployment.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
