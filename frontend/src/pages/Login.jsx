import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(form);

            navigate("/");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>
        </div>
    );
};

export default Login;