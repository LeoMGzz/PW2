import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GameList from "../Componentes/GameList";
import "./LandingPage.css";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const QuerySearch = () => {
  const location = useLocation();
  const { log } = useContext(AuthContext);
  const isAdmin = log === 2;

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(totalGames / itemsPerPage);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await axios.get("https://pw-2-7ybuch6af-leos-projects-ff2b9494.vercel.app/videojuegos/activos");
        const resultadosFiltrados = response.data.filter((juego) =>
          juego.Nombre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setTotalGames(resultadosFiltrados.length);
      } catch (error) {
        console.error("Error al contar resultados de búsqueda:", error);
      }
    };

    fetchTotal();
  }, [searchQuery]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="manage-games-container">
      <h1>RESULTADOS DE BÚSQUEDA</h1>

      <GameList
        searchQuery={searchQuery}
        isQuerySearch={true}
        showEditDeleteButtons={isAdmin}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            Página Anterior
          </button>
          <span style={{ margin: "0 10px" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Página Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default QuerySearch;
