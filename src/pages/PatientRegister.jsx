import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient } from "../services/patientService";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaClipboard, FaSave } from 'react-icons/fa';  // Usamos FaClipboard para el icono de planilla
import { FiHome } from 'react-icons/fi';  // Usamos FaClipboard para el icono de planilla

const PatientRegister = () => {
    const navigate = useNavigate();
    const [primerNombre, setprimerNombre] = useState("");
    const [segundoNombre, setSegundoNombre] = useState("");
    const [primerApellido, setprimerApellido] = useState("");
    const [segundoApellido, setSegundoApellido] = useState("");
    const [numeroIdentificacion, setnumeroIdentificacion] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [tipoIdentificacion, settipoIdentificacion] = useState("cédula de ciudadanía");
    const [ubicacion, setubicacion] = useState("");
    const [status, setStatus] = useState("activo");
    const [edad, setEdad] = useState(null);
    const [ageGroup, setAgeGroup] = useState("");
    const currentDate = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

    const calculateAge = (date) => {
        if (!date) return null;
        const birth = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const calculateAgeInMonths = (date) => {
        if (!date) return null;
        const birth = new Date(date);
        const today = new Date();
        const ageInMonths =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth()) -
            (today.getDate() < birth.getDate() ? 1 : 0);
        return ageInMonths;
    };

    const calculateAgeGroup = (fechaNacimiento) => {
        const ageInMonths = calculateAgeInMonths(fechaNacimiento);
        if (ageInMonths >= 0 && ageInMonths <= 3) return 'Recién nacido';
        if (ageInMonths > 3 && ageInMonths <= 6) return 'Lactante temprano';
        if (ageInMonths > 6 && ageInMonths <= 12) return 'Lactante mayor';
        if (ageInMonths > 12 && ageInMonths <= 36) return 'Niño pequeño';
        if (ageInMonths > 36 && ageInMonths <= 72) return 'Preescolar temprano';
        if (ageInMonths > 72 && ageInMonths <= 180) return 'Preescolar tardío';
        return 'Adulto';
    };

    const handleTipoIdentificacionChange = (e) => {
        settipoIdentificacion(e.target.value); // Permite al usuario cambiar manualmente el valor
    };

    const handleFechaNacimientoChange = (date) => {
        setFechaNacimiento(date);
        const age = calculateAge(date);
        setEdad(age);

        const group = calculateAgeGroup(date);
        setAgeGroup(group);

        // Cambiar automáticamente el tipo de identificación si no ha sido sobrescrito manualmente
        if (age !== null) {
            settipoIdentificacion(age > 20 ? "Cédula de Ciudadanía" : "Tarjeta de Identidad");
        }
    };

    const validateNumeroID = (numeroIdentificacion) => {
        const regex = /^\d{6,15}$/;
        return regex.test(numeroIdentificacion);
    }
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token'); // Asegúrate de guardar el token al iniciar sesión

            if (!token) {
                toast.error("No se encontró un token. Por favor, inicia sesión.");
                return;
            }
            if (!validateNumeroID(numeroIdentificacion)) {
                toast.error("El número de identificación debe contener solo números y debe contener minimo 6 digitos");
                return;
            }

            await registerPatient({
                primer_nombre: primerNombre,
                segundo_nombre: segundoNombre,
                primer_apellido: primerApellido,
                segundo_apellido: segundoApellido,
                numero_identificacion: numeroIdentificacion,
                fecha_nacimiento: fechaNacimiento,
                tipo_identificacion: tipoIdentificacion,
                ubicacion,
                status,
                age_group: ageGroup
            },
                token // Pasa el token al servicio
            );
            toast.success("Paciente registrado exitosamente!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error en el registro", err);
            toast.error("No se pudo registrar al paciente. Inténtelo nuevamente.");
        }
    };

    const displayAge = () => {
        if (!fechaNacimiento) {
            return ""; // No mostrar nada si no hay fecha de nacimiento
        }

        const ageInMonths = calculateAgeInMonths(fechaNacimiento);

        if (ageInMonths <= 24) {
            return `${ageInMonths} meses`;
        } else {
            return `${edad} años`;
        }
    };

    const handleGoBack = () => {
        navigate("/dashboard");
    };

    return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleRegister}
                    className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg my-8"
                >
                    {/* Encabezado */}
                    <h2 className="text-3xl font-bold mb-8 text-center text-blue-800 flex items-center justify-center gap-2">
                        <FaClipboard size={25} /> Registrar paciente
                    </h2>
        
                    {/* Campos en Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {/* Primer Nombre */}
                        <div className="flex flex-col">
                            <label htmlFor="primerNombre" className="text-sm font-semibold mb-1">
                                Primer nombre
                            </label>
                            <input
                                id="primerNombre"
                                type="text"
                                value={primerNombre}
                                onChange={(e) => setprimerNombre(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Segundo Nombre */}
                        <div className="flex flex-col">
                            <label htmlFor="segundoNombre" className="text-sm font-semibold mb-1">
                                Segundo nombre
                            </label>
                            <input
                                id="segundoNombre"
                                type="text"
                                value={segundoNombre}
                                onChange={(e) => setSegundoNombre(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Primer Apellido */}
                        <div className="flex flex-col">
                            <label htmlFor="primerApellido" className="text-sm font-semibold mb-1">
                                Primer apellido
                            </label>
                            <input
                                id="primerApellido"
                                type="text"
                                value={primerApellido}
                                onChange={(e) => setprimerApellido(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Segundo Apellido */}
                        <div className="flex flex-col">
                            <label htmlFor="segundoApellido" className="text-sm font-semibold mb-1">
                                Segundo apellido
                            </label>
                            <input
                                id="segundoApellido"
                                type="text"
                                value={segundoApellido}
                                onChange={(e) => setSegundoApellido(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Tipo de Identificación */}
                        <div className="flex flex-col">
                            <label htmlFor="tipoIdentificacion" className="text-sm font-semibold mb-1">
                                Tipo de identificación
                            </label>
                            <select
                                id="tipoIdentificacion"
                                value={tipoIdentificacion}
                                onChange={handleTipoIdentificacionChange}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            >
                                <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                            </select>
                        </div>
        
                        {/* Número de Identificación */}
                        <div className="flex flex-col">
                            <label htmlFor="numeroIdentificacion" className="text-sm font-semibold mb-1">
                                Número de identificación
                            </label>
                            <input
                                id="numeroIdentificacion"
                                type="text"
                                value={numeroIdentificacion}
                                onChange={(e) => setnumeroIdentificacion(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Fecha de Nacimiento */}
                        <div className="flex flex-col">
                            <label htmlFor="fechaNacimiento" className="text-sm font-semibold mb-1">
                                Fecha de nacimiento
                            </label>
                            <input
                                id="fechaNacimiento"
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => handleFechaNacimientoChange(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Ubicación */}
                        <div className="flex flex-col">
                            <label htmlFor="ubicacion" className="text-sm font-semibold mb-1">
                                Ubicación (habitación)
                            </label>
                            <input
                                id="ubicacion"
                                type="text"
                                value={ubicacion}
                                onChange={(e) => setubicacion(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
        
                        {/* Estado */}
                        <div className="flex flex-col sm:col-span-2">
                            <label htmlFor="status" className="text-sm font-semibold mb-1">
                                Estado
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
        
                    {/* Mostrar Edad y Tipo de Paciente */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-300">
                        <p className="mb-1">
                            <span className="font-semibold">Edad:</span> {displayAge()}
                        </p>
                        <p>
                            <span className="font-semibold">Tipo de paciente:</span> {ageGroup}
                        </p>
                    </div>
        
                    {/* Botones */}
                    <div className="flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="flex items-center px-4 py-2.5 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                            <FiHome size={18} className="mr-2" /> Menú Principal
                        </button>
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2.5 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                            <FaSave size={18} className="mr-2" /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        );        
};

export default PatientRegister;