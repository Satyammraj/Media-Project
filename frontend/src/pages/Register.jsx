import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
    });

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

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
            const formData = new FormData();

            formData.append("fullName", form.fullName);
            formData.append("email", form.email);
            formData.append("username", form.username);
            formData.append("password", form.password);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            await register(formData);

            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Create Account</h1>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <label>
                    Avatar
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setAvatar(e.target.files[0])
                        }
                    />
                </label>

                <label>
                    Cover Image
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setCoverImage(e.target.files[0])
                        }
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating account..."
                        : "Register"}
                </button>

            </form>
        </div>
    );
};

export default Register;