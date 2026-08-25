/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    // Shared by every call site of getCurrentUser (initial mount AND
    // manual refreshUser() calls elsewhere in the app) so a request
    // that resolves after this provider unmounts never touches state.
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const getCurrentUser = useCallback(async () => {
        try {
            setAuthError("");

            const response = await api.get(
                "/users/current-user"
            );

            if (mountedRef.current) {
                setUser(response.data.data);
            }
        } catch (error) {
            if (mountedRef.current) {
                setUser(null);

                // A 401 simply means the visitor isn't logged in.
                // Don't treat that as an application error.
                if (error?.response?.status !== 401) {
                    setAuthError(
                        error?.response?.data?.message ||
                            "Unable to verify your account."
                    );
                }
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Single call on mount — was previously duplicated inline here,
    // which meant the mount-time fetch and the manually-triggered
    // refreshUser() could silently drift out of sync over time.
    useEffect(() => {
        // Authentication state is initialized from the external cookie session.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getCurrentUser();
    }, [getCurrentUser]);

    const login = async (credentials) => {
        try {
            setAuthError("");

            const response = await api.post(
                "/users/login",
                credentials
            );

            const loggedInUser =
                response.data.data.user;

            setUser(loggedInUser);

            return response.data;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Unable to log in. Please check your credentials.";

            setAuthError(message);

            throw error;
        }
    };

    const register = async (formData) => {
        try {
            setAuthError("");

            const response = await api.post(
                "/users/register",
                formData
            );

            return response.data;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Unable to create your account.";

            setAuthError(message);

            throw error;
        }
    };

    const logout = async () => {
        try {
            setAuthError("");

            await api.post("/users/logout");
        } catch (error) {
            /*
             * Even if the server request fails, clear the
             * local user state. Otherwise the UI can remain
             * stuck looking authenticated.
             */
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
        }
    };

    const updateUser = (nextUser) => {
        setUser(nextUser);
    };

    const clearAuthError = () => {
        setAuthError("");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authError,
                login,
                register,
                logout,
                getCurrentUser,
                refreshUser: getCurrentUser,
                updateUser,
                clearAuthError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
};