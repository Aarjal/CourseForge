import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/login";
import Home from "./pages/home";
import Browse from "./pages/browse";
import CourseDetails from "./pages/courseDetails";
import Quiz from "./pages/quiz";
import Admin from "./pages/admin";
import NotFound from "./pages/notFound";

import "./App.css";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CourseProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CourseProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
