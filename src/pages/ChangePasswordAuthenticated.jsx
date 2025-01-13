import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordAuthenticated } from "../services/authService"; // Correct function name
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Iconos de candado y ojo
import { ToastContainer, toast } from "react-toastify"; // Importa toast
import "react-toastify/dist/ReactToastify.css"; // Estilo de toast

const ChangePassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Agregado para mostrar la contraseña actual
    const [currentPassword, setCurrentPassword] = useState(""); // Estado para la contraseña actual

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:\"<>?~`.]).{8,16}$/;
        return regex.test(password);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
    
        // Verificar si algún campo está vacío
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Por favor, completa todos los campos para poder cambiar la contraseña.");
            return;
        }
    
        // Verificar si las contraseñas no coinciden
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
    
        // Validar la nueva contraseña
        if (!validatePassword(newPassword)) {
            setError("La contraseña debe tener entre 8 y 16 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.");
            return;
        }
    
        // Verificar que se haya ingresado la contraseña actual
        if (!currentPassword) {
            setError("Debes ingresar tu contraseña actual.");
            return;
        }
    
        try {
            // Llamada a la función para actualizar la contraseña autenticada
            const response = await changePasswordAuthenticated(currentPassword, newPassword);
    
            // Si la contraseña actual es correcta y la nueva se actualiza
            toast.success("Contraseña actualizada exitosamente!");
            setError(null);
        } catch (err) {
            // Aquí se manejan otros errores posibles durante el proceso de actualización
            console.error("Error al actualizar la contraseña:", err);  // Para depuración
    
            // Si el error es por un fallo general (por ejemplo, servidor no disponible)
            if (err.response && err.response.status === 401) {
                setError("La contraseña actual no es correcta.");
            } else {
                setError("Hubo un error al actualizar la contraseña. Intenta nuevamente.");
            }
    
            // Mostrar un error en el toast
            toast.error("Hubo un error al actualizar la contraseña.");
        }
    };
    
    return (
        <div className="flex flex-col h-screen items-center justify-center relative">
            {/* Fondo degradado con animación */}
            <div
                className="absolute inset-0 z-0 animated-gradient"
                style={{
                    background: "linear-gradient(135deg, #64b5f6, #42a5f5)", // Gradiente azul
                    animation: "gradient 6s ease infinite",
                    backgroundSize: "200% 200%",
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

            {/* Formulario */}
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl relative z-10">
                <h2 className="text-center text-3xl font-bold mb-6 text-blue-600">Cambiar contraseña</h2>

                {/* Campo para la contraseña actual */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"} // Muestra u oculta la contraseña
                            placeholder="Contraseña actual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-12 p-3 border border-gray-300 rounded-full bg-blue-50 focus:outline-none shadow-md"
                        />
                        <span className="absolute inset-y-0 left-4 flex items-center text-gray-600">
                            <FaLock />
                        </span>
                        {/* Icono de ver/ocultar contraseña */}
                        <span
                            className="absolute inset-y-0 right-4 flex items-center text-gray-600 cursor-pointer"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* Campo para la nueva contraseña */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"} // Muestra u oculta la contraseña
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-12 p-3 border border-gray-300 rounded-full bg-blue-50 focus:outline-none shadow-md"
                        />
                        <span className="absolute inset-y-0 left-4 flex items-center text-gray-600">
                            <FaLock />
                        </span>
                        {/* Icono de ver/ocultar contraseña */}
                        <span
                            className="absolute inset-y-0 right-4 flex items-center text-gray-600 cursor-pointer"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* Campo para confirmar la nueva contraseña */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"} // Muestra u oculta la contraseña
                            placeholder="Confirme la nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-12 p-3 border border-gray-300 rounded-full bg-blue-50 focus:outline-none shadow-md"
                        />
                        <span className="absolute inset-y-0 left-4 flex items-center text-gray-600">
                            <FaLock />
                        </span>
                        {/* Icono de ver/ocultar contraseña */}
                        <span
                            className="absolute inset-y-0 right-4 flex items-center text-gray-600 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* Mensajes de error y éxito */}
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                {/* Formulario de envío */}
                <form onSubmit={handleChangePassword}>
                    {/* Botón de cambio de contraseña */}
                    <button
                        type="submit"
                        className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-full hover:from-blue-600 hover:to-blue-800 transition shadow-lg"
                    >
                        Cambiar contraseña
                    </button>
                </form>

                {/* Enlace para ir al login */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-blue-500 hover:underline text-sm"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>

            {/* Contenedor de notificaciones */}
            <div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default ChangePassword;