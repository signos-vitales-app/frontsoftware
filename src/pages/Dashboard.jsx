import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUserPlus, FaHandSparkles, FaUserNurse } from "react-icons/fa";
import { motion } from "framer-motion";
import { getUserInfo } from '../services/authService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState(localStorage.getItem("username"));

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo();
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-blue-50 to-white-100 overflow-hidden fixed">
            <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full h-full p-6">
                {/* Header */}
                <motion.h1
                    className="text-5xl font-bold mb-6 flex items-center gap-4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-blue-600">¡Hola, {username}!</span>
                    <FaHandSparkles className="text-5xl text-blue-500" />
                </motion.h1>

                {/* Welcome Message */}
                <motion.h2
                    className="text-3xl font-semibold text-blue-700 mb-8"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                >
                    ¡Bienvenido a tu panel principal!
                </motion.h2>

                {/* Information Box */}
                <motion.div
                    className="bg-blue-100 p-6 rounded-lg shadow-lg mb-8 text-center w-full border border-blue-500 flex flex-col items-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex justify-center mb-4">
                        <FaUserNurse className="text-blue-700 text-4xl transform scale-100 hover:scale-100 transition-transform duration-350" />
                    </div>
                    <p className="text-lg text-black-700">
                        Aquí puedes gestionar los datos de los pacientes que se te han asignado.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                    {/* Search Patient */}
                    <motion.div
                        className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 border-2 border-transparent"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate("/search-patient")}
                    >
                        <FaSearch className="text-blue-500 text-6xl mb-4 transform hover:scale-110 transition-transform duration-300" />
                        <button
                            className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300"
                        >
                            Buscar Paciente
                        </button>

                        <p className="mt-6 text-gray-700 text-center">
                            Encuentra la información del paciente.
                        </p>
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 border-2 border-transparent"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate("/register-patient")}
                    >
                        <FaUserPlus className="text-green-500 text-6xl mb-4 transform hover:scale-110 transition-transform duration-300" />
                        <button
                            className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all duration-300"
                        >
                            Registrar Paciente
                        </button>

                        <p className="mt-6 text-gray-700 text-center">
                            Agrega un nuevo paciente al sistema.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;