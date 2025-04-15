import React, { useEffect, useState } from "react";
import "./GameCard.css";
import GameCard from "./GameCard";
import axios from "axios";

const GameListSorted = ({ sortBy = "rating", showEditDeleteButtons }) => {
  const [games, setGames] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 2;
  const maxItems = 5;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get("http://localhost:3001/videojuegos/activos");
        const juegos = response.data.map(juego => ({
          id: juego.IdJuego,
          image: `data:image/jpeg;base64,${juego.Imagen}`,
          title: juego.Nombre,
          platforms: juego.Plataformas,
          platformIDs: juego.PlataformaIDs,
          genre: juego.CategoriaNombre,
          reviews: juego.Resenas || 0,
          rating: parseFloat(juego.Rating),
          year: juego.Año_Lanzamiento,
          ageRating: juego.Age_Rating,
          description: juego.Descripcion,
          desarrolladora: juego.DesarrolladoraNombre,
          publicadora: juego.PublicadoraNombre,
          idCategoria: juego.IdCategoria,
          idDesarrolladora: juego.IdDesarrolladora,
          idPublicadora: juego.IdPublicadora
        }));

        let ordenados = [...juegos];

        if (sortBy === "rating") {
          ordenados.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "reseñas") {
          ordenados.sort((a, b) => b.reviews - a.reviews);
        } else if (sortBy === "fecha") {
          ordenados.sort((a, b) => b.year - a.year);
        }

        setGames(ordenados.slice(0, maxItems));
      } catch (error) {
        console.error("Error al cargar juegos ordenados:", error);
      }
    };

    fetchGames();
  }, [sortBy]);

  const goLeft = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const goRight = () => {
    setStartIndex((prev) =>
      Math.min(prev + 1, games.length - visibleCount)
    );
  };

  const currentGames = games.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="carousel-container">
      <button className="carousel-btn left" onClick={goLeft} disabled={startIndex === 0}>
        ◀
      </button>

      <div className="game-list carousel">
        {currentGames.length > 0 ? (
          currentGames.map((game, index) => (
            <GameCard
              key={index}
              id={game.id}
              image={game.image}
              title={game.title}
              platforms={game.platforms}
              genre={game.genre}
              reviews={game.reviews}
              rating={`${game.rating.toFixed(1)}/5`}
              showEditDeleteButtons={showEditDeleteButtons}
              year={game.year}
              ageRating={game.ageRating}
              description={game.description}
              desarrolladora={game.desarrolladora}
              publicadora={game.publicadora}
              platformIDs={game.platformIDs}
              idCategoria={game.idCategoria}
              idDesarrolladora={game.idDesarrolladora}
              idPublicadora={game.idPublicadora}
            />
          ))
        ) : (
          <p>No se encontraron juegos destacados.</p>
        )}
      </div>

      <button
        className="carousel-btn right"
        onClick={goRight}
        disabled={startIndex + visibleCount >= games.length}
      >
        ▶
      </button>
    </div>
  );
};

export default GameListSorted;
