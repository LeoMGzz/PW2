import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { log } = useContext(AuthContext);

  if (soloAdmin && log !== 2) {
    return <Navigate to="/" />; 
  }

  return children;
};

export default RutaProtegida;
