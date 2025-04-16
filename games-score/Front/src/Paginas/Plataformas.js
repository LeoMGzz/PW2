import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Plataformas.css";
import trashBin from "../Assets/Imagenes/TrashBin.png";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Plataformas = () => {
  const [nombre, setNombre] = useState("");
  const [añoLanzamiento, setAñoLanzamiento] = useState("");
  const [plataformas, setPlataformas] = useState([]);
  const [plataformaSeleccionada, setPlataformaSeleccionada] = useState(null); 

  useEffect(() => {
    obtenerPlataformas();
  }, []);

  const obtenerPlataformas = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/plataformas/activas");
      setPlataformas(response.data);
    } catch (error) {
      console.error("Error al obtener plataformas activas:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "- Error al cargar las plataformas activas.",
      });
    }
  };

  const handleRegistro = async (event) => {
    event.preventDefault();

    if (!nombre.trim() || !String(añoLanzamiento).trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "- Todos los campos son obligatorios",
      });
      return;
    }

    if (!/^\d{4}$/.test(añoLanzamiento)) {
      MySwal.fire({
        icon: "warning",
        title: "Año inválido",
        text: "- El año de lanzamiento debe ser un número de 4 dígitos",
      });
      return;
    }

    const año = parseInt(añoLanzamiento);
    if (año < 1901 || año > 2155) {
      MySwal.fire({
        icon: "warning",
        title: "Año fuera de rango",
        text: "- El año debe estar entre 1901 y 2155",
      });
      return;
    }

    try {
      if (plataformaSeleccionada) {
        await axios.put(`https://pw2-production.up.railway.app/plataformas/editar/${plataformaSeleccionada}`, {
          nombre,
          año_lanzamiento: añoLanzamiento,
        });

        await MySwal.fire({
          icon: "success",
          title: "¡Editado!",
          text: "Plataforma editada con éxito",
        });
      } else {
        await axios.post("https://pw2-production.up.railway.app/plataformas/crear", {
          nombre,
          año_lanzamiento: añoLanzamiento,
        });

        await MySwal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Plataforma registrada con éxito",
        });
      }

      setNombre("");
      setAñoLanzamiento("");
      setPlataformaSeleccionada(null);
      obtenerPlataformas();
    } catch (error) {
      console.error("Error al registrar/editar la plataforma:", error.response?.data || error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error en el servidor.",
      });
    }
  };

  const handleEliminar = async () => {
    if (!plataformaSeleccionada) return;

    const result = await MySwal.fire({
      title: "¿Eliminar plataforma?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`https://pw2-production.up.railway.app/plataformas/eliminar/${plataformaSeleccionada}`);

      await MySwal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: "Plataforma eliminada con éxito",
      });

      setNombre("");
      setAñoLanzamiento("");
      setPlataformaSeleccionada(null);
      obtenerPlataformas();
    } catch (error) {
      console.error("Error al eliminar plataforma:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error al eliminar la plataforma.",
      });
    }
  };

  const handleSeleccionarPlataforma = (plataforma) => {
    if (plataformaSeleccionada === plataforma.IdPlataforma) {
      setPlataformaSeleccionada(null);
      setNombre("");
      setAñoLanzamiento("");
    } else {
      setPlataformaSeleccionada(plataforma.IdPlataforma);
      setNombre(plataforma.Nombre);
      setAñoLanzamiento(plataforma.Año_Lanzamiento);
    }
  };

  return (
    <div className="plataforma-container">
      <div className="plataforma-left-side">
        <h2 className="plataforma-registro-text">PLATAFORMAS REGISTRADAS</h2>
        <div className="plataforma-category-list">
          {plataformas.length > 0 ? (
            plataformas.map((plataforma) => (
              <div key={plataforma.IdPlataforma} className="plataforma-item">
                <input
                  type="checkbox"
                  checked={plataformaSeleccionada === plataforma.IdPlataforma}
                  onChange={() => handleSeleccionarPlataforma(plataforma)}
                />
                {plataforma.Nombre} ({plataforma.Año_Lanzamiento})
              </div>
            ))
          ) : (
            <p>No hay plataformas activas registradas.</p>
          )}
        </div>
      </div>

      <div className="plataforma-right-side">
        <form onSubmit={handleRegistro}>
          <div className="plataforma-input-group">
            <div className="plataforma-text">NOMBRE DE LA PLATAFORMA</div>
            <input
              type="text"
              className="plataforma-input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="plataforma-input-group">
            <div className="plataforma-text">AÑO DE LANZAMIENTO</div>
            <input
              type="text"
              className="plataforma-textarea-field"
              value={añoLanzamiento}
              onChange={(e) => setAñoLanzamiento(e.target.value)}
            />
          </div>

          <div className="plataforma-button-group">
            <button type="submit" className="plataforma-register-button">
              {plataformaSeleccionada ? "EDITAR PLATAFORMA" : "REGISTRAR NUEVA PLATAFORMA"}
            </button>

            {plataformaSeleccionada && (
              <button type="button" className="plataforma-delete-button" onClick={handleEliminar}>
                ELIMINAR
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Plataformas;
