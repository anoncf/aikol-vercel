import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import HowItsBuilt from "./pages/how-its-built";
import HowToUseLea from "./pages/how-to-use-lea";
import { AboutPage } from "@/pages/about-page";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<AboutPage />} />
                <Route path="how-to-use-lea" element={<HowToUseLea />} />
                <Route path="how-its-built" element={<HowItsBuilt />} />
            </Route>
        </Routes>
    );
}

export default App;
