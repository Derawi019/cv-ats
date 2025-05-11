import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Applications from './pages/Applications';

// Create theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/jobs"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Jobs />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/candidates"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Candidates />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Profile />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/resume-analysis"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <ResumeAnalysis />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/applications"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Applications />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 