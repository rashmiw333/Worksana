
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Signup from "./pages/Signup";
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import TaskDetails from "./pages/TaskDetails";
import Teams from "./pages/Teams";
import Reports from "./pages/Reports";
import ProjectManagement from "./pages/ProjectManagement";

// Redirect logged-in users away from Login and Signup
const PublicRoute = ({ children }) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Public routes */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/tasks"
              element={<Tasks />}
            />

            <Route path="/tasks/add" element={<AddTask />} />

            <Route path="/tasks/edit/:id" element={<EditTask />}/>

            <Route path="/tasks/:id" element={<TaskDetails />} />

            <Route path="/teams" element={<Teams />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/projects" element={<ProjectManagement />} />

          </Route>

          <Route element={<ProtectedRoute />}>
           <Route path="/auth-test" element={<h1>Authentication Successful</h1>}/>
          </Route>

          {/* Handle unknown URLs */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
