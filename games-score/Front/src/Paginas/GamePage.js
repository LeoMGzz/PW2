import React, { useEffect, useState } from "react";
import "./GamePage.css";
import "../Componentes/GameCard.css";
import UserReviews from "../Componentes/Reviews";
import { FaStar, FaPaperPlane } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state;
  const [selectedRating, setSelectedRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(null);  
  const [hasUserReview, setHasUserReview] = useState(false);
  const [reloadReviews, setReloadReviews] = useState(false);



  const fotoPerfil = localStorage.getItem("fotoPerfil");
  const userImage = fotoPerfil
    ? `data:image/png;base64,${fotoPerfil}`
    : require("../Assets/Imagenes/User.png");

    useEffect(() => {
      fetchUpdatedRating();
      checkUserReview();
    }, []);
    
    


  if (!game) {
    return (
      <div className="game-detail-container">
        <p>No se encontraron datos del juego.</p>
        <button onClick={() => navigate("/")}>Volver</button>
      </div>
    );
  }

  const fetchUpdatedRating = async () => {
    try {
      const response = await axios.get(`https://pw2-production.up.railway.app/videojuegos/rating/${game.id}`);
      setRating(response.data.rating);
      setReviewsCount(response.data.reviews);
    } catch (error) {
      console.error("Error al recargar rating:", error);
    }
  };

  const checkUserReview = async () => {
    try {
      const idUsuario = localStorage.getItem("idUsuario");
      const res = await axios.get(`https://pw2-production.up.railway.app/resenas/activas/${game.id}`);
      const existe = res.data.some((r) => r.autorId === parseInt(idUsuario));
      setHasUserReview(existe);
    } catch (error) {
      console.error("Error al verificar reseña del usuario:", error);
    }
  };
  

  const handleSendReview = async () => {
    const idUsuario = localStorage.getItem("idUsuario");
    if (!idUsuario || !selectedRating || commentText.trim() === "") {
      MySwal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Debes completar todos los campos y seleccionar una calificación.",
      });
      return;
    }
    

    try {
      const response = await axios.post("https://pw2-production.up.railway.app/resenas/crear", {
        usuario: idUsuario,
        juego: game.id,
        calificacion: selectedRating,
        descripcion: commentText.trim(),
      });

      await MySwal.fire({
        icon: "success",
        title: "¡Reseña enviada!",
        text: response.data.message,
      });
      
      setSelectedRating(0);
      setCommentText("");
      await fetchUpdatedRating();
window.location.reload();

    } catch (error) {
      console.error("Error al enviar reseña:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al enviar la reseña.",
      });
      
    }
  };

  const handleDeleteReview = async (idReseña) => {
    const confirmar = await MySwal.fire({
      title: "¿Eliminar reseña?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmar.isConfirmed) return;
    
  
    try {
      await axios.delete(`https://pw2-production.up.railway.app/resenas/eliminar/${idReseña}`);
      await MySwal.fire({
        icon: "success",
        title: "Reseña eliminada",
      });
      
      await fetchUpdatedRating();
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al eliminar la reseña.",
      });
      
    }
  };
  
 

  return (
    <div className="game-detail-container">
      <div className="game-detail-page">
        <img src={game.image} alt={game.title} className="game-image-page" />

        <div className="game-info-page">
          <h2 className="game-title-page">{game.title}</h2>
          <p className="game-platforms-page">
            {game.platforms
              ? game.platforms.split(", ").map((platform, index) => (
                  <span key={index}>
                    <a>{platform}</a>
                    {index !== game.platforms.split(", ").length - 1 ? ", " : ""}
                  </span>
                ))
              : "Plataformas no disponibles"}
          </p>
          <p className="game-genre-page">Categoría: {game.genre}</p>
          <p className="game-details-page">Año de Lanzamiento: {game.year}</p>
          <p className="game-details-page">Edad mínima: {game.ageRating}</p>
          <p className="game-details-page">Desarrolladora: {game.desarrolladora}</p>
          <p className="game-details-page">Publicadora: {game.publicadora}</p>
          <p className="game-description-page">Descripción: {game.description}</p>
          <p className="game-reviews-page">{reviewsCount} Reseñas</p>
        </div>

        <div className="game-rating-page">
          <h1>{parseFloat(rating).toFixed(1)}/5</h1>
          <FaStar className="star-icon-page" />
        </div>
      </div>

      <div className="game-reviews">
      <UserReviews
  gameId={game.id}
  reloadTrigger={reloadReviews}
  onDeleteReview={handleDeleteReview}
/>


      </div>

      {!hasUserReview && (
  <div className="comment-box">
    
        <img src={userImage} alt="User Avatar" className="user-avatar" />
        <input
          type="text"
          placeholder="Escribe lo que piensas"
          className="comment-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <FaPaperPlane className="send-icon" onClick={handleSendReview} />

        <div className="comment-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className="star"
              style={{ color: i < selectedRating ? "yellow" : "white" }}
              onClick={() => setSelectedRating(i + 1)}
            />
          ))}
        </div>
        </div>
)}
    </div>
  );
};

export default GamePage;