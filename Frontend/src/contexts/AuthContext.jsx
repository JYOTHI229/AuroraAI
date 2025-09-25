import { createContext, useState, useEffect } from "react";
import api from "../api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    useEffect(() => {
        if (token) {
            api.get("/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const data = response.data;
                if (data.user) setUser(data.user);
                else logout();
            })
            .catch(() => logout());
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post("/login", { email, password });
            const data = res.data;
    
            if (res.status === 200) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem("token", data.token);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: "Login failed" };
        }
    };

    const register = async (name, email, password) => {
    try {
        const res = await api.post("/register", { name, email, password });
        const data = res.data;

        if (res.status === 200) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem("token", data.token);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    } catch (err) {
        return { success: false, error: "Registration failed" };
    }
   };

    const logout = () => {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
