import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('student'); // 'student' | 'parent'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Attempting login for:", email);
        const loginTimeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                alert("Login is taking longer than expected. Please check your internet connection or if the Supabase project is active.");
            }
        }, 10000);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            clearTimeout(loginTimeout);
            if (error) {
                console.error("Login: Supabase reported error:", error.message);
                throw error;
            }

            if (data?.user) {
                console.log("Login: Success! User ID:", data.user.id);
                localStorage.setItem('loginRoleIntent', role);

                // Allow a tiny delay for AuthContext state to catch up before navigating
                console.log("Login: Redirecting to dashboard...");
                navigate('/dashboard');
            } else {
                console.warn("Login: Sign-in returned no user data.");
                setLoading(false);
            }
        } catch (error) {
            clearTimeout(loginTimeout);
            console.error("Login: Exception during process:", error.message);
            alert("Login Failed: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in">

                {/* Visual Side Panel */}
                <div className={`w-full md:w-5/12 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500
                    ${role === 'student' ? 'bg-brand-primary' : 'bg-slate-800'}
                `}>
                    <div className="absolute inset-0 opacity-10 background-pattern"></div>
                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity duration-200">
                            <span className="text-3xl">🐱</span>
                            <span className="font-black font-dyslexic text-xl tracking-tight">LexiLearn</span>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
                            Welcome Back!
                        </h1>
                        <p className="text-base md:text-lg opacity-90 leading-relaxed tracking-normal">
                            {role === 'student' ? "Ready to continue your adventure? Your friends missed you!" :
                                "Log in to check your child's progress and new achievements."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="text-8xl md:text-9xl animate-float opacity-80">{role === 'student' ? '🚀' : '📈'}</div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">

                    {/* Role Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-xl mb-10 self-center shadow-sm">
                        <button
                            onClick={() => setRole('student')}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${role === 'student' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span>🎓</span> Student
                        </button>
                        <button
                            onClick={() => setRole('parent')}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${role === 'parent' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span>👨‍👩‍👧</span> Parent
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="max-w-md mx-auto w-full space-y-6 animate-slide-up">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                placeholder="hello@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Password</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm pt-1">
                            <label className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-slate-700 transition-colors">
                                <input type="checkbox" className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20" />
                                <span className="font-normal">Remember me</span>
                            </label>
                            <button type="button" className="text-brand-primary font-semibold hover:underline transition-all">Forgot password?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white font-semibold py-3.5 rounded-lg shadow-md transition-all duration-200 transform hover:shadow-lg hover:-translate-y-0.5 mt-8 flex justify-center items-center gap-2
                                ${role === 'student' ? 'bg-brand-primary hover:bg-blue-600' : 'bg-slate-800 hover:bg-slate-900'}
                                ${loading ? 'opacity-80 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading && <span className="animate-spin text-xl">⏳</span>}
                            {loading ? "Logging in..." : "Log In ➜"}
                        </button>

                        <p className="text-center text-sm text-slate-600 mt-6 pt-2">
                            Don't have an account? <Link to="/signup" className="text-brand-primary font-semibold hover:underline transition-all">Sign Up Free</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
