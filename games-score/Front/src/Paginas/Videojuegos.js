import React, { useState, useEffect } from 'react';
import './Videojuegos.css';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);




const Videojuegos = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [companias, setCompanias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [plataformasSeleccionadas, setPlataformasSeleccionadas] = useState([]);
  const location = useLocation();
  const [modoEdicion, setModoEdicion] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    obtenerCompanias();
    obtenerCategorias();
    obtenerPlataformas();
  }, []);

  const obtenerCompanias = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/companias/activas");
      setCompanias(response.data);
    } catch (error) {
      console.error("Error al obtener compañías:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/categorias/activas");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const obtenerPlataformas = async () => {
    try {
      const response = await axios.get("https://pw2-production.up.railway.app/plataformas/activas");
      setPlataformas(response.data);
    } catch (error) {
      console.error("Error al obtener plataformas activas:", error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageBase64(reader.result);
        setImage(URL.createObjectURL(file));
      };
    }
  };

  const handlePlataformaChange = (id) => {
    setPlataformasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };


  const handleRegistro = async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const año = document.getElementById("anio").value.trim();
    const ageRating = document.getElementById("ageRating").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;
    const desarrolladora = document.getElementById("desarrolladora").value;
    const publicadora = document.getElementById("publicadora").value;

    let errores = [];

    if (!nombre || !año || !ageRating || !descripcion || !categoria || !desarrolladora || !publicadora || !imageBase64 || plataformasSeleccionadas.length === 0) {
      errores.push("-Todos los campos son obligatorios.");
    }

    if (!/^\d{4}$/.test(año) || año < 1901 || año > 2155) {
      errores.push("-El año debe estar entre 1901 y 2155.");
    }

    if (!/^[0-9]+$/.test(ageRating)) {
      errores.push("-El age rating debe ser un número.");
    }

    if (errores.length > 0) {
      MySwal.fire({
        icon: "warning",
        title: "Errores en el formulario",
        html: errores.join("<br>"),
      });
      return;
    }
    

    try {
      const response = await axios.post("https://pw2-production.up.railway.app/videojuegos/crear", {
        nombre,
        imagen: imageBase64,
        año_lanzamiento: año,
        age_rating: ageRating,
        descripcion,
        categoria,
        desarrolladora,
        publicadora,
        plataformas: plataformasSeleccionadas
      });

      await MySwal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: response.data.message,
      });
      
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al registrar el videojuego.",
      });
      
    }
    document.getElementById("nombre").value = "";
document.getElementById("anio").value = "";
document.getElementById("ageRating").value = "";
document.getElementById("descripcion").value = "";
document.getElementById("categoria").value = "";
document.getElementById("desarrolladora").value = "";
document.getElementById("publicadora").value = "";

setImage(null);
setImageBase64("");
setPlataformasSeleccionadas([]);

