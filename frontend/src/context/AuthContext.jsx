import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            console.log("AuthContext: Starting initial session check...");
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                const session = data?.session;

                if (!mounted) return;

                if (session?.user) {
                    console.log("AuthContext: Session found for", session.user.email);
                    setUser(session.user);

                    try {
                        const { data: prof, error: pError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (pError) {
                            console.warn("AuthContext: Profile fetch failed (it might not exist yet):", pError.message);
                        } else if (mounted) {
                            setProfile(prof);
                            console.log("AuthContext: Profile loaded successfully:", prof);
                        }
                    } catch (e) {
                        console.error("AuthContext: Non-critical error fetching profile:", e);
                    }
                } else {
                    console.log("AuthContext: No initial session found.");
                }
            } catch (err) {
                console.error("AuthContext: Critical initialization error:", err.message);
            } finally {
                if (mounted) {
                    setLoading(false);
                    console.log("AuthContext: Initialization loading complete.");
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: Auth event detected:", event);
            if (!mounted) return;

            setUser(session?.user ?? null);

            if (session?.user) {
                console.log("AuthContext: User session found in listener. Clearing loading immediately.");
                // Set loading to false immediately to unblock rendering
                setLoading(false);

                // Fetch profile in the background WITHOUT awaiting it in the listener main flow
                (async () => {
                    try {
                        console.log("AuthContext: Fetching profile in background...");
                        const { data: prof, error: pError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (pError) throw pError;
                        if (mounted) {
                            setProfile(prof);
                            console.log("AuthContext: Profile loaded in background for", session.user.email);
                        }
                    } catch (e) {
                        console.warn("AuthContext: Background profile fetch missed/failed:", e.message);
                    }
                })();
            } else {
                setProfile(null);
                setLoading(false);
            }

            console.log("AuthContext: Listener processing sync completion.");
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const role = profile?.role || user?.user_metadata?.role || 'student';

    return (
        <AuthContext.Provider value={{ user, profile, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
