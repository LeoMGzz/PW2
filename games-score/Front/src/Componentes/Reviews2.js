import React from "react";
import "./ReviewCard.css";
import ReviewCard from "./ReviewCard2";
import gameImage from "../Assets/Imagenes/Placeholders/The_last_of_us_Part_2.png";


// Placeholder de datos (luego se conectará con la base de datos)
const reviews = [
  {
    gameImage,
    gameTitle: "THE LAST OF US PART II",
    initialReviewText: "Joel, levantate T-T",
    rating: 4,
    date: "2/7/2025"
  },

  {
    gameImage,
    gameTitle: "THE LAST OF US PART II",
    initialReviewText: "Joel, levantate T-T",
    rating: 4,
    date: "2/7/2025"
  }

];

const UserReviews = () => {
    return (
      <div className="user-reviews">
        {reviews.map((review, index) => (
          <ReviewCard
            key={index}
            gameImage={review.gameImage}
            gameTitle={review.gameTitle}
            initialReviewText={review.initialReviewText}
            rating={review.rating}
            date={review.date}
          />
        ))}
      </div>
    );
  };
export default UserReviews;
