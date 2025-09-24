import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    useEffect(() => {
        if (token) {
            fetch("http://localhost:8080/api/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
                else logout();
            })
            .catch(() => logout());
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
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
            const res = await fetch("http://localhost:8080/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
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
