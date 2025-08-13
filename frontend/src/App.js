import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Clientes from "./Clientes";
import Pombos from "./Pombos";
import Cartas from "./Cartas";

export default function App() {
  return (
    <Router>
  <nav className="navbar">
    <Link to="/clientes">Clientes</Link>
    <Link to="/pombos">Pombos</Link>
    <Link to="/cartas">Cartas</Link>
  </nav>

  <Routes>
    <Route path="/" element={<Navigate to="/clientes" />} />
    <Route path="/clientes" element={<Clientes />} />
    <Route path="/pombos" element={<Pombos />} />
    <Route path="/cartas" element={<Cartas />} />
  </Routes>
</Router>
  );
}
