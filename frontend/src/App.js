import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WriteOffsPage from './pages/WriteOffsPage';
import ReportsPage from './pages/ReportsPage';
import PrivateRoute from './components/PrivateRoute';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/write-offs"
                    element={
                        <PrivateRoute>
                            <WriteOffsPage />
                        </PrivateRoute>
                    }
                />
		<Route
    			path="/equipment/:id"
    			element={
        			<PrivateRoute>
            			<EquipmentDetailPage />
        			</PrivateRoute>
		    	}
		/>
                <Route
                    path="/reports"
                    element={
                        <PrivateRoute>
                            <ReportsPage />
                        </PrivateRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
