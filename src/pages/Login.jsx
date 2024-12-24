import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!numeroIdentificacion || !password) {
            toast.error("Por favor, complete todos los campos.");
            return;
        }
        if (!/^\d+$/.test(numeroIdentificacion)) {
            toast.error("El número de identificación debe contener solo números.");
            return;
        }
        if (password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            toast.error("La contraseña debe incluir mayúsculas, minúsculas y números.");
            return;
        }

        try {
            const response = await login(numeroIdentificacion, password);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("numero_identificacion", response.data.numero_identificacion);
            toast.success("Inicio de sesión exitoso!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error al iniciar sesión", err);
            if (err.response && err.response.status === 403) {
                toast.error("El usuario está deshabilitado. Contacte al administrador.");
            } else if (err.response && err.response.status === 401) {
                toast.error("Credenciales inválidas. Por favor, intente de nuevo.");
            } else {
                toast.error("Error del servidor. Intente más tarde.");
            }
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, rgba(30,144,255,0.8), rgba(50,205,50,0.8))",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    background: "white",
                    borderRadius: "15px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    padding: "20px",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div
                        style={{
                            width: "70px",
                            height: "70px",
                            background: "rgba(30,144,255,0.2)",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "0 auto",
                        }}
                    >
                        <FaUser style={{ fontSize: "30px", color: "rgba(30,144,255,0.9)" }} />
                    </div>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Campo de usuario */}
                    <div style={{ marginBottom: "15px", position: "relative" }}>
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
                            type="text"
                            placeholder="Número de identificación"
                            value={numeroIdentificacion}
                            onChange={(e) => setNumeroIdentificacion(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 40px",
                                borderRadius: "25px",
                                border: "1px solid #ccc",
                                outline: "none",
                                position: "relative",
                                zIndex: "0",
                            }}
                        />
                    </div>

                    {/* Campo de contraseña */}
                    <div style={{ marginBottom: "15px", position: "relative" }}>
                        <FaLock
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
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 40px",
                                borderRadius: "25px",
                                border: "1px solid #ccc",
                                outline: "none",
                                position: "relative",
                                zIndex: "0",
                            }}
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: "15px",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#888",
                                zIndex: "1",
                            }}
                        >
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    {/* Olvidé mi contraseña */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <button
                            type="button"
                            onClick={() => navigate("/reset-password")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#1E90FF",
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                        >
                            Olvidé mi contraseña
                        </button>
                    </div>

                    {/* Botón de iniciar sesión */}
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "rgba(50,205,50,0.9)",
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "25px",
                            border: "none",
                            cursor: "pointer",
                            transition: "background 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "rgba(50,205,50,1)")}
                        onMouseLeave={(e) => (e.target.style.background = "rgba(50,205,50,0.9)")}
                    >
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;