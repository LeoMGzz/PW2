import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Categorias.css";
import trashBin from "../Assets/Imagenes/TrashBin.png";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Categorias = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/categorias/activas");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener categorías activas:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "- Error al cargar las categorías activas.",
      });
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "- Todos los campos son obligatorios",
      });
      return;
    }

    try {
      if (categoriaSeleccionada) {
        await axios.put(`https://pw2-production.up.railway.app/categorias/editar/${categoriaSeleccionada}`, {
          nombre,
          descripcion,
        });

        await MySwal.fire({
          icon: "success",
          title: "¡Editado!",
          text: "Categoría editada con éxito",
        });
      } else {
        await axios.post("https://pw2-production.up.railway.app/categorias/crear", {
          nombre,
          descripcion,
        });

        await MySwal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Categoría registrada con éxito",
        });
      }

      setNombre("");
      setDescripcion("");
      setCategoriaSeleccionada(null);
      obtenerCategorias();
    } catch (error) {
      console.error("Error al registrar/editar categoría:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: `- Error: ${error.response?.data?.message || "Error al procesar la solicitud"}`,
      });
    }
  };

  const handleSeleccionar = (categoria) => {
    if (categoriaSeleccionada === categoria.IdCategoria) {
      setCategoriaSeleccionada(null);
      setNombre("");
      setDescripcion("");
    } else {
      setCategoriaSeleccionada(categoria.IdCategoria);
      setNombre(categoria.Nombre);
      setDescripcion(categoria.Descripcion);
    }
  };

  const handleDesactivar = async () => {
    if (!categoriaSeleccionada) return;

    const confirmar = await MySwal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      await axios.put(`https://pw2-production.up.railway.app/categorias/eliminar/${categoriaSeleccionada}`);

      await MySwal.fire({
        icon: "success",
        title: "¡Eliminada!",
        text: "Categoría eliminada con éxito",
      });

      setNombre("");
      setDescripcion("");
      setCategoriaSeleccionada(null);
      obtenerCategorias();
    } catch (error) {
      console.error("Error al desactivar categoría:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error al desactivar la categoría.",
      });
    }
  };

  return (
    <div className="categoria-container">
      <div className="categoria-left-side">
        <h2 className="categoria-registro-text">CATEGORIAS REGISTRADAS</h2>
        <div className="categoria-category-list">
          {categorias.map((categoria) => (
            <div key={categoria.IdCategoria} className="categoria-item">
              <input
                type="checkbox"
                checked={categoriaSeleccionada === categoria.IdCategoria}
                onChange={() => handleSeleccionar(categoria)}
              />
              {categoria.Nombre}
            </div>
          ))}
        </div>
      </div>

      <div className="categoria-right-side">
        <form onSubmit={handleRegistro}>
          <div className="categoria-input-group">
            <div className="categoria-text">NOMBRE DE LA CATEGORÍA</div>
            <input
              type="text"
              className="categoria-input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="categoria-input-group">
            <div className="categoria-text">DESCRIPCIÓN</div>
            <textarea
              className="categoria-textarea-field"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
          </div>
          <div className="categoria-button-group">
            <button type="submit" className="categoria-register-button">
              {categoriaSeleccionada ? "EDITAR CATEGORÍA" : "REGISTRAR NUEVA CATEGORÍA"}
            </button>
            {categoriaSeleccionada && (
              <button
                type="button"
                className="categoria-delete-button"
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

export default Categorias;
