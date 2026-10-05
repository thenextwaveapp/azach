import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  convertAnonymousUser: (email: string, password: string) => Promise<{ error: any }>;
  linkGoogleIdentity: (redirectTo?: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      setIsAdmin(!!data && !error);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        isAnonymous: session?.user?.is_anonymous
      });

      // If no session exists, create anonymous user
      if (!session) {
        console.log('[AuthContext] No session found, creating anonymous user');
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.session) {
          console.log('[AuthContext] Anonymous user created:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          setIsAnonymous(true);
        }
      } else {
        console.log('[AuthContext] Existing session found');
        setSession(session);
        setUser(session.user);
        setIsAnonymous(session.user.is_anonymous || false);
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    }).catch((error) => {
      // A rejected promise here (e.g. a stale/invalid refresh token) must not
      // leave the app stuck on the loading screen forever.
      console.error('[AuthContext] Failed to resolve initial session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAnonymous(session?.user?.is_anonymous || false);
      checkAdminStatus(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const convertAnonymousUser = async (email: string, password: string) => {
    if (!isAnonymous) {
      return { error: new Error('User is not anonymous') };
    }

    const { error } = await supabase.auth.updateUser({
      email,
      password,
    });
    return { error };
  };

  const linkGoogleIdentity = async (redirectTo?: string) => {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
    });
    return { error };
  };

  const signOut = async () => {
    // Sign out and create new anonymous user
    await supabase.auth.signOut();
    const { data } = await supabase.auth.signInAnonymously();
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setIsAnonymous(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isAnonymous,
        signIn,
        signInWithGoogle,
        signOut,
        signUp,
        convertAnonymousUser,
        linkGoogleIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};









