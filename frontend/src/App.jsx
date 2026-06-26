import {
  BrowserRouter as Router,
  Routes,
  Route,
  replace,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProtectedRoutes from "./ProtectedRoutes.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Anosim from "./pages/Anosim.jsx";
import Herosms from "./pages/Herosms.jsx";
import FiveSim from "./pages/FiveSim.jsx";
import GrizzlySms from "./pages/GrizzlySms.jsx";
import AnosimActivation from "./views/AnosimActivation.jsx";

import { Navigate } from "react-router-dom";
import HeroSMSActivation from "./views/HeroSMSActivation.jsx";
import AdminProtectedRoute from "./AdminProtectedRoute.jsx";
import Admin from "./pages/Admin.jsx";
import Users from "./views/Users.jsx";
import TransactionHistory from "./views/TransactionHistory.jsx";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null);
    };

    window.addEventListener("user-logout", handleGlobalLogout);

    return () => window.removeEventListener("user-logout", handleGlobalLogout);
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = io("https://sms-management-app.onrender.com", {
      query: { userId: user.data.user._id },
    });

    return () => socket.disconnect();
  }, [user]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUserData={setUser} />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="activation-history" element={<TransactionHistory />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/anosim/"
          element={
            <ProtectedRoutes>
              <Anosim />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Navigate to="activation" replace />} />
          <Route path="activation" element={<AnosimActivation />} />
        </Route>

        <Route
          path="/herosms/"
          element={
            <ProtectedRoutes>
              <Herosms />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Navigate to="activation" replace />} />
          <Route path="activation" element={<HeroSMSActivation />} />
        </Route>

        <Route
          path="/fivesim/"
          element={
            <ProtectedRoutes>
              <FiveSim />
            </ProtectedRoutes>
          }
        ></Route>

        <Route
          path="/grizzlysms/"
          element={
            <ProtectedRoutes>
              <GrizzlySms />
            </ProtectedRoutes>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
