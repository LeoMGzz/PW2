import React, { useEffect, useState } from "react";
import "./GameCard.css";
import GameCard from "./GameCard";
import axios from "axios";

const GameList = ({
  searchQuery,
  isQuerySearch,
  showEditDeleteButtons,
  currentPage = 1,
  itemsPerPage = 4,
  filters = {}
}) => {
  const [allGames, setAllGames] = useState([]);

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
          rating: `${parseFloat(juego.Rating).toFixed(1)}/5`,
          year: juego.Año_Lanzamiento,
          ageRating: juego.Age_Rating,
          description: juego.Descripcion,
          desarrolladora: juego.DesarrolladoraNombre,
          publicadora: juego.PublicadoraNombre,
          idCategoria: juego.IdCategoria,
          idDesarrolladora: juego.IdDesarrolladora,
          idPublicadora: juego.IdPublicadora
        }));
        setAllGames(juegos);
      } catch (error) {
        console.error("Error al cargar videojuegos:", error);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = allGames.filter((game) => {
    return (
      (!filters?.nombre || game.title.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (!filters?.categoria || game.genre === filters.categoria) &&
      (!filters?.plataforma || game.platforms.includes(filters.plataforma)) &&
      (!filters?.anio || game.year.toString() === filters.anio.toString()) &&
      (!filters?.desarrolladora || game.desarrolladora === filters.desarrolladora) &&
      (!filters?.publicadora || game.publicadora === filters.publicadora)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentGames = filteredGames.slice(indexOfFirst, indexOfLast);

  return (
    <div className="game-list">
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
            rating={game.rating}
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
        <p>
          No se encontraron resultados
          {filters?.nombre ? ` para "${filters.nombre}"` : ""}.
        </p>
      )}
    </div>
  );
};

export default GameList;
