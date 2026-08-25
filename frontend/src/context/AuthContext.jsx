/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCurrentUser = async () => {
        try {
            const response = await api.get("/users/current-user");

            setUser(response.data.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getCurrentUser();
    }, []);

    const login = async (credentials) => {
        const response = await api.post("/users/login", credentials);

        setUser(response.data.data.user);

        return response.data;
    };

    const register = async (formData) => {
        const response = await api.post("/users/register", formData);

        return response.data;
    };

    const logout = async () => {
        await api.post("/users/logout");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                getCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};