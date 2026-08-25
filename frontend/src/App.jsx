import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
    const [message, setMessage] = useState("Connecting...");
    const [error, setError] = useState("");

    useEffect(() => {
        const testBackend = async () => {
            try {
                const response = await api.get("/healthcheck");

                console.log("Backend response:", response.data);

                setMessage(response.data.message);
            } catch (error) {
                console.error("Backend error:", error);
                console.error("Response:", error.response);
                console.error("Request:", error.request);
                console.error("Message:", error.message);

                setError(error.message);
            }
        };

        testBackend();
    }, []);

    return (
        <div>
            <h1>Media Project</h1>

            <p>{message}</p>

            {error && <p>{error}</p>}
        </div>
    );
}

export default App;