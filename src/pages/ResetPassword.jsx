import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { FaUser } from "react-icons/fa";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await resetPassword(email);
            setSuccess("Correo electrónico de restablecimiento de contraseña enviado. Por favor revisa tu bandeja de entrada.");
            setError(null);
            console.log(response.data);
        } catch (err) {
            setError("No se pudo enviar el correo electrónico de restablecimiento. Por favor inténtalo de nuevo.");
            setSuccess(null);
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                background: "linear-gradient(135deg, #90caf9, #1e88e5)", // Fondo degradado azul
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "25px",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                    padding: "30px",
                    zIndex: "10",
                    textAlign: "center",
                    background: "linear-gradient(135deg, #f9f9f9, #f3f4f7)", // Mantén solo el degradado
                }}                
            >
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        color: "#1976d2", // Color azul fuerte
                        marginBottom: "20px",
                        borderBottom: "2px solid #90caf9", // Línea decorativa debajo
                        paddingBottom: "10px",
                    }}
                >
                    Para reestablecer su contraseña
                </h2>
                <p style={{ color: "#555", marginBottom: "25px", fontSize: "16px" }}>
                    Por favor ingrese el correo electrónico que está asociado a su cuenta
                </p>

                {/* Campo de correo */}
                <div style={{ marginBottom: "20px", position: "relative" }}>
                    <FaUser
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "15px",
                            transform: "translateY(-50%)",
                            color: "#888",
                            zIndex: "1",
                        }}
                    />
                    <input
                        type="email"
                        placeholder="Ingrese su correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "15px 50px",
                            borderRadius: "30px", // Más redondeado
                            border: "1px solid #ccc",
                            outline: "none",
                            position: "relative",
                            zIndex: "0",
                            backgroundColor: "#f4f7fc",
                            fontSize: "16px",
                        }}
                    />
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                    <p
                        style={{
                            color: "red",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </p>
                )}
                {success && (
                    <p
                        style={{
                            color: "green",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {success}
                    </p>
                )}

                {/* Botón de enviar */}
                <button
                    type="submit"
                    onClick={handleResetPassword}
                    style={{
                        width: "100%",
                        padding: "15px",
                        background: "linear-gradient(135deg, #42a5f5, #1565c0)", // Degradado más oscuro
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        borderRadius: "30px", // Bordes redondeados
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Sombra para el botón
                        transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                    }}
                >
                    Enviar correo
                </button>

                {/* Botón para volver al inicio de sesión */}
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        color: "#1e88e5",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "14px",
                    }}
                >
                    Volver a iniciar sesión
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;