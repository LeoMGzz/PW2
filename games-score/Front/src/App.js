import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Componentes/Header";
import Footer from "./Componentes/Footer";
import LandingPage from "./Paginas/LandingPage";
import Register from "./Paginas/Register"; 
import Login from "./Paginas/Login"; 
import Categorias from "./Paginas/Categorias";
import Companias from "./Paginas/Companias";
import Plataformas from "./Paginas/Plataformas";
import Videojuegos from "./Paginas/Videojuegos";
import QuerySearch from "./Paginas/QuerySearch";
import Perfil from "./Paginas/Perfil";
import ListaVideojuegos from "./Paginas/ListaVideojuegos";
import GamePage from "./Paginas/GamePage";
import RutaProtegida from "./Componentes/RutaProtegida";



const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/QuerySearch" element={<QuerySearch />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/categorias" element={<RutaProtegida soloAdmin={true}><Categorias /></RutaProtegida>} />
        <Route path="/companias" element={<RutaProtegida soloAdmin={true}><Companias /></RutaProtegida>} />
        <Route path="/plataformas" element={<RutaProtegida soloAdmin={true}><Plataformas /></RutaProtegida>} />
        <Route path="/videojuegos" element={<RutaProtegida soloAdmin={true}><Videojuegos /></RutaProtegida>} />
        <Route path="/ListaVideojuegos" element={<ListaVideojuegos />} />
        <Route path="/GamePage" element={<GamePage />} />
      </Routes>
      <Footer /> 
    </Router>
  );
};

export default App;
