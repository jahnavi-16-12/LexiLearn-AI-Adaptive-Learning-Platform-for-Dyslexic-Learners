import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Screening from './pages/Screening';
import ReadingPractice from './pages/ReadingPractice';
import Games from './pages/Games';
import ReadingMap from './pages/ReadingMap';
import DailyChallenge from './pages/DailyChallenge';
import GamePlay from './pages/GamePlay';
import HomeworkHelp from './pages/HomeworkHelp';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Redirect root dashboard to correct role dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  {/* The ProtectedRoute itself handles the redirect internally if no allowedRoles passed */}
                  <div />
                </ProtectedRoute>
              } />

              {/* Role-Specific Dashboards */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Learning Routes */}
              <Route path="/screening" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Screening />
                </ProtectedRoute>
              } />
              <Route path="/games" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Games />
                </ProtectedRoute>
              } />
              <Route path="/games/:gameId" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <GamePlay />
                </ProtectedRoute>
              } />
              <Route path="/reading-map" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ReadingMap />
                </ProtectedRoute>
              } />
              <Route path="/daily-challenge" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DailyChallenge />
                </ProtectedRoute>
              } />

              <Route path="/reading-practice" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ReadingPractice />
                </ProtectedRoute>
              } />
              <Route path="/homework-help" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <HomeworkHelp />
                </ProtectedRoute>
              } />
            </Routes>

            {/* Floating Accessibility Panel available on all pages */}
            <AccessibilityPanel />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
