import React from "react";
import "./Footer.css";


const Footer = () => {
  return (
    <footer>
      <div className="footer-container">

        <div className="footer-info">
          <h3>Game Score</h3>
          <p>Las mejores reseñas de videojuegos en un solo lugar.</p>
        </div>

        
        <div className="footer-us">
          <h3>Sobre nosotros</h3>
          <ul>
            <li>Aaron Abdael Garza de la Fuente</li>
            <li>Leonardo Moreno González</li>
            <li>Jose Maria Noriega Moreno</li>
          </ul>
        </div>

       
        <div className="footer-copyright">
          <p>&copy; 2025 Game Score. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
