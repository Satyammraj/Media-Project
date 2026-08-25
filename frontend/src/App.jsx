import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import VideoDetails from "./pages/VideoDetails";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<VideoDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
        </Routes>
    );
}

export default App;