const checkboxes = document.querySelectorAll("input[name='plataforma']");
checkboxes.forEach((checkbox) => (checkbox.checked = false));

  };
  const handleEditar = async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const año = document.getElementById("anio").value.trim();
    const ageRating = document.getElementById("ageRating").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;
    const desarrolladora = document.getElementById("desarrolladora").value;
    const publicadora = document.getElementById("publicadora").value;
  
    let errores = [];
  
    if (!nombre || !año || !ageRating || !descripcion || !categoria || !desarrolladora || !publicadora || plataformasSeleccionadas.length === 0) {
      errores.push("-Todos los campos son obligatorios.");
    }
  
    if (!/^\d{4}$/.test(año) || año < 1901 || año > 2155) {
      errores.push("-El año debe estar entre 1901 y 2155.");
    }
  
    if (!/^[0-9]+$/.test(ageRating)) {
      errores.push("-El age rating debe ser un número.");
    }
  
    if (errores.length > 0) {
      MySwal.fire({
        icon: "warning",
        title: "Errores en el formulario",
        html: errores.join("<br>"),
      });
      return;
    }
    
  
    try {
      const idJuego = location.state?.id;
  
      const response = await axios.put(`https://pw2-production.up.railway.app/videojuegos/editar/${idJuego}`, {
        nombre,
        imagen: imageBase64, 
        año_lanzamiento: año,
        age_rating: ageRating,
        descripcion,
        categoria,
        desarrolladora,
        publicadora,
        plataformas: plataformasSeleccionadas
      });
  
      await MySwal.fire({
        icon: "success",
        title: "Edición exitosa",
        text: response.data.message,
      });      
      navigate("/ListaVideojuegos");
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al editar el videojuego.",
      });
      
    }
  };
  

  

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        obtenerCompanias(),
        obtenerCategorias(),
        obtenerPlataformas()
      ]);
  
      const juego = location.state;
    
      if (juego) {
        setModoEdicion(true);
        document.getElementById("nombre").value = juego.title;
        document.getElementById("anio").value = juego.year;
        document.getElementById("ageRating").value = juego.ageRating;
        document.getElementById("descripcion").value = juego.description;
  
        document.getElementById("categoria").value = juego.idCategoria;
        document.getElementById("desarrolladora").value = juego.idDesarrolladora;
        document.getElementById("publicadora").value = juego.idPublicadora;
  
        setImage(juego.image);
        setPlataformasSeleccionadas(juego.platformIDs || []);
      }
    };
  
    fetchAll();
  }, []);
  
  

  return (
    <div className="videojuego-container">
      <div className="videojuego-left-section">
        <div className="videojuego-info-block">
          <label className="videojuego-label" htmlFor="nombre">NOMBRE DEL VIDEOJUEGO</label>
          <input type="text" id="nombre" className="videojuego-input videojuego-short2" />
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label" htmlFor="anio">AÑO DE LANZAMIENTO</label>
          <input type="text" id="anio" className="videojuego-input videojuego-short" />
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label">DESARROLLADORA</label>
          <select className="videojuego-input videojuego-short" id="desarrolladora">
            <option value="">Selecciona una desarrolladora</option>
            {companias.map((compania) => (
              <option key={compania.IdCompañia} value={compania.IdCompañia}>{compania.Nombre}</option>
            ))}
          </select>
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label">PUBLICADORA</label>
          <select className="videojuego-input videojuego-short" id="publicadora">
            <option value="">Selecciona una publicadora</option>
            {companias.map((compania) => (
              <option key={compania.IdCompañia} value={compania.IdCompañia}>{compania.Nombre}</option>
            ))}
          </select>
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label" htmlFor="ageRating">AGE RATING</label>
          <input type="text" id="ageRating" className="videojuego-input" />
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label" htmlFor="descripcion">DESCRIPCION</label>
          <textarea id="descripcion" className="videojuego-textarea" />
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label">CATEGORIA</label>
          <select className="videojuego-input videojuego-short" id="categoria">
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.IdCategoria} value={categoria.IdCategoria}>{categoria.Nombre}</option>
            ))}
          </select>
        </div>
        <div className="videojuego-info-block">
          <label className="videojuego-label">PLATAFORMA(S)</label>
          <div className="videojuego-checkbox-group-scrollable">
            {plataformas.map((plataforma) => (
              <div key={plataforma.IdPlataforma}>
                <input
  type="checkbox"
  id={`plataforma-${plataforma.IdPlataforma}`}
  name="plataforma"
  value={plataforma.IdPlataforma}
  checked={plataformasSeleccionadas.includes(plataforma.IdPlataforma)} //  marca si está en el array
  onChange={() => handlePlataformaChange(plataforma.IdPlataforma)}
/>

                <label htmlFor={`plataforma-${plataforma.IdPlataforma}`}>{plataforma.Nombre}</label>
              </div>
            ))}
          </div>
        </div>
        <button
  className="videojuego-register-button"
  onClick={modoEdicion ? handleEditar : handleRegistro}
>
  {modoEdicion ? "EDITAR VIDEOJUEGO" : "REGISTRAR"}
</button>

      </div>
      <div className="videojuego-right-section">
        <h2 className="videojuego-boxart-title">BOXART</h2>
        <div className="videojuego-boxart">
          {image ? (
            <img src={image} alt="Boxart" className="videojuego-boxart-image" />
          ) : (
            <div className="videojuego-boxart-placeholder"></div>
          )}
        </div>
        <label className="videojuego-upload-button">
          SUBIR IMAGEN
          <input type="file" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  );
};

export default Videojuegos;