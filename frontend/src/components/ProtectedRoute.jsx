import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        console.log("ProtectedRoute: Auth is still loading...");
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        console.log("ProtectedRoute: No user found, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute: User found. Role:", role, "Path:", location.pathname);

    const isRootDashboard = location.pathname === '/dashboard';

    if ((allowedRoles && !allowedRoles.includes(role) && role !== 'parent') || isRootDashboard) {
        // Correctly redirect mismatched roles or root /dashboard to their own dashboards
        // Exception: Parents are allowed to see Student dashboards for "Preview Mode"
        const redirectPath = role === 'parent' ? '/parent/dashboard' : '/student/dashboard';
        console.log("ProtectedRoute: Role mismatch, redirecting to", redirectPath);
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
