import React, { useEffect, useState } from "react";
import axios from "axios";
import "./JuegosResenados.css";
import { useNavigate } from "react-router-dom";

const JuegosResenados = () => {
  const [juegos, setJuegos] = useState([]);
  const idUsuario = localStorage.getItem("idUsuario");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJuegos = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/resenas/juegos-por-usuario/${idUsuario}`);
        setJuegos(res.data);
      } catch (err) {
        console.error("Error al obtener juegos reseñados:", err);
      }
    };

    fetchJuegos();
  }, [idUsuario]);

  const irADetalle = async (juego) => {
    try {
      const res = await axios.get(`http://localhost:3001/videojuegos/detalles/${juego.id}`);
      const data = res.data;
  
      navigate("/GamePage", {
        state: {
          ...data,
          image: `data:image/jpeg;base64,${data.image}`
        }
      });
    } catch (error) {
      console.error("Error al obtener detalles del juego:", error);
      alert("No se pudo cargar la información del juego.");
    }
  };
  

  return (
    <div className="reseñados-container">
      <div className="reseñados-grid">
        {juegos.length === 0 ? (
          <p>No has reseñado ningún juego aún.</p>
        ) : (
          juegos.map((j) => (
            <img
              key={j.id}
              src={`data:image/jpeg;base64,${j.imagen}`}
              alt={j.nombre}
              className="juego-miniatura"
              onClick={() => irADetalle(j)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JuegosResenados;
