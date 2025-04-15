import React, { useState } from "react";
import "./ReviewCard.css";
import { FaStar, FaTrash, FaEdit, FaCheck } from "react-icons/fa";

const ReviewCard = ({ gameImage, gameTitle, initialReviewText, rating, date }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState(initialReviewText);

  // Manejar cambio en el input de reseña
  const handleInputChange = (event) => {
    setReviewText(event.target.value);
  };

  // Habilitar/deshabilitar edición
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Confirmar cambios en la reseña
  const handleConfirmEdit = () => {
    setIsEditing(false);
    alert("Reseña actualizada exitosamente.");
  };

  // Generar estrellas basadas en la calificación
  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "star filled-star" : "star"} />
    ));
  };

  return (
    <div className="review-card">
      {/* Imagen del juego */}
      <img src={gameImage} alt={gameTitle} className="game-image-review" />

      {/* Contenido de la reseña */}
      <div className="review-content">
        <div className="review-header">
          <strong>Opinaste en {gameTitle}</strong>
          <span className="review-date">{date}</span>
        </div>

        {/* Input para la reseña */}
        <input
          type="text"
          value={reviewText}
          onChange={handleInputChange}
          className="review-input"
          disabled={!isEditing}
        />
      </div>

      {/* Calificación con estrellas */}
      <div className="review-rating">{renderStars()}</div>

      {/* Botones de edición y eliminación */}
      <div className="review-actions">
        {isEditing ? (
          <FaCheck className="confirm-icon" onClick={handleConfirmEdit} />
        ) : (
          <FaEdit className="edit-icon" onClick={handleEdit} />
        )}
        <FaTrash className="delete-icon" />
      </div>
    </div>
  );
};

export default ReviewCard;
