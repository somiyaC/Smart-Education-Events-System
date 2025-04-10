"use client";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

interface AppContextType {
  userId: string;
  setUserId: (value: string) => void;
  userRole: string;
  setUserRole: (value: string) => void;
  isAdmin: boolean;
  isOrganizer: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const isAdmin = userRole === "admin";
  const isOrganizer = userRole === "organizer";

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUserRole = localStorage.getItem("role");

    if (storedUserId) setUserId(storedUserId);
    if (storedUserRole) setUserRole(storedUserRole);
  }, []);

  // Update localStorage when values change
  useEffect(() => {
    if (userId) {
      localStorage.setItem("user_id", userId);
      setUserId(userId);
    }
    if (userRole) {
     localStorage.setItem("role", userRole);
     setUserRole(userRole);
    }

  }, [userId, userRole]);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        userRole,
        setUserRole,
        isAdmin,
        isOrganizer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
