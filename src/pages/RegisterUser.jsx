import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiHome, FiUser } from "react-icons/fi";
import { FaEye, FaEyeSlash, FaUserPlus, FaExclamationTriangle } from "react-icons/fa";
import Select from "react-select";

const RegisterUser = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("user");
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const options = [
        { value: "user", label: "Enfermero/a" },
        { value: "jefe", label: "Jefe de enfermería" },
        { value: "staff", label: "Médico/a" },
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`.]).{8,16}$/;
        return regex.test(password);
    };
    const validateNumeroID = (numeroIdentificacion) => {
        const regex = /^\d{6,15}$/;
        return regex.test(numeroIdentificacion);
    }

    const handleRegister = async (e) => {
        e.preventDefault();

        // Verificar si hay campos vacíos
        if (!username || !email || !password || !confirmPassword || !numeroIdentificacion || !role) {
            toast.error("Por favor, complete todos los campos.");
            return;
        }

        // Verificación de contraseñas
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        // Validar contraseña
        if (!validatePassword(password)) {
            toast.error("La contraseña debe tener entre 8 y 16 caracteres, incluyendo al menos una mayúscula, una minúscula, un número y un carácter especial.");
            return;
        }

        // Validar número de identificación
        if (!validateNumeroID(numeroIdentificacion)) {
            toast.error("El número de identificación debe contener solo números y debe contener mínimo 6 dígitos.");
            return;
        }
        if (username.length < 6) {
            toast.error("El nombre de usuario debe tener al menos 6 caracteres.");
            return;
        }

        // Aquí puedes agregar la lógica para el registro del usuario
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);
            formData.append("email", email);
            formData.append("role", role);
            if (profileImage) {
                formData.append("profileImage", profileImage);
            }
            formData.append("numero_identificacion", numeroIdentificacion);

            await register(formData);
            toast.success("Usuario registrado exitosamente!");
            navigate("/admin-panel");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error en el registro. Intente nuevamente.";
            toast.error(errorMessage);
        }
    };

    const handleGoBack = () => {
        setShowModal(true); // Mostrar el modal al hacer clic en regresar
    };

    const handleConfirmGoBack = () => {
        setShowModal(false);
        navigate("/admin-panel"); // Redirigir al panel cuando se confirme
    };

    const handleCancelGoBack = () => {
        setShowModal(false); // Cerrar el modal sin hacer nada
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-white"
            style={{ marginTop: "60px" }}
        >
            <form
                onSubmit={handleRegister}
                className="w-full max-w-xl p-6 bg-white border border-gray-300 rounded-2xl shadow-lg space-y-4"
            >
                <h2
                    style={{
                        fontWeight: "bold",
                        color: "#2563eb",
                        textAlign: "center",
                    }}
                    className="text-2xl flex items-center justify-center gap-2"
                >
                    <FaUserPlus size={24} /> Registrar nuevo usuario
                </h2>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center shadow-md">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                            <FiUser size={40} className="text-gray-400" />
                        )}
                    </div>
                    <label className="cursor-pointer bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-sm">
                        Subir imagen de perfil
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">
                            Nombres y apellidos
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-12 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="numeroIdentificacion" className="text-sm font-medium text-gray-700 mb-1">
                            Número de identificación
                        </label>
                        <input
                            type="text"
                            id="numeroIdentificacion"
                            value={numeroIdentificacion}
                            onChange={(e) => setNumeroIdentificacion(e.target.value)}
                            className="w-full h-12 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative flex flex-col">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    <div className="relative flex flex-col">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 text-gray-500"
                        >
                            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1">
                        Rol
                    </label>
                    <Select
                        id="role"
                        options={options}
                        placeholder="Selecciona el Rol"
                        value={options.find((option) => option.value === role)}
                        onChange={(selectedOption) => setRole(selectedOption?.value || "")}
                        classNamePrefix="custom-select"
                        styles={{
                            control: (base) => ({
                                ...base,
                                border: "1px solid #D1D5DB",
                                borderRadius: "0.375rem",
                                boxShadow: "none",
                                padding: "3px",
                                "&:hover": { borderColor: "#3B82F6" },
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 9999, // Asegura que el menú esté por encima
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: "#9CA3AF", // Color del texto placeholder
                            }),
                        }}
                        menuPortalTarget={document.body} // Renderiza el menú dentro del body
                        menuPlacement="auto" // Abre hacia arriba o abajo automáticamente
                    />
                </div>

                <div className="flex justify-center gap-6">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
                    >
                        <FiHome size={20} className="mr-2" /> Regresar al Panel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition duration-300 shadow-md"
                    >
                        <FaUserPlus size={20} className="mr-2" /> Registrar
                    </button>
                </div>
            </form>

            {/* Modal de confirmación */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex justify-center mb-4">
                            <FaExclamationTriangle size={40} className="text-yellow-500" /> {/* Emoji de advertencia */}
                        </div>
                        <h3 className="text-xl font-semibold text-center mb-4">¿Seguro que deseas regresar?</h3>
                        <p className="text-center mb-4">Perderás todos los datos ingresados si no los guardas.</p>
                        <div className="flex justify-around">
                            <button
                                onClick={handleConfirmGoBack}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                            >
                                Sí, regresar
                            </button>
                            <button
                                onClick={handleCancelGoBack}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                            >
                                No, continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterUser;