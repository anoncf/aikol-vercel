// In your router configuration file (e.g., App.jsx or router.jsx)
import { CharterOverslew } from "@/components/charter-overslew";
import { createBrowserRouter } from "react-router-dom";
import Agent from "./Agent";
import Character from "./Character";
import Chat from "./Chat";
import HowItsBuilt from "./components/how-its-built";
import HowToUseLea from "./components/how-to-use-lea";
import Layout from "./Layout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <CharterOverslew />,
            },
            {
                path: ":agentId",
                children: [
                    {
                        path: "",
                        element: <Agent />,
                    },
                    {
                        path: "chat",
                        element: <Chat />,
                    },
                    {
                        path: "character",
                        element: <Character />,
                    },
                ],
            },
            {
                path: "how-to-use-lea",
                element: <HowToUseLea />,
            },
            {
                path: "how-its-built",
                element: <HowItsBuilt />,
            },
        ],
    },
]);
