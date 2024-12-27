import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPatientInfo, updatePatient } from "../services/patientService";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaSave, FaClipboard } from 'react-icons/fa';
import { FiHome } from 'react-icons/fi';

const EditPatient = () => {
    const { idPaciente } = useParams();
    const navigate = useNavigate();

    const [primerNombre, setprimerNombre] = useState("");
    const [segundoNombre, setSegundoNombre] = useState("");
    const [primerApellido, setprimerApellido] = useState("");
    const [segundoApellido, setSegundoApellido] = useState("");
    const [tipoIdentificacion, settipoIdentificacion] = useState("");
    const [numeroIdentificacion, setnumeroIdentificacion] = useState("");
    const [ubicacion, setubicacion] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [status, setStatus] = useState("activo");
    const [edad, setEdad] = useState(null);
    const [ageGroup, setAgeGroup] = useState(""); // Nueva variable para age_group
    const [loading, setLoading] = useState(true);
    const currentDate = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

    // Función para calcular la edad en años
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

    // Función para calcular la edad en meses
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

    // Función para calcular el grupo de edad
    const calculateAgeGroup = (fechaNacimiento) => {
        const birth = new Date(fechaNacimiento);
        const today = new Date();
        const ageInMonths =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth()) -
            (today.getDate() < birth.getDate() ? 1 : 0);

        if (ageInMonths >= 0 && ageInMonths <= 3) return 'Recién nacido';
        if (ageInMonths > 3 && ageInMonths <= 6) return 'Lactante tempranoprano';
        if (ageInMonths > 6 && ageInMonths <= 12) return 'Lactante mayor';
        if (ageInMonths > 12 && ageInMonths <= 36) return 'Niño pequeño';
        if (ageInMonths > 36 && ageInMonths <= 72) return 'Preescolar temprano';
        if (ageInMonths > 72 && ageInMonths <= 180) return 'Preescolar tardío';
        return 'Adulto';
    };

    const handleFechaNacimientoChange = (date) => {
        setFechaNacimiento(date);
        const age = calculateAge(date);
        setEdad(age);

        // Calcular el grupo de edad
        const group = calculateAgeGroup(date);
        setAgeGroup(group);
        if (age !== null) {
            settipoIdentificacion(age > 20 ? "cédula de ciudadanía" : "tarjeta de identidad");
        }
    };

    useEffect(() => {
        const loadPatientData = async () => {
            try {
                const response = await fetchPatientInfo(idPaciente);
                const patient = response.data;

                if (patient.fecha_nacimiento) {
                    patient.fecha_nacimiento = new Date(patient.fecha_nacimiento)
                        .toISOString()
                        .split("T")[0];
                }

                setprimerNombre(patient.primer_nombre || "");
                setSegundoNombre(patient.segundo_nombre || "");
                setprimerApellido(patient.primer_apellido || "");
                setSegundoApellido(patient.segundo_apellido || "");
                settipoIdentificacion(patient.tipo_identificacion || "cédula de ciudadanía");
                setnumeroIdentificacion(patient.numero_identificacion || "");
                setubicacion(patient.ubicacion || "");
                setFechaNacimiento(patient.fecha_nacimiento || "");
                setStatus(patient.status || "activo");

                // Calcular y asignar el grupo de edad
                const calculatedAge = calculateAge(patient.fecha_nacimiento);
                setEdad(calculatedAge);
                const group = patient.age_group || calculateAgeGroup(patient.fecha_nacimiento); // Usar age_group del backend
                setAgeGroup(group);

                setLoading(false);
            } catch (error) {
                toast.error("Error al cargar los datos del paciente");
                setLoading(false);
            }
        };

        loadPatientData();
    }, [idPaciente]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token'); // Asegúrate de guardar el token al iniciar sesión

            if (!token) {
                toast.error("No se encontró un token. Por favor, inicia sesión.");
                return;
            }

            await updatePatient(idPaciente, {
                primer_nombre: primerNombre,
                segundo_nombre: segundoNombre,
                primer_apellido: primerApellido,
                segundo_apellido: segundoApellido,
                tipo_identificacion: tipoIdentificacion,
                numero_identificacion: numeroIdentificacion,
                ubicacion,
                fecha_nacimiento: fechaNacimiento,
                status,
                edad,
                age_group: ageGroup,
            }, token // Pasa el token al servicio

            );
            toast.success("Paciente actualizado exitosamente");
            navigate("/search-patient");
        } catch (error) {
            toast.error("Error al actualizar el paciente");
        }
    };

    const handleGoBack = () => {
        navigate("/search-patient");
    };

    if (loading) return <div>Cargando...</div>;

    // Mostrar la edad en meses o años según corresponda
    const displayAge = () => {
        const ageInMonths = calculateAgeInMonths(fechaNacimiento);
        if (ageInMonths <= 24) {
            return `${ageInMonths} meses`;
        } else {
            return `${edad} años`;
        }
    };

    return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleUpdate}
                    className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg my-8"
                >
                    {/* Encabezado */}
                    <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 flex items-center justify-center gap-2">
                         📝Editar paciente
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
                                onChange={(e) => settipoIdentificacion(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                            >
                                <option value="cédula de ciudadanía">Cédula de Ciudadanía</option>
                                <option value="tarjeta de identidad">Tarjeta de Identidad</option>
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
                            className="flex items-center px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition"
                        >
                            <FiHome size={18} className="mr-2" /> Regresar
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

export default EditPatient;