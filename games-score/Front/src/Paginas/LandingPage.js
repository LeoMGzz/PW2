import React, { useContext, useState, useEffect } from "react";
import "./LandingPage.css";
import gameImage from "../Assets/Imagenes/LandingPageImage.png"; 
import GameList from "../Componentes/GameList";
import { AuthContext } from "../context/AuthContext";
import GameListSorted from "../Componentes/GameListSorted";
import { useNavigate } from "react-router-dom";



const banners = [ 
  require("../Assets/Imagenes/Banner_Images/NINTENDO_BANNER.png"),
  require("../Assets/Imagenes/Banner_Images/PLAYSTATION_BANNER.png"),
  require("../Assets/Imagenes/Banner_Images/XBOX_BANNER.png"),
  require("../Assets/Imagenes/Banner_Images/STEAM_BANNER.png")
];



const LandingPage = () => {
  const { log } = useContext(AuthContext);

  const [currentBanner, setCurrentBanner] = useState(0);

  

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000); 
  
    return () => clearInterval(interval); 
  }, [banners.length]);
  
  const navigate = useNavigate();

const handleVerTodos = () => {
  navigate("/ListaVideojuegos");
};


  return (
    <div className="LandingPage-Container">

      {log === 1 || log === 2 ? ( 
            <>
             
    <div className="banner-content">
          <button className="banner-arrow left-arrow" onClick={prevBanner}>❮</button>
          <img src={banners[currentBanner]} alt="Banner" className="banner-image"  />
          <div className="banner-overlay" onClick={handleVerTodos}>
         

          <h1>MIRA TODO NUESTRO CATALOGO <br /> DE RESEÑAS!!!</h1>
    </div>
  
    <button className="banner-arrow right-arrow" onClick={nextBanner}>❯</button>
  </div>
  <div className="GameHighlight">
  <h1>JUEGOS CON MAYOR RATING</h1>
</div>
<GameListSorted sortBy="rating" showEditDeleteButtons={log === 2} />

<div className="GameHighlight">
  <h1>JUEGOS CON MÁS RESEÑAS</h1>
</div>
<GameListSorted sortBy="reseñas" showEditDeleteButtons={log === 2} />

<div className="GameHighlight">
  <h1>JUEGOS MÁS NUEVOS</h1>
</div>
<GameListSorted sortBy="fecha" showEditDeleteButtons={log === 2} />

    
            </>
          ) : ( //si el usuario NO ha iniciado sesion
            <>
            <div className ="LandingPage-NotLoggedIn-Containter">
              <div className="Left-Side">
              <h1>The Best <br /> Videogame <br /> Reviews</h1>
              </div>
              <div className="Right-Side">
              <img src={gameImage} alt="Game Review" className="Landing-Image" />
              </div>
              </div>
            </>
          )}
  </div>
  );
};

export default LandingPage;


