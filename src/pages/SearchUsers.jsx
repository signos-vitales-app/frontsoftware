import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, toggleUserStatus, deleteUser } from "../services/authService";
import { FiHome, FiTrash2, FiUserCheck, FiUserX } from "react-icons/fi";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const roleNames = {
    user: "Enfermero/a",
    staff: "Médico/a",
    jefe: "Jefe de Enfermería",
};

const SearchUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();

                // Ordenar los usuarios por username (nombre)
                const sortedUsers = response.data.sort((a, b) => {
                    if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
                    if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
                    return 0;
                });

                setUsers(sortedUsers); // Guardar los usuarios ordenados
            } catch (error) {
                setError("Error al obtener los usuarios");
            }
        };
        fetchUsers();
    }, []);


    const handleToggleStatus = async (id, isActive) => {
        const userToToggle = users.find((user) => user.id === id);
        if (!userToToggle) return;

        const action = isActive ? "desactivar" : "activar";
        const result = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `Estás a punto de ${action} al usuario "${userToToggle.username}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await toggleUserStatus(id, !isActive);
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === id ? { ...user, is_active: !isActive } : user
                    )
                );
                toast.success(`Usuario "${userToToggle.username}" ${isActive ? "desactivado" : "activado"} correctamente.`);
            } catch (error) {
                setError("Error al actualizar el estado del usuario.");
                toast.error("Ocurrió un error al intentar cambiar el estado del usuario.");
            }
        }
    };

    const handleDeleteUser = async (id) => {
        const userToDelete = users.find((user) => user.id === id);
        if (!userToDelete) return;

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `Estás a punto de eliminar al usuario "${userToDelete.username}". Esta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
                toast.success(`Usuario "${userToDelete.username}" eliminado correctamente.`);
            } catch (error) {
                toast.error("Error al eliminar el usuario.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
            <ToastContainer />
            <h1 className="text-4xl font-bold mb-6 mt-10 text-blue-700">Usuarios Registrados</h1>
            {error && <p className="text-red-500">{error}</p>}

            <div className="w-full max-w-7xl overflow-auto mt-4">
                <div className="bg-white shadow-2xl rounded-lg border border-gray-300">
                    <table className="min-w-full border-collapse rounded-lg overflow-hidden">
                        {/* Cabecera */}
                        <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <tr>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Nombre</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Cédula</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Correo</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Rol</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Estado</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Editar</th>
                                <th className="p-4 text-center text-sm font-semibold tracking-wide ">Acciones</th>
                            </tr>
                        </thead>

                        {/* Cuerpo */}
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`h-16 border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors duration-200`}
                                >
                                    <td className="p-4 text-center text-sm font-medium text-gray-700">{user.username}</td>
                                    <td className="p-4 text-center text-sm text-gray-600">{user.numero_identificacion}</td>
                                    <td className="p-4 text-center text-sm text-gray-600">{user.email}</td>
                                    <td className="p-4 text-center text-sm font-semibold text-gray-800">{roleNames[user.role]}</td>
                                    <td className="p-4 text-center">
                                        <span
                                            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${user.is_active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                                }`}
                                        >
                                            {user.is_active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span
                                            onClick={() => navigate(`/edit-user/${user.id}`)}
                                            className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-200 transition-transform transform hover:scale-105 cursor-pointer"
                                            title="Editar usuario"
                                        >
                                            <MdOutlineEdit size={20} />
                                        </span>
                                    </td>

                                    <td className="p-4 flex justify-center gap-3">
                                        {/* Botón Activar/Desactivar */}
                                        <button
                                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-lg transition-all duration-300 ease-in-out ${user.is_active
                                                    ? "bg-gray-600 text-white hover:bg-gray-900 hover:scale-105"
                                                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                                                }`}
                                        >
                                            {user.is_active ? (
                                                <>
                                                    <FiUserX className="mr-2 text-white" size={16} /> Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserCheck className="mr-2 text-white" size={16} /> Activar
                                                </>
                                            )}
                                        </button>

                                        {/* Botón Eliminar */}
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-lg border border-red-700 hover:bg-red-700 hover:scale-105 transition-all duration-300 ease-in-out"
                                        >
                                            <FiTrash2 className="mr-2 text-white" size={16} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                onClick={() => navigate("/admin-panel")}
                className="mt-6 flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
                <FiHome className="mr-3" /> Regresar al Panel
            </button>
        </div>
    );
};

export default SearchUsers;