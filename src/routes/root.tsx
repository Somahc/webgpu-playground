import { Link, Outlet } from "react-router-dom";
import "./root.css";

export default function Root() {
    return (
        <>
            <h1>WebGPU Playground</h1>
            <nav>
                <ul className="nav-list">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/triangle">Triangle</Link>
                    </li>
                    <li>
                        <Link to="/first_vertex_and_index_buffer">
                            First Vertex and Index Buffer
                        </Link>
                    </li>
                    <li>
                        <Link to="/uniform_buffer">Uniform Buffer</Link>
                    </li>
                    <li>
                        <Link to="/texture">Texture</Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </>
    );
}
