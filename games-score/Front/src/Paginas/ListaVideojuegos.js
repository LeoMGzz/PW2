import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ListaVideojuegos.css";
import GameList from "../Componentes/GameList";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ListaVideojuegos = () => {
  const navigate = useNavigate();
  const location = useLocation();
const { log } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [anio, setAnio] = useState("");
  const [desarrolladora, setDesarrolladora] = useState("");
  const [publicadora, setPublicadora] = useState("");

  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [plataformasDisponibles, setPlataformasDisponibles] = useState([]);
  const [companiasDisponibles, setCompaniasDisponibles] = useState([]);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(totalGames / itemsPerPage);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setNombre(queryParams.get("nombre") || "");
    setCategoria(queryParams.get("categoria") || "");
    setPlataforma(queryParams.get("plataforma") || "");
    setAnio(queryParams.get("anio") || "");
    setDesarrolladora(queryParams.get("desarrolladora") || "");
    setPublicadora(queryParams.get("publicadora") || "");
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://pw2-production.up.railway.app/videojuegos/activos");
        const filtrados = response.data.filter((j) => {
          return (
            (!nombre || j.Nombre.toLowerCase().includes(nombre.toLowerCase())) &&
            (!categoria || j.CategoriaNombre === categoria) &&
            (!plataforma || j.Plataformas.includes(plataforma)) &&
            (!anio || j.Año_Lanzamiento.toString() === anio) &&
            (!desarrolladora || j.DesarrolladoraNombre === desarrolladora) &&
            (!publicadora || j.PublicadoraNombre === publicadora)
          );
        });
        setTotalGames(filtrados.length);
      } catch (err) {
        console.error("Error al contar juegos filtrados:", err);
      }
    };
    fetchData();
  }, [nombre, categoria, plataforma, anio, desarrolladora, publicadora]);

  useEffect(() => {
    axios.get("https://pw2-production.up.railway.app/categorias/activas").then((res) => setCategoriasDisponibles(res.data));
    axios.get("https://pw2-production.up.railway.app/plataformas/activas").then((res) => setPlataformasDisponibles(res.data));
    axios.get("https://pw2-production.up.railway.app/companias/activas").then((res) => setCompaniasDisponibles(res.data));
  }, []);

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (nombre) params.append("nombre", nombre);
    if (categoria) params.append("categoria", categoria);
    if (plataforma) params.append("plataforma", plataforma);
    if (anio) params.append("anio", anio);
    if (desarrolladora) params.append("desarrolladora", desarrolladora);
    if (publicadora) params.append("publicadora", publicadora);
    navigate(`/ListaVideojuegos?${params.toString()}`);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="manage-games-container">
      <h1 className="Busqueda-Avanzada-header" >Busqueda avanzada</h1>

      <form onSubmit={handleAdvancedSearch} className="advanced-search-form">
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categoriasDisponibles.map((c) => (
            <option key={c.IdCategoria} value={c.Nombre}>{c.Nombre}</option>
          ))}
        </select>

        <select value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
          <option value="">Todas las plataformas</option>
          {plataformasDisponibles.map((p) => (
            <option key={p.IdPlataforma} value={p.Nombre}>{p.Nombre}</option>
          ))}
        </select>

        <input
          type="number"
          
          placeholder="Año"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
        />

        <select value={desarrolladora} onChange={(e) => setDesarrolladora(e.target.value)}>
          <option value="">Todas las desarrolladoras</option>
          {companiasDisponibles.map((c) => (
            <option key={c.IdCompañia} value={c.Nombre}>{c.Nombre}</option>
          ))}
        </select>

        <select value={publicadora} onChange={(e) => setPublicadora(e.target.value)}>
          <option value="">Todas las publicadoras</option>
          {companiasDisponibles.map((c) => (
            <option key={c.IdCompañia} value={c.Nombre}>{c.Nombre}</option>
          ))}
        </select>

      </form>
      {log === 2 && (
  <button className="register-game-button" onClick={() => navigate("/Videojuegos")}>
    REGISTRAR VIDEOJUEGO
  </button>
)}


      <GameList
        isQuerySearch={true}
        showEditDeleteButtons={log === 2}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        filters={{ nombre, categoria, plataforma, anio, desarrolladora, publicadora }}
      />

      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button onClick={goToPrevPage} disabled={currentPage === 1}>Página Anterior</button>
          <span style={{ margin: "0 10px" }}>Página {currentPage} de {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>Página Siguiente</button>
        </div>
      )}

      
    </div>
  );
};

export default ListaVideojuegos;
