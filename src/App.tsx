import { Outlet, Route, Routes } from "react-router-dom";
import Agents from "./Agents";
import "./App.css";
import { AboutPage } from "./pages/about-page";

function Layout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Agents />
            <Outlet />
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<AboutPage />} />
            </Route>
        </Routes>
    );
}

export default App;
