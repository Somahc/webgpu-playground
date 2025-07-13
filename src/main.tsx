import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import Index from "./routes";
import Triange from "./routes/triangle/triangle";
import FirstVertexAndIndexBuffer from "./routes/first_vertex_and_index_buffer/FirstVertexBuffer";
import UniformBuffer from "./routes/uniform_bufffer/UniformBuffer";
const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            { index: true, element: <Index /> },
            { path: "/triangle", element: <Triange /> },
            {
                path: "/first_vertex_and_index_buffer",
                element: <FirstVertexAndIndexBuffer />,
            },
            { path: "/uniform_buffer", element: <UniformBuffer /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
