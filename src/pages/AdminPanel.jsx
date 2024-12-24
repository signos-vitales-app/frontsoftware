import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClipboardCheck, FaUserPlus, FaUserNurse } from "react-icons/fa6";
import { FaUsersGear } from "react-icons/fa6";

const AdminPanel = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6 overflow-hidden">
            {/* Título principal con animaciones */}
            <motion.h1
                className="text-5xl font-bold mb-6 flex items-center gap-4 text-blue-600"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                ¡Hola, jefe de enfermería!
            </motion.h1>

            {/* Subtítulo con gradiente */}
            <motion.h2
                className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-green-400 mb-4 text-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                ¡Te damos la bienvenida a tu panel de administración!
            </motion.h2>

            {/* Mensaje descriptivo */}
            <motion.div
                className="bg-blue-50 p-6 rounded-lg shadow-2xl mb-8 text-center max-w-3xl mx-auto border-2 border-blue-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <FaClipboardCheck className="inline-block text-blue-600 text-4xl mb-4" />
                <p className="text-lg text-gray-700">
                    En este panel puedes buscar y registrar nuevos usuarios, así como observar la trazabilidad de las acciones realizadas en el sistema.
                </p>
            </motion.div>

            {/* Sección de botones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Botón de búsqueda de usuario */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    onClick={() => navigate("/search-user")}
                >
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="relative"
                    >
                        <FaUserNurse className="w-20 h-20 text-blue-500 mb-6 transition-transform transform hover:scale-110" />
                    </motion.div>
                    <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                        Buscar usuario
                    </button>
                </motion.div>

                {/* Botón de registro de usuario */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onClick={() => navigate("/register-user")}
                >
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="relative"
                    >
                        <FaUserPlus className="w-20 h-20 text-green-500 mb-6 transition-transform transform hover:scale-110" />
                    </motion.div>
                    <button className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                        Registrar usuario
                    </button>
                </motion.div>

                {/* Botón de trazabilidad */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    onClick={() => navigate("/trazabilidad")}
                >
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="relative"
                    >
                        <FaUsersGear className="w-20 h-20 text-purple-500 mb-6 transition-transform transform hover:scale-110" />
                    </motion.div>
                    <button className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-all duration-300 transform hover:scale-105">
                        Trazabilidad
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPanel;