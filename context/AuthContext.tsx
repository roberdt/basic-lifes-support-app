'use client';

import React, { createContext, useEffect, useContext, useState, ReactNode } from 'react';
import * as authService from '@/services/auth';
import { clearSession, createSession, getSession, saveSession, Session } from '@/lib/session';

/**************************************************
 * User
 * Defines a generic user object that can contain any key-value pairs,
 * allowing for flexibility in the structure of user data returned by the login response
 **************************************************/
interface User {
  [key: string]: unknown;
}

/**************************************************
 * LoginData
 * Defines the structure of the data returned by the login function, which may include a token,
 * user information, user ID, and other relevant fields.
 * The interface allows for optional properties and additional unknown fields to accommodate different API responses.
 **************************************************/
interface LoginData {
  token?: string;
  user?: User;
  userId?: string;
  USER_ID?: string;
  username?: string;
  [key: string]: unknown;
}

/**************************************************
 * AuthContextValue
 * Defines the shape of the authentication context value, which includes the current session,
 * user ID, login and logout functions, and a loading state.
 * This interface ensures that any component consuming the AuthContext will have access to
 * these properties and methods with the correct types.
 **************************************************/
interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  login: (identifier: string, password: string) => Promise<LoginData>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**************************************************
 * AuthProviderProps
 * Defines the props for the AuthProvider component, which includes a single property 'children' of type ReactNode.
 * This allows the AuthProvider to wrap around any child components that need access to the authentication context.
 **************************************************/
interface AuthProviderProps {
  children: ReactNode;
}

/**************************************************
 * AuthProvider()
 * Initializes the authentication context and manages the user session state.
 * On component mount, it checks for an existing session and sets it if found.
 * It also sets up a timer to automatically clear the session when it expires.
 * Provides login and logout functions to manage user authentication.
 * Wraps its children with the AuthContext.Provider to make the authentication state and functions available throughout the component tree.
 **************************************************/
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) setSession(existingSession);
  }, []);

  useEffect(() => {
    if (!session) return;

    const msLeft = session.expiresAt - Date.now();
    if (msLeft <= 0) {
      clearSession();
      setSession(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      clearSession();
      setSession(null);
    }, msLeft);

    return () => window.clearTimeout(timeout);
  }, [session]);

  const login = (identifier: string, password: string): Promise<LoginData> => {
    setLoading(true);
    return authService
      .login(identifier, password)
      .then((data) => {
        const jwt = data.token;
        if (!jwt) {
          throw new Error('Login response did not include a token');
        }

        const userId =
          (data.user?.USER_ID as string) ||
          (data.user?.userId as string) ||
          (data.user?.username as string) ||
          data.USER_ID ||
          data.userId ||
          data.username ||
          identifier;

        const nextSession = createSession(jwt, userId);
        saveSession(nextSession);
        setSession(nextSession);
        return data;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const logout = () => {
    authService.logout();
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, userId: session?.userId ?? null, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};//end of AuthProvider

/**************************************************
 * useAuth()
 * Custom hook that provides access to the authentication context.
 * It uses the useContext hook to consume the AuthContext and returns its value.
 * If the hook is used outside of an AuthProvider, it throws an error to ensure proper usage.
 **************************************************/
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

