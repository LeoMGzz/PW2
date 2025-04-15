import React, { useState, useEffect } from "react";
import "./Perfil.css";
import UserReviews from "../Componentes/Reviews2";
import defaultProfilePic from "../Assets/Imagenes/User.png";
import { FaDoorOpen, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import JuegosResenados from "../Componentes/JuegosResenados";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const Perfil = () => {
  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [base64Foto, setBase64Foto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
const [passwords, setPasswords] = useState({ actual: "", nueva: "" });

  const [formData, setFormData] = useState({
    username: "",
    birthdate: "",
    email:""
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedFecha = localStorage.getItem("fechaNacimiento");
    const storedFoto = localStorage.getItem("fotoPerfil");
    const storedEmail = localStorage.getItem("email");

    const fechaFormateada = storedFecha?.split("T")[0] || "";

    setFormData({
      username: storedUsername || "",
      email:storedEmail||"",
      birthdate: fechaFormateada
    });

    if (storedFoto && storedFoto !== "null" && storedFoto !== "undefined") {
      setProfilePic(`data:image/png;base64,${storedFoto}`);
      setBase64Foto(storedFoto);
    } else {
      setProfilePic(defaultProfilePic);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const validarPerfil = () => {
    const hoy = new Date().toISOString().split("T")[0];
    let errores = [];

    if (!formData.username.trim()) errores.push("- El nombre de usuario es obligatorio.");
    if (!formData.birthdate) errores.push("- La fecha de nacimiento es obligatoria.");
    if (formData.birthdate > hoy) errores.push("- La fecha no puede ser en el futuro.");
    if (!base64Foto) errores.push("- Debes seleccionar una imagen.");

    if (errores.length > 0) {
      MySwal.fire({
        icon: "warning",
        title: "Errores en el formulario",
        html: errores.join("<br>"),
      });
      return false;
    }
    

    return true;
  };

  const handleConfirmChanges = async () => {
    if (!validarPerfil()) return;

    const confirmChange = await MySwal.fire({
      title: "¿Confirmar cambios?",
      text: "Se actualizarán tus datos de perfil.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmChange.isConfirmed) return;
    
  
    try {
      const idUsuario = localStorage.getItem("idUsuario");
      const imageBase64 = profilePic.startsWith("data:image/")
        ? profilePic.split(",")[1]
        : localStorage.getItem("fotoPerfil");
  
      const response = await axios.put(`https://pw2-production.up.railway.app/usuarios/editar/${idUsuario}`, {
        username: formData.username,
        fechaNacimiento: formData.birthdate,
        fotoPerfil: imageBase64,
      });
  
      await MySwal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: response.data.message,
      });
      
  
      if (response.status === 200) {
        setIsEditing(false);
        localStorage.setItem("username", formData.username);
        localStorage.setItem("fechaNacimiento", formData.birthdate);
        localStorage.setItem("fotoPerfil", imageBase64);
        window.location.reload();
      }
  
    } catch (error) {
      if (error.response && error.response.data.message) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data.message || "Error al actualizar perfil",
        });
        
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data.message || "Error al actualizar perfil",
        });
        
      }
    }
  };

  const handlePasswordChange = async () => {
    const idUsuario = localStorage.getItem("idUsuario");
  
    if (!passwords.actual || !passwords.nueva) {
      return MySwal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Ambas contraseñas son obligatorias.",
      });
    }
    
  
    try {
      const response = await axios.put(`https://pw2-production.up.railway.app/usuarios/cambiar-contrasena/${idUsuario}`, {
        actual: passwords.actual,
        nueva: passwords.nueva
      });
  
      await MySwal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: response.data.message,
      });
      
      if (response.status === 200) {
        setShowPasswordModal(false);
        setPasswords({ actual: "", nueva: "" });
        window.location.reload();
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al cambiar contraseña",
      });
      
    }
  };
  
  

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
  
        MySwal.fire({
          title: "¿Cambiar foto de perfil?",
          text: "Esta acción actualizará tu imagen.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            setProfilePic(reader.result);
            setBase64Foto(base64);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleLogout = () => {
    MySwal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
      }
    });
  };
  
  const handleDeleteAccount = async () => {
    const confirmar = await MySwal.fire({
      title: "¿Eliminar cuenta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmar.isConfirmed) return;
    

    const idUsuario = localStorage.getItem("idUsuario");

    try {
      const response = await axios.put(`https://pw2-production.up.railway.app/usuarios/eliminar/${idUsuario}`);
      await MySwal.fire({
        icon: "success",
        title: "Cuenta eliminada",
        text: response.data.message,
      });
      
      localStorage.clear();
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al intentar eliminar la cuenta.",
      });
      
    }
  };

  return (
    <div>
      <div className="profile-options">
        <button className="edit-button" onClick={handleEdit}>
          EDITAR CUENTA <FaEdit />
        </button>
        <button className="delete-button" onClick={handleDeleteAccount}>
          BORRAR CUENTA <FaTrash />
        </button>
        <button className="delete-button" onClick={handleLogout}>
          CERRAR SESIÓN <FaDoorOpen />
        </button>
      </div>

      <div className="user-profile-container">
        <div className="profile-info">
          <div className="profile-pic-container">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            {isEditing && (
  <>
    <label htmlFor="profile-pic-input" className="change-pic-button">Cambiar Foto</label>
    <input
      type="file"
      id="profile-pic-input"
      accept="image/*"
      onChange={handleProfilePicChange}
      style={{ display: "none" }}
    />
  </>
)}

          </div>

          <div className="user-details">
          <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
            />

            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {isEditing && (
  <>
    <button className="confirm-button" onClick={() => setShowPasswordModal(true)}>
      CAMBIAR CONTRASEÑA
    </button>

    <button className="confirm-button" onClick={handleConfirmChanges}>
      CONFIRMAR CAMBIOS
    </button>
  </>
)}

      </div>
      

      <div className="GameReview">
        <h1>MIS RESEÑAS</h1>
      </div>
      <JuegosResenados />

      {showPasswordModal && (
  <div className="modal-background">
    <div className="modal-content">
      <h2>Cambiar Contraseña</h2>

      <label>Contraseña Actual</label>
      <input
        type="password"
        value={passwords.actual}
        onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
      />

      <label>Nueva Contraseña</label>
      <input
        type="password"
        value={passwords.nueva}
        onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
      />

      <button onClick={handlePasswordChange}>Confirmar</button>
      <button onClick={() => setShowPasswordModal(false)}>Cancelar</button>
    </div>
  </div>
)}

    </div>
  );
};

export default Perfil;
