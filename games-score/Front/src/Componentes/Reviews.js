import React, { useEffect, useState } from "react";
import "./ReviewCard.css";
import ReviewCard from "./ReviewCard";
import axios from "axios";

const UserReviews = ({ gameId, reloadTrigger, onDeleteReview  }) => {
  const [reviews, setReviews] = useState([]);
  const userId = parseInt(localStorage.getItem("idUsuario"));

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`https://pw-2-7ybuch6af-leos-projects-ff2b9494.vercel.app/resenas/activas/${gameId}`);
        const allReviews = res.data;

        const userReview = allReviews.find((r) => r.autorId === userId);
        const otherReviews = allReviews.filter((r) => r.autorId !== userId);

        const ordered = userReview ? [userReview, ...otherReviews] : otherReviews;

        setReviews(ordered);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
      }
    };

    fetchReviews();
  }, [gameId, userId,reloadTrigger]);

  if (reviews.length === 0) {
    return <p className="no-reviews">No hay reseñas disponibles</p>;
  }

  return (
    <div className="user-reviews">
      {reviews.map((review, index) => (
        <ReviewCard
          key={index}
          userImage={
            review.fotoPerfil
              ? `data:image/png;base64,${review.fotoPerfil}`
              : require("../Assets/Imagenes/User.png")
          }
          username={review.username}
          comentario={review.comentario}
          rating={review.rating}
          fecha={review.fecha}
          autorId={review.autorId}
          reseñaId={review.idReseña}
          onDeleteReview={onDeleteReview}
        />
      ))}
    </div>
  );
};

export default UserReviews;
