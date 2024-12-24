import React from "react";
import { FaSignInAlt } from "react-icons/fa"; // Icono de inicio de sesión

const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #2196f3, #64b5f6)", // Fondo azul
        color: "white",
        textAlign: "center",
        fontFamily: "'Poppins', Arial, sans-serif", // Tipografía llamativa
        position: "relative", // Necesario para la marca de agua
      }}
    >
      {/* Logo o Icono */}
      <div
        style={{
          width: "120px",
          height: "120px",
          background: "white",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          animation: "bounce 1s infinite", // Animación de rebote en el icono
        }}
      >
        <span
          style={{
            fontSize: "5rem", // Aumenté el tamaño del emoji
            color: "#0288d1",
          }}
        >
          📈
        </span>
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: "4rem", // Aumenté el tamaño del título
          marginBottom: "0.5rem",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)", // Sombra sutil en el título
          animation: "fadeIn 2s ease-out, moveUp 2s ease-out", // Animación combinada: fadeIn y movimiento hacia arriba con duración más larga
        }}
      >
        Bienvenido al sistema de gestion de signos vitales
      </h1>

      <p
        style={{
          fontSize: "1.4rem",
          marginBottom: "2rem",
          fontWeight: "300",
        }}
      >
        Gestiona y registra los datos de tus pacientes de manera fácil y segura.
      </p>

      {/* Botones */}
      <div>
        <a
          href="/login"
          style={{
            textDecoration: "none",
            padding: "15px 30px", // Botón más grande
            margin: "0 10px",
            borderRadius: "8px",
            color: "white",
            backgroundColor: "#0277bd", // Color más oscuro para el botón
            fontSize: "1.2rem", // Texto del botón más grande
            fontWeight: "500",
            transition: "transform 0.3s, background 0.3s",
            display: "inline-flex",
            alignItems: "center", // Alinea el icono y el texto
            gap: "10px", // Espacio entre el icono y el texto
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#01579b"; // Color más oscuro en hover
            e.target.style.transform = "translateY(-5px)"; // Movimiento en hover
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#0277bd";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <FaSignInAlt size={20} /> {/* Icono de inicio de sesión */}
          Iniciar Sesión
        </a>
      </div>

      {/* Mensaje de Pie */}
      <footer
        style={{
          marginTop: "3rem", // Mayor margen superior
          fontSize: "1rem",
          opacity: 0.8,
          textAlign: "center", // Alineación centrada
        }}
      >
        © 2024 Sistema de Gestión de Pacientes
      </footer>

      {/* Marca de agua con las iniciales */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          fontSize: "1.2rem",
          color: "rgba(255, 255, 255, 0.5)",
          fontWeight: "bold",
        }}
      >
        AAL
      </div>

      {/* Estilos Globales para la animación */}
      <style>
        {`
          @keyframes bounce {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes moveUp {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;