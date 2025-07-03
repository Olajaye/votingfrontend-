import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login"; // Make sure to import these
import Register from "./Pages/Register";
import CreateRoom from "./Pages/CreateRoom";
import Room from "./Pages/Room";
import AuthProvider, { AuthContext } from "./Context/AuthContext";
import "/src/index.css";
import { JSX, useContext } from "react";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/rooms" element={<Room />} />

          {/* {protected route} */}
          <Route
            path="create-room"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user } = authContext;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
