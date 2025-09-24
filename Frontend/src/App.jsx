import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { MyProvider } from "./contexts/MyContext.jsx";
import { AuthProvider, AuthContext } from "./contexts/AuthContext.jsx";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <MyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                
                  <div className="app">
                    <Sidebar />
                    <ChatWindow />
                  </div>
               
              } 
            />
          </Routes>
        </Router>
      </MyProvider>
    </AuthProvider>
  );
}

export default App;
