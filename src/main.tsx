import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import Index from "./routes";
import Triange from "./routes/triangle/triangle";
import FirstVertexBuffer from "./routes/first_vertex_buffer/FirstVertexBuffer";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            { index: true, element: <Index /> },
            { path: "/triangle", element: <Triange /> },
            { path: "/first_vertex_buffer", element: <FirstVertexBuffer /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
