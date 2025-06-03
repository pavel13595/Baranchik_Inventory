import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export type UserRole = "admin" | "manager";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (userId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default users
  const users: User[] = [
    { id: "user1", fullName: "Гладнева Е.А.", role: "admin" },
    { id: "user2", fullName: "Хитрук А.А.", role: "manager" }
  ];
  
  // Auto-login with the first user (admin)
  const [currentUser, setCurrentUser] = React.useState<User | null>(users[0]);
  
  // Login function (not needed for auto-login, but kept for API compatibility)
  const login = async (userId: string): Promise<void> => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      throw new Error("User not found");
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };
  
  // Auto-login effect
  React.useEffect(() => {
    // Check if we have a stored user
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // Auto-login with the first user
      setCurrentUser(users[0]);
      localStorage.setItem("currentUser", JSON.stringify(users[0]));
    }
  }, []);
  
  const value = {
    currentUser,
    users,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};