import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Role, 2: Form
    const [role, setRole] = useState(null); // 'student' | 'parent'
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        grade: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatarVariant: 0
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: role, // 'student' or 'parent'
                        email: formData.email, // Store email in metadata for linking
                        age: role === 'student' ? formData.age : null,
                        grade: role === 'student' ? formData.grade : null,
                        avatar_variant: role === 'student' ? formData.avatarVariant : null
                    }
                }
            });

            if (error) throw error;

            // 2. Manual Profile Creation (Safe Guard)
            if (data?.user) {
                console.log("Signup: Creating profile for", role);
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: formData.fullName,
                    role: role,
                    age: role === 'student' ? parseInt(formData.age) : null,
                    grade: role === 'student' ? formData.grade : null,
                    avatar_variant: role === 'student' ? formData.avatarVariant : null,
                    current_level: 1
                });

                if (profileError) {
                    console.error("Signup: Profile creation failed:", profileError.message);
                    // If upsert fails, the app might fallback to 'student'
                } else {
                    console.log("Signup: Profile created successfully with role:", role);
                }
            }

            alert("Account created successfully! Please log in.");
            navigate('/login');
        } catch (error) {
            console.error("Signup: Exception:", error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in">

                {/* Visual Side Panel */}
                <div className={`w-full md:w-5/12 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500
                    ${role === 'student' ? 'bg-brand-primary' : role === 'parent' ? 'bg-slate-800' : 'bg-brand-blue'}
                `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 background-pattern"></div>

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity duration-200">
                            <span className="text-3xl">🐱</span>
                            <span className="font-black font-dyslexic text-xl tracking-tight">LexiLearn</span>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
                            {step === 1 ? "Join the Adventure!" : role === 'student' ? "Create Your Hero!" : "Parent Portal"}
                        </h1>
                        <p className="text-base md:text-lg opacity-90 leading-relaxed tracking-normal">
                            {step === 1 ? "Start your personalized reading journey today." :
                                role === 'student' ? "Choose your avatar and tell us a bit about yourself." :
                                    "Monitor progress, get insights, and support your child's learning."}
                        </p>
                    </div>

                    {/* Mascot Decoration */}
                    <div className="relative z-10 mt-auto">
                        {role === 'student' && <div className="text-8xl md:text-9xl animate-bounce-slow">🦁</div>}
                        {role === 'parent' && <div className="text-8xl md:text-9xl">📊</div>}
                        {!role && <div className="text-8xl md:text-9xl animate-float">🚀</div>}
                    </div>
                </div>

                {/* Form Area */}
                <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto">
                    {step === 1 ? (
                        <div className="h-full flex flex-col justify-center animate-slide-up">
                            <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center tracking-tight">Who is signing up?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg mx-auto">
                                <button
                                    onClick={() => handleRoleSelect('student')}
                                    className="p-8 rounded-xl border-2 border-slate-200 hover:border-brand-primary hover:bg-blue-50/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group text-center"
                                >
                                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">🎓</div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1.5 tracking-tight">Student</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">I want to learn and play games!</p>
                                </button>

                                <button
                                    onClick={() => handleRoleSelect('parent')}
                                    className="p-8 rounded-xl border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group text-center"
                                >
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">👨‍👩‍👧</div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1.5 tracking-tight">Parent/Teacher</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">I want to track progress.</p>
                                </button>
                            </div>
                            <div className="mt-12 text-center text-slate-600">
                                Already have an account? <Link to="/login" className="text-brand-primary font-semibold hover:underline transition-all">Log In</Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="max-w-md mx-auto animate-slide-up space-y-6">
                            <button onClick={() => setStep(1)} type="button" className="text-sm text-slate-500 font-semibold hover:text-brand-primary mb-4 flex items-center gap-1 transition-colors">
                                ← Back
                            </button>

                            {/* Avatar Picker for Students */}
                            {role === 'student' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-normal">Choose Your Avatar</label>
                                    <div className="flex justify-center gap-3">
                                        {[0, 1, 2, 3].map(v => (
                                            <div
                                                key={v}
                                                onClick={() => setFormData({ ...formData, avatarVariant: v })}
                                                className={`cursor-pointer transition-all duration-200 hover:scale-110 ${formData.avatarVariant === v ? 'ring-4 ring-brand-primary rounded-full scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            >
                                                <Avatar variant={v} size="md" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Full Name</label>
                                <input
                                    required
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                    placeholder="e.g. Aarav Patel"
                                />
                            </div>

                            {role === 'student' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Age</label>
                                        <input
                                            required
                                            name="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                            placeholder="7"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Class/Grade</label>
                                        <input
                                            required
                                            name="grade"
                                            value={formData.grade}
                                            onChange={handleChange}
                                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                            placeholder="2nd"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Email Address</label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                    placeholder="hello@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Password</label>
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-normal">Confirm Password</label>
                                <input
                                    required
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 font-normal text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-brand-primary text-white font-semibold py-3.5 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 mt-8 flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading && <span className="animate-spin text-xl">⏳</span>}
                                {loading ? "Creating Account..." : "Create Account 🚀"}
                            </button>

                            <p className="text-center text-sm text-slate-600 mt-4 pt-2">
                                Already have an account? <Link to="/login" className="text-brand-primary font-semibold hover:underline transition-all">Log In</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
