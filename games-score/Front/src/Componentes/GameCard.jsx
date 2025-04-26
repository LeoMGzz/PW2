import React from "react";
import "./GameCard.css";
import { FaStar } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const GameCard = ({
  id,
  image,
  title,
  platforms,
  genre,
  reviews,
  rating,
  showEditDeleteButtons,
  year,
  ageRating,
  description,
  desarrolladora,
  publicadora,
  platformIDs,
  idCategoria,
  idDesarrolladora,
  idPublicadora
}) => {
  const navigate = useNavigate();
  const handleDelete = async () => {
    const confirmacion = await MySwal.fire({
      title: `¿Eliminar "${title}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
  
    if (!confirmacion.isConfirmed) return;
  
    try {
      const response = await axios.put(`http://localhost:3001/videojuegos/eliminar/${id}`);
      await MySwal.fire({
        icon: "success",
        title: "Eliminado",
        text: response.data.message,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar videojuego:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al eliminar videojuego.",
      });
    }
  };
  

  const goToGamePage = () => {
    navigate("/GamePage", {
      state: {
        id,
        image,
        title,
        platforms,
        genre,
        reviews,
        rating,
        year,
        ageRating,
        description,
        desarrolladora,
        publicadora,
        platformIDs,
        idCategoria,
        idDesarrolladora,
        idPublicadora
      }
    });
  };

  return (
    <div className="game-card">
      <div className="game-link" onClick={goToGamePage}>
        <img src={image} alt={title} className="game-image" />
      </div>
      <div className="game-info">
      <div className="game-header" onClick={goToGamePage}>
      <div className="game-title-link" onClick={goToGamePage}>
  <h3 className="game-title">{title}</h3>
</div>

    <p className="game-rating">
      {rating} <FaStar className="star-icon" />
    </p>
  </div>
        <p className="game-platforms">{platforms}</p>
        <p className="game-details">
        <span className="game-label">Categoría:</span> {genre}
        </p>
        <p className="game-details">
        <span className="game-label">Año:</span> {year} 
        </p>
        <p className="game-details">
        <span className="game-label"> Edad mínima:</span> {ageRating}
        </p>
        <p className="game-details">
        <span className="game-label">Desarrolladora:</span> {desarrolladora}
        </p>
        <p className="game-details">
        <span className="game-label">Publicadora:</span> {publicadora}
        </p>

        <p className="game-reviews">{reviews} Reseñas</p>
        

        {showEditDeleteButtons && (
          <div className="game-actions">
            <button
              className="edit-button"
              onClick={() => {
                navigate("/Videojuegos", {
                  state: {
                    id,
                    title,
                    year,
                    ageRating,
                    description,
                    idCategoria,
                    idDesarrolladora,
                    idPublicadora,
                    platformIDs,
                    image
                  }
                });
              }}
            >
              EDITAR
            </button>

            <button className="delete-button" onClick={handleDelete}>
              ELIMINAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
