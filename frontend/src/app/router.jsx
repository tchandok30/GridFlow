
import { Navigate, createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Orders from "../pages/Orders";
import Plans from "../pages/Plans";

function ProtectedRoute() {
  const token = localStorage.getItem("gridflow_token");
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "vehicles", element: <Vehicles /> },
      { path: "orders", element: <Orders /> },
      { path: "plans", element: <Plans /> },
      { path: "plans/history", element: <Plans /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
