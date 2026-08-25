import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import App from "./App";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error(
        "Root element was not found. Make sure index.html contains <div id=\"root\"></div>."
    );
}

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);