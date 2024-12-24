import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updatePassword } from "../services/authService";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Iconos de candado y ojo

const ChangePassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseñas

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:\"<>?~`.]).{8,16}$/;
        return regex.test(password);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("La contraseña no coincide.");
            return;
        }

        if (!validatePassword(newPassword)) {
            setError("La contraseña debe tener entre 8 y 16 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.");
            return;
        }

        try {
            await updatePassword(token, newPassword);
            setSuccess("Contraseña actualizada exitosamente.");
            setError(null);
        } catch (err) {
            setError("No se pudo actualizar la contraseña. Es posible que el enlace haya caducado.");
            setSuccess(null);
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center relative">
            {/* Fondo degradado */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(135deg, #6dd5ed, #2193b0)", // Degradado en tonos de salud
                    animation: "gradient 6s ease infinite"
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
                    .animated-gradient {
                        background-size: 200% 200%;
                    }
                `}
            </style>

            {/* Formulario */}
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl relative z-10">
                <h2 className="text-center text-3xl font-bold mb-6 text-blue-600">Cambiar contraseña</h2>

                {/* Campo para la nueva contraseña */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"} // Muestra u oculta la contraseña
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
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* Campo para confirmar la nueva contraseña */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"} // Muestra u oculta la contraseña
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
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* Mensajes de error y éxito */}
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

                {/* Botón de cambio de contraseña */}
                <button
                    type="submit"
                    onClick={handleChangePassword}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-full hover:from-blue-600 hover:to-blue-800 transition shadow-lg"
                >
                    Cambiar contraseña
                </button>

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
        </div>
    );
};

export default ChangePassword;