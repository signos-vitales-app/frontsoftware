import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUserInfo, updateProfileImage } from "../services/authService";

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
                background: "linear-gradient(135deg, #2196f3, #4caf50)",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            <div
                style={{
                    width: "380px",
                    padding: "30px",
                    borderRadius: "25px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    position: "relative",
                }}
            >
                <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                        position: "absolute",
                        top: "15px",
                        left: "15px",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#4caf50",
                    }}
                >
                    ←
                </button>

                {/* Título */}
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#4caf50", marginBottom: "20px" }}>
                    Mi Perfil
                </h1>

                <div
                    style={{
                        width: "120px",
                        height: "120px",
                        margin: "0 auto 20px",
                        borderRadius: "50%",
                        background: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                        overflow: "hidden",
                    }}
                >
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt="Imagen de perfil"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "default-avatar.png";
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(135deg, #2196f3, #4caf50)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                color: "#fff",
                            }}
                        >
                            User
                        </div>
                    )}
                </div>

                <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#333", marginBottom: "10px" }}>
                    {userInfo.username || "Nombre Usuario"}
                </h2>
                <p style={{ color: "#757575", fontSize: "16px", marginBottom: "20px" }}>
                    {userInfo.email || "correo@ejemplo.com"}
                </p>

                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <label
                        htmlFor="fileInput"
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#4caf50",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                        Subir Foto
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#2196f3",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                        Cambiar Foto de Perfil
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;