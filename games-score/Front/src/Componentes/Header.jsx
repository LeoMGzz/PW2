import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../Assets/Imagenes/Logo.png";
import defaultUserImage from "../Assets/Imagenes/User.png"; 
import { AuthContext } from "../context/AuthContext";

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [username, setUsername] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const { log, setLog } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (event) => {
        event.preventDefault(); 
        if (searchTerm.trim()) {
            navigate(`/ListaVideojuegos?nombre=${encodeURIComponent(searchTerm.trim())}`);
        }
      };


    useEffect(() => {
        const updateUserData = () => {
            const storedUsername = localStorage.getItem("username");
            const storedFotoPerfil = localStorage.getItem("fotoPerfil");
            const storedRol = parseInt(localStorage.getItem("rol"), 10) || 0;

            if (storedUsername) {
                setUsername(storedUsername);
                setLog(storedRol === 1 ? 1 : storedRol === 2 ? 2 : 0);
                setUserImage(storedFotoPerfil ? `data:image/png;base64,${storedFotoPerfil}` : defaultUserImage);
            } else {
                setUsername(null);
                setUserImage(defaultUserImage);
                setLog(0);
            }
        };

        updateUserData(); 

        window.addEventListener("storage", updateUserData);

        return () => {
            window.removeEventListener("storage", updateUserData);
        };
    }, []);

    return (
        <header>
            <div className="logo-container">
                <Link to="/">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
            </div>
            <form className="search-container" onSubmit={handleSearchSubmit}>
        <input
            type="text"
            placeholder="Buscar..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </form>
            <div className="right-container">
                {log === 1 || log === 2 ? (
                    <>
                   
                        <Link to="/Perfil" className="profile-link">
                            <button>{username}</button>
                        </Link>
                        <div className="divider-2"></div>

                        <div className="user-image-container"
                            onMouseEnter={() => setShowMenu(true)}
                            onMouseLeave={() => setShowMenu(false)}>
                            <Link to="/Perfil">
                                <img src={userImage} alt="User" className="user-image" />
                            </Link>

                            {log === 2 && showMenu && (
                                <div className="dropdown-menu">
                                    <Link to="/Perfil"><button>Perfil</button></Link>
                                    <div className="divider-3"></div>
                                    <Link to="/ListaVideojuegos"><button>Videojuegos</button></Link>
                                    <div className="divider-3"></div>
                                    <Link to="/categorias"><button>Categorías</button></Link>
                                    <div className="divider-3"></div>
                                    <Link to="/companias"><button>Compañías</button></Link>
                                    <div className="divider-3"></div>
                                    <Link to="/plataformas"><button>Plataformas</button></Link>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/register">
                            <button>Registrarse</button>
                        </Link>
                        <div className="divider"></div>
                        <Link to="/login">
                            <button>Iniciar Sesión</button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
