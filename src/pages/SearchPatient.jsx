import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPatients, updatePatientStatus } from "../services/patientService";
import { FiHome, FiX } from "react-icons/fi";
import { FaCamera } from 'react-icons/fa';
import { Html5QrcodeScanner } from "html5-qrcode";
import { BiSolidSpreadsheet } from "react-icons/bi";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";

const SearchPatient = () => {
    const [patients, setPatients] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [selectedIdPaciente, setSelectedIdPaciente] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [scanCompleted, setScanCompleted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Página actual del slider
    const navigate = useNavigate();

    const patientsPerPage = 10; // Pacientes por página

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        if (isScanning) {
            handleOpenQRScanner();
        }
    }, [isScanning]);
    useEffect(() => {
        if (searchId) {
            const foundPatient = patients.find(patient => patient.numero_identificacion === searchId);
            if (foundPatient) {
                // Calcula la página donde se encuentra el paciente
                const patientIndex = sortedPatients.findIndex(patient => patient.numero_identificacion === searchId);
                const pageNumber = Math.ceil((patientIndex + 1) / patientsPerPage);

                // Actualiza el estado para mostrar el paciente en la tabla
                setCurrentPage(pageNumber);
                setSelectedIdPaciente(foundPatient.id); // Selecciona al paciente automáticamente
            } else {
                setSelectedIdPaciente(null); // Deselecciona si no hay coincidencia
            }
        } else {
            setSelectedIdPaciente(null); // Deselecciona si el campo está vacío
        }
    }, [searchId, patients]);

    const loadPatients = async () => {
        const response = await fetchPatients();
        setPatients(response.data);
    };

    const handleStatusToggle = async (idPaciente, currentStatus) => {
        const newStatus = currentStatus === "activo" ? "inactivo" : "activo";
        await updatePatientStatus(idPaciente, newStatus);
        loadPatients();
    };

    const filteredPatients = patients.filter(patient =>
        patient.numero_identificacion.includes(searchId)
    );

    // Ordenar alfabéticamente por primer nombre, segundo nombre, primer apellido y segundo apellido
    const sortedPatients = [...filteredPatients].sort((a, b) => {
        if (a.primer_nombre < b.primer_nombre) return -1;
        if (a.primer_nombre > b.primer_nombre) return 1;
        if (a.segundo_nombre < b.segundo_nombre) return -1;
        if (a.segundo_nombre > b.segundo_nombre) return 1;
        if (a.primer_apellido < b.primer_apellido) return -1;
        if (a.primer_apellido > b.primer_apellido) return 1;
        if (a.segundo_apellido < b.segundo_apellido) return -1;
        if (a.segundo_apellido > b.segundo_apellido) return 1;
        return 0;
    });

    const capitalizeWords = (text) => {
        if (!text) return text;
        const exceptions = ["de", "del", "y"]; // Palabras que deben permanecer en minúsculas
        return text
            .split(" ")
            .map((word, index) => 
                exceptions.includes(word.toLowerCase()) && index !== 0
                    ? word.toLowerCase()
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
    };    

    // Calcular la paginación
    const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = sortedPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    const handleSelectPatient = (id) => {
        setSelectedIdPaciente(id);
    };

    const handleRegisterData = () => {
        if (selectedIdPaciente) {
            navigate(`/patient/${selectedIdPaciente}/records`);
        } else {
            toast.error("Debes seleccionar un paciente", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleScan = (qrCodeMessage) => {
        if (qrCodeMessage && !scanCompleted) {
            setSearchId(qrCodeMessage);  // Actualiza el valor de búsqueda
            setErrorMessage("");         // Borra mensajes de error previos
            setScanCompleted(true);      // Marca que el escaneo ha sido completado

            // Busca al paciente con el número de identificación del QR
            const foundPatient = patients.find(patient => patient.numero_identificacion === qrCodeMessage);
            if (foundPatient) {
                // Calcula la página donde se encuentra el paciente
                const patientIndex = sortedPatients.findIndex(patient => patient.numero_identificacion === qrCodeMessage);
                const pageNumber = Math.ceil((patientIndex + 1) / patientsPerPage);

                // Actualiza el estado para mostrar el paciente en la tabla
                setCurrentPage(pageNumber);
                setSelectedIdPaciente(foundPatient.id); // Selecciona al paciente automáticamente
            } else {
                toast.error("Paciente no encontrado.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        setScanCompleted(true);
    };

    const requestCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (stream) {
                setCameraPermission(true);
                handleOpenQRScanner();
            }
        } catch (err) {
            setCameraPermission(false);
            setErrorMessage("Permiso de cámara denegado o no disponible.");
        }
    };

    const handleOpenQRScanner = () => {
        if (!cameraPermission) {
            requestCameraPermission();
            return;
        }

        setSearchId("");
        setErrorMessage("");
        setIsScanning(true);
        setScanCompleted(false);

        const scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        });

        scanner.render((decodedText) => {
            handleScan(decodedText);
        }, (errorMessage) => {
            console.log(`Error de escaneo: ${errorMessage}`);
        });
    };

    const handleCancelScan = () => {
        setIsScanning(false);
        setErrorMessage("");
        setScanCompleted(false);
    };

    const handleGoBack = () => {
        navigate("/dashboard");
    };
    const handleEdit = (idPaciente) => {
        navigate(`/edit-patient/${idPaciente}`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-bold text-blue-600 mt-10 mb-6">Búsqueda de Pacientes</h1>
    
            {/* Barra de búsqueda */}
            <input
                type="text"
                placeholder="Buscar paciente por número de identificación"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="p-3 border border-blue-300 rounded-lg shadow-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-800 mb-4"
            />
    
            {/* Botón de solicitar acceso a la cámara */}
            <button
                onClick={handleOpenQRScanner}
                className="mb-9 px-5 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center"
            >
                <FaCamera className="mr-5" />
                {cameraPermission === null
                    ? "Solicitar acceso a la cámara"
                    : "Escanear Código QR"}
            </button>
    
            {/* Mensaje de error si no hay acceso a la cámara */}
            {cameraPermission === false && (
                <div className="text-red-500 font-bold mb-6">
                    No se ha concedido acceso a la cámara. Verifique los permisos en su navegador.
                </div>
            )}
    
            {/* Sección de escaneo de QR */}
            {isScanning && (
                <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-6 w-full max-w-xs mb-6">
                    <div
                        id="qr-reader"
                        className="mb-4"
                        style={{ width: "250px", height: "250px" }}
                    ></div>
                    <button
                        onClick={handleCancelScan}
                        className="mt-4 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center"
                    >
                        <FiX className="mr-3" />
                        Cancelar Escaneo
                    </button>
                </div>
            )}
    
            {/* Mensaje de error general */}
            {errorMessage && (
                <div className="text-red-500 font-bold mb-6">{errorMessage}</div>
            )}
    
            {/* Tabla de pacientes */}
            <table className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden mb-6 text-center">
                <thead className="bg-blue-200 text-blue-700">
                    <tr>
                        <th className="p-4">Primer nombre</th>
                        <th className="p-4">Segundo nombre</th>
                        <th className="p-4">Primer apellido</th>
                        <th className="p-4">Segundo apellido</th>
                        <th className="p-4">Tipo de identificación</th>
                        <th className="p-4">Número de identificación</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Editar</th>
                        <th className="p-4">Seleccionar</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPatients.map((patient) => (
                        <tr
                            key={patient.id}
                            className="border-b hover:bg-gray-100 transition-colors duration-300 ease-in-out"
                        >
                            <td className="p-4">{patient.primer_nombre}</td>
                            <td className="p-4">{patient.segundo_nombre}</td>
                            <td className="p-4">{patient.primer_apellido}</td>
                            <td className="p-4">{patient.segundo_apellido}</td>
                            <td className="p-4">{capitalizeWords(patient.tipo_identificacion)}</td>
                            <td className="p-4">{patient.numero_identificacion}</td>
                            <td className="p-4">{patient.ubicacion}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleStatusToggle(patient.id, patient.status)}
                                    className={`px-6 py-2 rounded-lg ${
                                        patient.status === "activo"
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-red-500 hover:bg-red-600"
                                    } text-white font-semibold transition duration-300`}
                                >
                                    {patient.status === "activo" ? "Activo" : "Inactivo"}
                                </button>
                            </td>
                            <td className="p-6">
                                <button
                                    onClick={() => handleEdit(patient.id)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    &#9998;
                                </button>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleSelectPatient(patient.id)}
                                    className={`px-6 py-2 rounded-lg ${
                                        selectedIdPaciente === patient.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    Seleccionar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            {/* Paginación */}
            <div className="mt-6 w-full max-w-4xl flex justify-center items-center space-x-6">
                <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                        currentPage > 1
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                    Anterior
                </button>
                <span className="text-gray-700 text-xl">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                        currentPage < totalPages
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                    Siguiente
                </button>
            </div>
    
            {/* Botones de acción */}
            <div className="mt-8 flex justify-center w-full max-w-4xl space-x-6">
                <button
                    onClick={handleGoBack}
                    className="flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                    <FiHome className="mr-3" />
                    Menú principal
                </button>
                <button
                    onClick={handleRegisterData}
                    className={`px-6 py-3 text-white font-semibold rounded-lg flex items-center space-x-3 ${
                        selectedIdPaciente
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                    <BiSolidSpreadsheet className="mr-3" />
                    Ir a registros
                </button>
            </div>
        </div>
    );     
};

export default SearchPatient;