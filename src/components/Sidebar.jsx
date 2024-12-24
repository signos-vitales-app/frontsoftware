import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiUsers, FiUserPlus, FiSearch, FiUser } from 'react-icons/fi';
import { getUserInfo } from '../services/authService';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const response = await getUserInfo();
                setUserInfo(response.data); // Asegúrate de guardar los datos completos
            } catch (error) {
                console.error('Error al cargar la información del usuario:', error);
            }
        };
    
        loadUserInfo();
    }, []); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getProfileImageUrl = (imageName) => {
        if (!imageName) return 'default-avatar.png';
        return `${import.meta.env.VITE_API_URL}/uploads/profile-images/${imageName}`;
    };

    const isActive = (path) => {
        return window.location.pathname === path;
    };

    // Mapeo del rol del usuario a un nombre más amigable
    const getRoleDescription = (role) => {
        const roleDescriptions = {
            user: 'Enfermero/a',
            staff: 'Médico/a',
            jefe: 'Jefe de Enfermería',
        };
        return roleDescriptions[role] || 'Rol desconocido';
    };

    return (
            <div className={`fixed top-0 left-0 h-full bg-white text-black transition-all duration-300 ${isOpen ? 'w-68' : 'w-16'} shadow-lg z-50`}>

            {/* Botón para abrir/cerrar Sidebar */}
            <button
                onClick={() => setIsOpen(!isOpen)} // Al hacer clic cambia el estado de isOpen, abriendo o cerrando el sidebar
                className="absolute right-[-33px] top-20 bg-white p-3 rounded-r-md shadow-md text-blue-500 z-10" // Ajusta el valor de right y top para moverlo más afuera
            >
                {isOpen ? '◀' : '▶'} {/* Muestra el ícono de flecha dependiendo del estado de isOpen */}
            </button>
    
            <div className="flex flex-col p-4 pt-14 h-full">
                {/* Perfil de usuario */}
                <div className="flex flex-col items-center mb-6 mt-12">
                    {/* Contenedor de la imagen de perfil */}
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-2 border-black mb-3 transition-opacity duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    {/* Condición para verificar si el usuario tiene imagen de perfil */}
                        {userInfo?.profile_image ? (
                            <img
                                src={getProfileImageUrl(userInfo.profile_image)} // Si tiene imagen, la carga
                                alt="Profile"
                                className="w-full h-full object-cover" // Ajusta la imagen al contenedor circular
                                onError={(e) => {
                                    e.target.onerror = null; // Evita bucles en caso de error
                                    e.target.src = 'default-avatar.png'; // Si hay error, usa la imagen por defecto
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <FiUser size={40} className="text-gray-500" /> {/* Si no tiene imagen, muestra un ícono */}
                            </div>
                        )}
                    </div>
    
                    {/* Muestra el nombre de usuario y rol si el sidebar está abierto */}
                    {isOpen && userInfo && (
                        <div className="text-center">
                            <h3 className="font-bold">{userInfo.username}</h3> {/* Nombre del usuario */}
                            <p className="text-sm text-gray-500">{getRoleDescription(role)}</p> {/* Descripción del rol */}
                            <button className="mt-2 px-4 py-1 text-white bg-green-500 rounded-full text-sm font-semibold">
                                Activo {/* Botón verde que indica el estado "Activo" */}
                            </button>
                        </div>
                    )}
                </div>
    
                {/* Resto del contenido del sidebar */}
                <div className="flex-grow">
                    <nav className="space-y-4">
                        {/* Enlace a la página del Dashboard */}
                        <button
                            onClick={() => navigate('/dashboard')} // Al hacer clic navega al dashboard
                            className={`flex items-center w-full p-2 rounded ${isActive('/dashboard') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                        >
                            <FiHome size={20} className={`${isActive('/dashboard') ? 'text-white' : 'text-blue-600'}`} /> {/* Ícono de inicio */}
                            {isOpen && <span className="ml-3">Inicio</span>} {/* Si está abierto, muestra el texto */}
                        </button>
    
                        {/* Enlace a la página de búsqueda de pacientes */}
                        <button
                            onClick={() => navigate('/search-patient')} // Navega a la página de búsqueda de pacientes
                            className={`flex items-center w-full p-2 rounded ${isActive('/search-patient') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                        >
                            <FiSearch size={20} className={`${isActive('/search-patient') ? 'text-white' : 'text-blue-500'}`} /> {/* Ícono de búsqueda */}
                            {isOpen && <span className="ml-3">Buscar Paciente</span>} {/* Texto visible cuando el sidebar está abierto */}
                        </button>
    
                        {/* Enlace para registrar un nuevo paciente */}
                        <button
                            onClick={() => navigate('/register-patient')} // Navega a la página de registro de paciente
                            className={`flex items-center w-full p-2 rounded ${isActive('/register-patient') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                        >
                            <FiUserPlus size={20} className={`${isActive('/register-patient') ? 'text-white' : 'text-blue-500'}`} /> {/* Ícono de agregar paciente */}
                            {isOpen && <span className="ml-3">Registrar Paciente</span>} {/* Texto visible cuando el sidebar está abierto */}
                        </button>
    
                        {/* Panel administrador solo visible si el usuario tiene rol de "jefe" */}
                        {role === 'jefe' && (
                            <button
                                onClick={() => navigate('/admin-panel')} // Navega al panel de administración
                                className={`flex items-center w-full p-2 rounded ${isActive('/admin-panel') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                            >
                                <FiUsers
                                    size={20}
                                    className={`${isActive('/admin-panel') ? 'text-white' : 'text-blue-500'}`} /* Ícono azul de administración */
                                />
                                {isOpen && <span className="ml-3">Panel administrador</span>} {/* Texto visible cuando el sidebar está abierto */}
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;