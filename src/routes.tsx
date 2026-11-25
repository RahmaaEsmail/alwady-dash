import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import { RequireAuth } from "./lib/auth";
import ChangePassword from "./pages/ChangePassword";
import CrudList from "./pages/CrudList";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Newsletter from "./pages/Newsletter";
import PageEditor from "./pages/PageEditor";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "pages/:name", element: <PageEditor /> },
      { path: "content/:table", element: <CrudList /> },
      { path: "messages", element: <Messages /> },
      { path: "newsletter", element: <Newsletter /> },
      { path: "settings", element: <Settings /> },
      { path: "password", element: <ChangePassword /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
