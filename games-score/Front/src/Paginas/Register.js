import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login-Register.css";
import loginImage from "../Assets/Imagenes/LogIn-Register-Background.png";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Register = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    birthdate: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageBase64(reader.result);
        setSelectedImage(reader.result);
      };
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    let newErrors = {};
    let errorMessages = [];

    if (!formData.email) {
      newErrors.email = "- El email es obligatorio.";
      errorMessages.push("- El email es obligatorio.");
    }
    if (!formData.username) {
      newErrors.username = "- El nombre de usuario es obligatorio.";
      errorMessages.push("- El nombre de usuario es obligatorio.");
    }
    if (!formData.password) {
      newErrors.password = "- La contraseña es obligatoria.";
      errorMessages.push("- La contraseña es obligatoria.");
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "- La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.";
      errorMessages.push(newErrors.password);
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "- La fecha de nacimiento es obligatoria.";
      errorMessages.push("- La fecha de nacimiento es obligatoria.");
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (formData.birthdate > today) {
        newErrors.birthdate = "- La fecha de nacimiento no puede ser mayor al día de hoy.";
        errorMessages.push(newErrors.birthdate);
      }
    }

    if (!imageBase64) {
      newErrors.image = "- Debes seleccionar una imagen.";
      errorMessages.push("- Debes seleccionar una imagen.");
    }

    setErrors(newErrors);

    if (errorMessages.length > 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Errores en el formulario',
        html: errorMessages.join("<br>"),
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:3001/register", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        birthdate: formData.birthdate,
        image: imageBase64,
      });

      await MySwal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Por favor, inicia sesión.',
        confirmButtonText: 'OK'
      });

      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Ocurrió un error al intentar registrar el usuario.";

      MySwal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: errorMsg,
      });
    }
  };

  return (
    <div className="login-register-container">
      <div className="login-register-left">
        <img src={loginImage} alt="Login-register" className="login-register-image" />
        <div className="register-overlay-text">
          <h1>REGÍSTRATE</h1>
        </div>
      </div>
      <div className="register-right">
        <form id="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-box">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="input-box">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} />
            </div>
          </div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />

          <label>Fecha de Nacimiento</label>
          <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />

          <div className="icon-container">
            <label>ICON</label>
            <label htmlFor="file-input" className="user-icon">
              {selectedImage ? (
                <img src={selectedImage} alt="User Icon" className="preview-image" />
              ) : (
                <span className="icon-placeholder">+</span>
              )}
            </label>
            <input type="file" id="file-input" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </div>

          <button type="submit" id="register-button">Registrar</button>
        </form>
        <h4>¿Ya tienes una cuenta?</h4>
        <Link to="/login">
          <button className="LoginRedirect">Inicia sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Register;
