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
                </ul>
            </nav>
            <Outlet />
        </>
    );
}
