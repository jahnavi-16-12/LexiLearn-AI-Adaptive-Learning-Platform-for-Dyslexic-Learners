import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';

const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-3">
                    <Avatar variant={3} size="sm" className="border-2 border-brand-blue" />
                    <span className="text-2xl font-black text-brand-blue font-dyslexic tracking-tight">LexiLearn AI</span>
                </div>
                <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
                    <a href="#features" className="hover:text-brand-blue transition">Features</a>
                    <a href="#how-it-works" className="hover:text-brand-blue transition">How It Works</a>
                    <a href="#about" className="hover:text-brand-blue transition">About</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-brand-blue font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition">Login</Link>
                    <Link to="/signup" className="bg-brand-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Get Started 🚀
                    </Link>
                </div>
            </div>
        </div>
    </nav>
);

const Footer = () => (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <Avatar variant={3} size="sm" className="border-white" />
                    <span className="text-2xl font-black text-white">LexiLearn AI</span>
                </div>
                <p className="text-slate-400 max-w-sm text-lg leading-relaxed">
                    Empowering children with dyslexia through AI-driven personalized learning adventures.
                    Built on Orton-Gillingham methodology.
                </p>
            </div>

            <div>
                <h4 className="font-bold text-lg mb-6">Contact</h4>
                <ul className="space-y-4 text-slate-400">
                    <li>jahnavigoud2004@gmail.com</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 font-medium">
            © 2026 Jahnavi. Final Year Project.
        </div>
    </footer>
);

function Home() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
            <Navbar />

            {/* HERO SECTION */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 rounded-l-[100px] -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left animate-slide-up">
                        <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm mb-6 border border-green-200">
                            ✨ AI-Powered Dyslexia Support
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Learn Smarter.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-green-500">Read Better.</span><br />
                            Grow Faster.
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                            An adaptive reading adventure designed specifically for dyslexic minds. Powered by AI, backed by science.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/signup" className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl hover:bg-blue-600 hover:scale-105 transition-all text-center">
                                Start Free Screening 🎮
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual with NEW AVATARS */}
                    <div className="relative animate-float lg:block hidden">
                        <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/50 shadow-2xl relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar variant={0} size="md" />
                                        <div>
                                            <h4 className="font-bold">Aarav</h4>
                                            <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">"I love the space adventure level!"</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform mt-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar variant={1} size="md" />
                                        <div>
                                            <h4 className="font-bold">Priya</h4>
                                            <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full w-1/2 bg-yellow-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">"The AI coach helps me read."</p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow">
                                <span className="text-4xl">🏆</span>
                            </div>
                            <div className="absolute -bottom-10 -left-5 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                                <span className="text-4xl">📚</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* FEATURES GRID */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">Everything Your Child Needs</h2>
                    <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto">From screening to mastery, we provide a complete ecosystem.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: "🧬", title: "AI Dyslexia Screening", desc: "Get a professional risk assessment score in minutes." },
                            { icon: "🗺️", title: "50-Level Adventure", desc: "A gamified journey that adapts to your child's pace." },
                            { icon: "🤖", title: "Real-Time AI Coach", desc: "Instant, gentle feedback on pronunciation." },
                            { icon: "📊", title: "Progress Analytics", desc: "Detailed dashboards for parents to track improvement." },
                            { icon: "🎮", title: "Fun Learning Games", desc: "Sound Match and Word Builder games turn practice into play." },
                            { icon: "📘", title: "Homework Helper", desc: "Get simplified summaries and dyslexia-friendly text." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group text-left">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-16">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {[
                            { step: "1", title: "SIGN UP", desc: "Create your child's profile (age, grade)" },
                            { step: "2", title: "TAKE TEST", desc: "3-minute voice screening finds reading level" },
                            { step: "3", title: "PLAY ADVENTURE", desc: "50-level map unlocks with stars & games" },
                            { step: "4", title: "GET HOMEWORK HELP", desc: "Upload schoolwork → AI creates summaries, quizzes, dyslexia-friendly PDFs" },
                            { step: "5", title: "GROW TOGETHER", desc: "Parents see charts + AI tips daily" }
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg relative z-10">
                                    {item.step}
                                </div>
                                <h3 className="text-sm font-bold mb-2 uppercase tracking-wider">{item.title}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                {i < 4 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-slate-100 -z-0"></div>}
                            </div>
                        ))}
                    </div>
                    <p className="mt-16 text-xl font-bold text-brand-primary flex items-center justify-center gap-2">
                        Simple 5-step journey from screening to confident reading + homework success! 🚀
                    </p>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="py-24 bg-blue-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-8">Transforming Dyslexia Learning</h2>
                    <p className="text-xl text-slate-700 leading-relaxed mb-12">
                        LexiLearn AI combines cutting-edge speech recognition with proven Orton-Gillingham methods to help children aged 5-12 overcome reading challenges. Our platform finds reading difficulties early, guides kids through personalized practice, and gives parents clear progress insight.
                    </p>

                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 text-left mb-12">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">🧪</span>
                            Science + Technology
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="text-green-500 text-xl flex-shrink-0">✅</div>
                                <p className="text-lg text-slate-600 font-medium">
                                    <span className="font-black text-slate-900">Orton-Gillingham Proven Method:</span> 50 levels follow exact research-backed progression from simple words to full stories.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-green-500 text-xl flex-shrink-0">✅</div>
                                <p className="text-lg text-slate-600 font-medium">
                                    <span className="font-black text-slate-900">AI-Powered Precision:</span> Speech analysis + smart agents adapt to each child's unique reading patterns.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-12">
                        <div className="flex flex-col items-center">
                            <Avatar variant={2} size="lg" className="mb-4" />
                            <span className="font-bold text-slate-600">For Students</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white mb-4">🍎</div>
                            <span className="font-bold text-slate-600">For Teachers</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-brand-primary relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center px-4 relative z-10 text-white">
                    <h2 className="text-4xl md:text-6xl font-black mb-8">Start The Adventure</h2>
                    <Link to="/signup" className="inline-block bg-brand-yellow text-brand-primary px-12 py-5 rounded-full text-xl font-black shadow-2xl hover:bg-white hover:text-brand-primary hover:scale-105 transition-all">
                        Get Started 🚀
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Home;
