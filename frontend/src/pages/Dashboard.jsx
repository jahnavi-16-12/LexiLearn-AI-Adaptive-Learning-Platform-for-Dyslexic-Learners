/* Obsolete: Dashboard logic moved to /pages/StudentDashboard.jsx and /pages/ParentDashboard.jsx */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/student/dashboard'); // Fallback redirect
    }, [navigate]);
    return null;
};

export default DashboardRedirect;
