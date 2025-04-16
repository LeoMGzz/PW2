import React, { useState } from "react";
import "./ReviewCard.css";
import { FaStar, FaTrash, FaEdit, FaCheck } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const ReviewCard = ({ userImage, username, comentario, rating, fecha, autorId, reseñaId, onDeleteReview }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState(comentario);
  const [editedRating, setEditedRating] = useState(rating);

  const idUsuarioActual = parseInt(localStorage.getItem("idUsuario"));
const isOwner = idUsuarioActual === autorId;
const displayName = isOwner ? "Tú" : username;


  const formatDate = (fecha) => {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const handleInputChange = (e) => {
    setReviewText(e.target.value);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleConfirmEdit = async () => {
    try {
      const res = await axios.put(`https://pw2-production.up.railway.app/resenas/editar/${reseñaId}`, {
        calificacion: editedRating,
        comentario: reviewText,
      });
  
      await MySwal.fire({
        icon: "success",
        title: "¡Reseña actualizada!",
        text: res.data.message,
      });
      setIsEditing(false);
      window.location.reload();
      
    } catch (error) {
      console.error("Error al actualizar reseña:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar la reseña.",
      });
      
    }
  };
  

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < editedRating ? "star filled-star" : "star"}
        onClick={() => isEditing && setEditedRating(i + 1)}
        style={{ cursor: isEditing ? "pointer" : "default" }}
      />
    ));
  };
  

  return (
    <div className="review-card">
      <img src={userImage} alt="Usuario" className="user-avatar" />

      <div className="review-content">
        <div className="review-header">
        <strong>{displayName}</strong>
<span className="review-date">
  {isOwner ? `Tú opinaste el ${formatDate(fecha)}` : formatDate(fecha)}
</span>

        </div>

        <input
          type="text"
          value={reviewText}
          onChange={handleInputChange}
          className="review-input"
          disabled={!isEditing}
        />

        <div className="review-rating">{renderStars()}</div>
      </div>

      {isOwner && (
  <div className="review-actions">
    {isEditing ? (
      <FaCheck className="confirm-icon" onClick={handleConfirmEdit} />
    ) : (
      <FaEdit className="edit-icon" onClick={handleEdit} />
    )}
    <FaTrash
      className="delete-icon"
      onClick={() => onDeleteReview(reseñaId)}
    />
  </div>
)}

    </div>
  );
};

export default ReviewCard;
