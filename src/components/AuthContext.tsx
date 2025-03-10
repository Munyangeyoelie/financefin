// src/components/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string; // Add role to the interface
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role?: string
  ) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  supabase: SupabaseClient;
  isAdmin: boolean; // Add isAdmin property
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserData(await fetchUserData(session.user.id));
      }
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null);
        setUserData(
          session?.user ? await fetchUserData(session.user.id) : null
        );
      });
      setLoading(false);
      return () => subscription.unsubscribe();
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setUserData(await fetchUserData(data.user.id));
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: string = "user"
  ) => {
    setLoading(true);
    try {
      // First, create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || "",
            role: role || "user", // Store role in auth metadata
          },
        },
      });

      if (error) throw error;

      // Then insert the user data into your custom table
      const { error: insertError } = await supabase.from("user").insert([
        {
          id: data.user.id,
          email,
          full_name: fullName || "",
          role: role || "user", // Store role in user table
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        return { error: insertError };
      }

      setUser(data.user);
      setUserData(await fetchUserData(data.user.id));
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute isAdmin based on userData
  const isAdmin = userData?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        signup,
        logout,
        supabase,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
