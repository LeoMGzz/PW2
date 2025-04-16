import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Companias.css";
import trashBin from "../Assets/Imagenes/TrashBin.png";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Companias = () => {
  const [nombre, setNombre] = useState("");
  const [companias, setCompanias] = useState([]);
  const [companiaSeleccionada, setCompaniaSeleccionada] = useState(null);

  useEffect(() => {
    obtenerCompanias();
  }, []);

  const obtenerCompanias = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/companias/activas");
      setCompanias(response.data);
    } catch (error) {
      console.error("Error al obtener compañías activas:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "- Error al cargar las compañías activas.",
      });
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "- El nombre es obligatorio",
      });
      return;
    }

    try {
      if (companiaSeleccionada) {
        await axios.put(`https://pw2-production.up.railway.app/companias/editar/${companiaSeleccionada}`, {
          nombre: nombre,
        });
        await MySwal.fire({
          icon: "success",
          title: "Editado",
          text: "¡Compañía editada con éxito!",
        });
      } else {
        await axios.post("https://pw2-production.up.railway.app/companias/crear", {
          nombre: nombre,
        });
        await MySwal.fire({
          icon: "success",
          title: "Registrado",
          text: "¡Compañía registrada con éxito!",
        });
      }

      setNombre("");
      setCompaniaSeleccionada(null);
      obtenerCompanias();
    } catch (error) {
      console.error("Error al registrar/editar compañía:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: `- Error: ${error.response?.data?.message || "Error al procesar la solicitud"}`,
      });
    }
  };

  const handleSeleccionar = (compania) => {
    if (companiaSeleccionada === compania.IdCompañia) {
      setCompaniaSeleccionada(null);
      setNombre("");
    } else {
      setCompaniaSeleccionada(compania.IdCompañia);
      setNombre(compania.Nombre);
    }
  };

  const handleDesactivar = async () => {
    if (!companiaSeleccionada) return;

    const confirmar = await MySwal.fire({
      title: "¿Eliminar compañía?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axios.put(`https://pw2-production.up.railway.app/companias/eliminar/${companiaSeleccionada}`);
      await MySwal.fire({
        icon: "success",
        title: "Desactivada",
        text: "Compañía desactivada con éxito",
      });
      setNombre("");
      setCompaniaSeleccionada(null);
      obtenerCompanias();
    } catch (error) {
      console.error("Error al desactivar compañía:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error al desactivar la compañía.",
      });
    }
  };

  return (
    <div className="compania-container">
      <div className="compania-left-side">
        <h2 className="compania-registro-text">COMPAÑIAS REGISTRADAS</h2>
        <div className="compania-category-list">
          {companias.map((compania) => (
            <div key={compania.IdCompañia} className="compania-item">
              <input
                type="checkbox"
                checked={companiaSeleccionada === compania.IdCompañia}
                onChange={() => handleSeleccionar(compania)}
              />
              {compania.Nombre}
            </div>
          ))}
        </div>
      </div>
      <div className="compania-right-side">
        <form onSubmit={handleRegistro}>
          <div className="compania-input-group">
            <div className="compania-text">NOMBRE DE LA COMPAÑÍA</div>
            <input
              type="text"
              className="compania-input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="compania-button-group">
            <button type="submit" className="compania-register-button">
              {companiaSeleccionada ? "EDITAR COMPAÑÍA" : "REGISTRAR NUEVA COMPAÑÍA"}
            </button>

            {companiaSeleccionada && (
              <button
                type="button"
                className="compania-delete-button"
                onClick={handleDesactivar}
              >
                ELIMINAR
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Companias;
