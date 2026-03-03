import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Workouts } from "./pages/Workouts";
import { WorkoutPlans } from "./pages/WorkoutPlans";
import { Exercises } from "./pages/Exercises";
import { Nutrition } from "./pages/Nutrition";
import { BodyMetrics } from "./pages/BodyMetrics";
import { Progress } from "./pages/Progress";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "workouts",
        Component: Workouts,
      },
      {
        path: "plans",
        Component: WorkoutPlans,
      },
      {
        path: "exercises",
        Component: Exercises,
      },
      {
        path: "nutrition",
        Component: Nutrition,
      },
      {
        path: "metrics",
        Component: BodyMetrics,
      },
      {
        path: "progress",
        Component: Progress,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
