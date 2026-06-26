import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  let user;

  if (token) {
    user = jwtDecode(token);
  }

  if (!token) {
    return <Navigate to={"/login"} />;
  }

  if (!user.isAdmin) {
    return <Navigate to={"/"} />;
  }

  return children;
};

export default AdminProtectedRoute;
