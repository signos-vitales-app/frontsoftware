import React, { useState } from "react";
import { FaCog, FaSignOutAlt, FaUserCircle, FaFolderOpen } from "react-icons/fa"; // Importamos más íconos de React Icons
import { useNavigate } from "react-router-dom"; // Para redirigir al login
import "./Navbar.css"; // Importamos el archivo CSS para los estilos
import { toast } from "react-toastify"; // Importamos ToastContainer y toast
import "react-toastify/dist/ReactToastify.css"; // Estilos de react-toastify

const Navbar = () => {
  const [showModal, setShowModal] = useState(false); // Estado para el modal de cerrar sesión
  const [showProfileModal, setShowProfileModal] = useState(false); // Estado para el modal de cambiar foto de perfil
  const [showDropdown, setShowDropdown] = useState(false); // Estado para el dropdown de ajustes
  const navigate = useNavigate(); // Hook de React Router para redirigir

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");
    toast.success("Sesión cerrada exitosamente"); // Mostrar el toast de éxito
    setShowModal(false); // Cierra el modal
    navigate("/");
  };

  // Función para cambiar foto de perfil y redirigir a la página de cambio de foto
const handleProfileChange = () => {
  setShowProfileModal(false); // Cierra el modal
  navigate("/update-profile"); // Redirige a la página de cambio de foto de perfil
};

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <FaFolderOpen className="navbar-logo" size={24} /> {/* Nuevo ícono */}
          <span className="navbar-title">Gestión del registro de pacientes</span>
        </div>
        <div className="navbar-right">
          <button
            className="settings-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FaCog size={24} color="white" /> {/* Ícono de ajustes */}
            <span className="ajustes-texto">Configuración</span>
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => setShowProfileModal(true)}>
                <FaUserCircle size={18} /> Cambiar foto de perfil
              </button>
              <button onClick={() => setShowModal(true)}>
                <FaSignOutAlt size={18} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modal de Confirmación de Cerrar Sesión */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>¿Estás seguro de que quieres cerrar sesión?</h2>
            <button className="modal-btn yes" onClick={handleLogout}>
              Sí, cerrar sesión
            </button>
            <button
              className="modal-btn no"
              onClick={() => setShowModal(false)}
            >
              No, volver
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cambiar Foto de Perfil */}
      {showProfileModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>¿Seguro deseas cambiar la foto de perfil?</h2>
            <button className="modal-btn yes" onClick={handleProfileChange}>
              Sí, cambiar
            </button>
            <button
              className="modal-btn no"
              onClick={() => setShowProfileModal(false)}
            >
              No, volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;