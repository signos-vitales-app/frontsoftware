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
                background: "linear-gradient(135deg, rgba(30,144,255,0.9), rgba(50,205,50,0.9))",
            }}
        >
            {/* Contenedor del formulario */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "500px", // Aumentamos el tamaño del cuadro
                    background: "white",
                    borderRadius: "20px", // Bordes más suaves
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                    padding: "30px", // Más espacio interno
                    zIndex: "10",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "20px", // Texto más grande
                        color: "#333",
                        marginBottom: "25px", // Más espacio debajo del título
                    }}
                >
                    Para reestablecer su contraseña, por favor ingrese el correo electrónico que está asociado a su cuenta
                </h2>

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
                            padding: "15px 50px", // Más altura en el campo
                            borderRadius: "25px",
                            border: "1px solid #ccc",
                            outline: "none",
                            position: "relative",
                            zIndex: "0",
                            backgroundColor: "#f4f7fc",
                            fontSize: "16px", // Texto más grande
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
                        padding: "15px", // Más alto
                        background: "rgba(30, 144, 255, 0.9)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px", // Texto más grande
                        borderRadius: "25px",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(30, 144, 255, 1)")
                    }
                    onMouseLeave={(e) =>
                        (e.target.style.background = "rgba(30, 144, 255, 0.9)")
                    }
                >
                    Enviar correo
                </button>

                {/* Botón para volver al inicio de sesión */}
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        color: "rgba(30, 144, 255, 0.9)",
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