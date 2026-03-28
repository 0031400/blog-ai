import { CssBaseline, ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminPage, HomePage, PostDetailPage } from "./pages";
import { blogTheme } from "./theme/blogTheme";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function App() {
    return (
        <ThemeProvider theme={blogTheme}>
            <CssBaseline />
            <Routes>
                <Route
                    path="/"
                    element={<HomePage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/admin"
                    element={<AdminPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/admin/recycle"
                    element={<AdminPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/admin/categories"
                    element={<AdminPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/admin/tags"
                    element={<AdminPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/admin/posts/editor"
                    element={<AdminPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route
                    path="/posts/:slug"
                    element={<PostDetailPage apiBaseUrl={apiBaseUrl} />}
                />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
