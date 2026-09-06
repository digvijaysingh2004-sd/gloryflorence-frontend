import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";

import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { PatientsPage } from "../pages/PatientsPage";
import { PatientDetailsPage } from "../pages/PatientDetailsPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { TreatmentsPage } from "../pages/TreatmentsPage";

const AppLayoutWrapper = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes wrapped in AuthLayout */}
      <Route
        element={
          <AuthLayout>
            <Outlet />
          </AuthLayout>
        }
      >
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes wrapped in ProtectedRoute and AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayoutWrapper />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Patients Module */}
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={[
                  "admin",
                  "superadmin",
                  "physiotherapist",
                  "doctor",
                  "receptionist",
                ]}
              />
            }
          >
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailsPage />} />
          </Route>

          {/* Appointments Module */}
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={[
                  "admin",
                  "superadmin",
                  "physiotherapist",
                  "doctor",
                  "receptionist",
                  "patient",
                ]}
              />
            }
          >
            <Route
              path="/appointments"
              element={<AppointmentsPage />}
            />
          </Route>

          {/* Treatments Module */}
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={[
                  "admin",
                  "superadmin",
                  "physiotherapist",
                  "doctor",
                ]}
              />
            }
          >
            <Route
              path="/treatments"
              element={<TreatmentsPage />}
            />
          </Route>

          {/* Billing Module */}
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={["admin", "superadmin", "accountant"]}
              />
            }
          >
            <Route
              path="/billing"
              element={<PlaceholderPage title="Billing" />}
            />
          </Route>

          {/* Settings Module */}
          <Route
            element={
              <RoleProtectedRoute
                allowedRoles={[
                  "admin",
                  "superadmin",
                  "physiotherapist",
                  "doctor",
                  "receptionist",
                  "accountant",
                  "patient",
                ]}
              />
            }
          >
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Route>
        </Route>
      </Route>

      {/* Fallback route (Not Found) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
export default AppRoutes;
