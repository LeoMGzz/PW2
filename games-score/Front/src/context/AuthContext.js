import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
  const [log, setLog] = useState(0); 

  useEffect(() => {
    const storedRol = parseInt(localStorage.getItem("rol"), 10) || 0;
    setLog(storedRol === 1 ? 1 : storedRol === 2 ? 2 : 0);
  }, []);

  return (
    <AuthContext.Provider value={{ log, setLog }}>
      {children}
    </AuthContext.Provider>
  );
};
