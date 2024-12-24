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
                setUsers(response.data);
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
        <div className="flex flex-col items-center justify-start min-h-screen bg-white-50 p-6">
            <ToastContainer />
            <h1 className="text-4xl font-bold mb-3 mt-10 text-blue-800">Usuarios Registrados</h1>
            {error && <p className="text-red-500">{error}</p>}

            <div className="w-full max-w-7xl overflow-auto mt-4" style={{ scrollbarGutter: "stable" }}>
                <div className="bg-white shadow-2xl rounded-lg border border-gray-200 max-h-[calc(100vh-200px)]">
                    <table className="min-w-full table-fixed border-collapse text-black-700">
                        <thead className="bg-gradient-to-r from-blue-700 to-blue-500 text-white sticky top-0 z-10 shadow-md">
                            <tr>
                                <th className="p-4 text-center text-sm font-semibold w-1/6">Nombre</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/6">Cédula</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/4">Correo</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/6">Rol</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/8">Estado</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/12">Editar</th>
                                <th className="p-4 text-center text-sm font-semibold w-1/6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-50 divide-y divide-gray-200">
                            {users.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`h-16 border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                                        } hover:bg-gray-200 transition-colors`}
                                >
                                    <td className="p-4 text-center text-sm font-medium">{user.username}</td>
                                    <td className="p-4 text-center text-sm">{user.numero_identificacion}</td>
                                    <td className="p-4 text-center text-sm">{user.email}</td>
                                    <td className="p-4 text-center text-sm">{roleNames[user.role]}</td>
                                    <td className="p-4 text-center text-sm">
                                        <span
                                            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${user.is_active ? "bg-green-500 text-white shadow-lg" : "bg-red-500 text-white shadow-lg"
                                                }`}
                                        >
                                            {user.is_active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span
                                            onClick={() => navigate(`/edit-user/${user.id}`)}
                                            className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-200 hover:scale-110 transition-transform cursor-pointer"
                                            title="Editar usuario"
                                        >
                                            <MdOutlineEdit size={20} />
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-4">
                                        <button
                                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                                            className={`flex items-center px-4 py-3 text-sm font-bold rounded-full shadow-lg transition ${user.is_active ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            {user.is_active ? (
                                                <>
                                                    <FiUserX className="mr-2" size={18} /> Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserCheck className="mr-1" size={18} /> Activar
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="flex items-center px-4 py-3 bg-red-600 text-white rounded-full text-sm font-bold shadow-lg hover:bg-red-700 transition"
                                        >
                                            <FiTrash2 className="mr-2" size={18} /> Eliminar
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
                className="mt-5 flex items-center px-5 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition"
            >
                <FiHome className="mr-3" /> Regresar al Panel
            </button>
        </div>
    );
};

export default SearchUsers;