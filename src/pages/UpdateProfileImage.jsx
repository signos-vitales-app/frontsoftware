import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUserInfo, updateProfileImage } from "../services/authService";
import { FaUpload, FaEdit, FaHome, FaTimes, FaUser } from "react-icons/fa";

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState({ username: "", email: "", profile_image: null });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo();
                setUserInfo(response.data || {});
                if (response.data?.profile_image) {
                    setPreviewImage(`${import.meta.env.VITE_API_URL}/uploads/profile-images/${response.data.profile_image}`);
                }
            } catch (error) {
                console.error("Error al cargar la información del usuario:", error);
            }
        };
        fetchUserInfo();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Por favor, selecciona una imagen antes de subirla.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        try {
            const response = await updateProfileImage(formData);
            setUserInfo((prev) => ({ ...prev, profile_image: response.data?.profile_image || null }));
            setPreviewImage(URL.createObjectURL(selectedFile));

            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "La imagen de perfil se ha actualizado correctamente.",
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al actualizar la imagen. Por favor, inténtalo de nuevo.",
            });
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                position: "relative",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            {/* Fondo degradado con animación */}
            <div
                style={{
                    background: "linear-gradient(135deg,rgb(151, 200, 240), #42a5f5)", // Gradiente azul
                    animation: "gradient 6s ease infinite",
                    backgroundSize: "200% 200%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                }}
            ></div>

            {/* Animación de fondo */}
            <style>
                {`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>

            <div
                style={{
                    width: "500px", // Ancho modificado para hacer el cuadro más ancho
                    padding: "15px",
                    borderRadius: "20px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <h1
                    style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color: "#1976d2",
                        marginBottom: "20px",
                        fontFamily: "Montserrat, sans-serif",
                    }}
                >
                    Mi Perfil
                </h1>

                <div
                    style={{
                        width: "120px",
                        height: "120px",
                        margin: "0 auto 15px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #64b5f6, #42a5f5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                        overflow: "hidden",
                    }}
                >
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt="Imagen de perfil"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                setPreviewImage(null); // Si falla, muestra el ícono predeterminado
                            }}
                        />
                    ) : (
                        <FaUser
                            style={{
                                fontSize: "60px", // Tamaño del ícono
                                color: "white", // Ícono blanco
                            }}
                        />
                    )}
                </div>


                <div
                    style={{
                        marginTop: "15px",
                        background: "#f9f9f9",
                        borderRadius: "15px",
                        padding: "15px",
                        boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                        fontSize: "16px",
                        color: "#333",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            borderBottom: "1px solid #e0e0e0",
                            paddingBottom: "8px",
                            marginBottom: "8px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "600",
                                color: "#1976d2",
                                fontSize: "16px",
                            }}
                        >
                            Nombre
                        </span>
                        <p
                            style={{
                                color: "#757575",
                                margin: "5px 0",
                                fontSize: "14px",
                            }}
                        >
                            {userInfo.username || "Nombre Usuario"}
                        </p>
                    </div>

                    <div
                        style={{
                            width: "100%",
                            borderBottom: "1px solid #e0e0e0",
                            paddingBottom: "8px",
                            marginBottom: "8px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "600",
                                color: "#1976d2",
                                fontSize: "16px",
                            }}
                        >
                            Correo
                        </span>
                        <p
                            style={{
                                color: "#757575",
                                margin: "5px 0",
                                fontSize: "14px",
                            }}
                        >
                            {userInfo.email || "correo@ejemplo.com"}
                        </p>
                    </div>

                    <div style={{ width: "100%" }}>
                        <span
                            style={{
                                fontWeight: "600",
                                color: "#1976d2",
                                fontSize: "16px",
                            }}
                        >
                            Rol
                        </span>
                        <p
                            style={{
                                color: "#757575",
                                margin: "5px 0",
                                fontSize: "14px",
                            }}
                        >
                            {userInfo.role || "Rol no asignado"}
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    {/* Botón de Subir Foto */}
                    <label
                        htmlFor="fileInput"
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#1976d2",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                        }
                    >
                        <FaUpload /> Subir Foto
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    {/* Botón de Cambiar Foto */}
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#42a5f5",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                        }
                    >
                        <FaEdit /> Cambiar Foto de Perfil
                    </button>

                    {/* Botón de Volver al Menú */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#e0e0e0",
                            color: "#333333",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                        onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                        }
                    >
                        <FaHome /> Volver al Menú
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;