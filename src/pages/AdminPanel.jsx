import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClipboardCheck, FaUserPlus, FaUserNurse, FaUsersGear } from "react-icons/fa6";

const AdminPanel = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-r from-blue-50 to-white-100 p-6 overflow-hidden fixed">
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
                className="text-3xl font-semibold text-blue-700 mb-8 text-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                ¡Te damos la bienvenida a tu panel de administración!
            </motion.h2>

            {/* Mensaje descriptivo */}
            <motion.div
                className="bg-blue-100 p-6 rounded-lg shadow-lg mb-12 text-center max-w-3xl mx-auto border border-blue-500 flex flex-col items-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <FaClipboardCheck className="text-blue-700 text-4xl mb-4" />
                <p className="text-lg text-gray-700">
                    En este panel puedes buscar y registrar nuevos usuarios, así como observar la trazabilidad de las acciones realizadas en el sistema.
                </p>
            </motion.div>

            {/* Sección de botones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
                {/* Botón de búsqueda de usuario */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate("/search-user")}
                >
                    <FaUserNurse className="text-blue-500 text-6xl mb-6 transform hover:scale-110 transition-transform duration-300" />
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 transition-all duration-300">
                        Buscar usuario
                    </button>
                </motion.div>

                {/* Botón de registro de usuario */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate("/register-user")}
                >
                    <FaUserPlus className="text-green-500 text-6xl mb-6 transform hover:scale-110 transition-transform duration-300" />
                    <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-md hover:bg-green-700 transition-all duration-300">
                        Registrar usuario
                    </button>
                </motion.div>

                {/* Botón de trazabilidad */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate("/trazabilidad")}
                >
                    <FaUsersGear className="text-purple-500 text-6xl mb-6 transform hover:scale-110 transition-transform duration-300" />
                    <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-md hover:bg-purple-700 transition-all duration-300">
                        Trazabilidad
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPanel;