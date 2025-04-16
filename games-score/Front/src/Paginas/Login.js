import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";  
import "./Login-Register.css";
import loginImage from "../Assets/Imagenes/LogIn-Register-Background.png";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      MySwal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }

    try {
      const response = await axios.post("https://pw-2-7ybuch6af-leos-projects-ff2b9494.vercel.app/login", {
        email: email,
        password: password,
      });

      if (response.data.message === "Encontrado") {
        const { idUsuario, username, email, fechaNacimiento, fotoPerfil, rol, estatus } = response.data;

        localStorage.setItem("idUsuario", idUsuario);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        localStorage.setItem("fechaNacimiento", fechaNacimiento);
        localStorage.setItem("fotoPerfil", fotoPerfil);
        localStorage.setItem("rol", rol);
        localStorage.setItem("estatus", estatus);

        window.dispatchEvent(new Event("storage"));

        await MySwal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${username}!`,
          showConfirmButton: false,
          timer: 1500
        });

        navigate("/"); 
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'Correo o contraseña incorrectos.',
        });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.response?.data || error);

      const errorMsg = error.response?.data?.message || "Ocurrió un error al intentar iniciar sesión.";

      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
    }
  };

  return (
    <div className="login-register-container">
      <div className="login-register-left">
        <img src={loginImage} alt="Login-register" className="login-register-image" />
        <div className="login-overlay-text">
          <h1>INICIA SESIÓN</h1>
        </div>
      </div>

      <div className="login-right">
        <form id="login-form" onSubmit={handleSubmit}>
          <label htmlFor="Email-login">EMAIL</label>
          <input
            type="text"
            id="Email-login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="Contraseña-login">CONTRASEÑA</label>
          <input
            type="password"
            id="Contraseña-login"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" id="login-button">Iniciar Sesión</button>
        </form>

        <h4>¿No tienes una cuenta?</h4>
        <Link to="/Register">
          <button className="RegisterRedirect">Regístrate</button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
