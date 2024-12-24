import { useEffect, useState } from "react";
import { fetchTrazabilidad } from "../services/trazabilidadService";
import { FaSearch, FaInfoCircle, FaCheck, FaTimes, FaFileExport, FaListAlt, FaFilter, FaArrowLeft } from "react-icons/fa"
import { FiHome } from "react-icons/fi";
import DetalleTrazabilidadModal from "../components/DetalleTrazabilidadModal";
import generatePDFTrazabilidad from "../services/generatePDFTrazabilidad";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TrazabilidadPage = () => {
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [filteredTrazabilidad, setFilteredTrazabilidad] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrazabilidadId, setSelectedTrazabilidadId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActions, setSelectedActions] = useState({});
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mensajeSeleccion, setMensajeSeleccion] = useState("");
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchTrazabilidad();
        setTrazabilidad(data);
        setFilteredTrazabilidad(data);
      } catch (error) {
        setError("Error al cargar los registros de trazabilidad.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const filteredByDates = trazabilidad.filter((item) => {
      const itemDate = new Date(item.fecha_hora);
      const startDate = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
      const endDate = fechaFin ? new Date(`${fechaFin}T23:59:59`) : null;

      // Verificar si la fecha del registro está dentro del rango, si las fechas están definidas
      const isWithinDateRange =
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate);

      return isWithinDateRange;
    });

    const filteredByUserAndDates = filteredByDates.filter((item) =>
      searchQuery
        ? item.usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    setFilteredTrazabilidad(filteredByUserAndDates);
  };

  const handleSelectAction = (userName, actionId) => {
    setSelectedActions((prev) => {
      const userActions = prev[userName] || [];
      if (userActions.includes(actionId)) {
        return {
          ...prev,
          [userName]: userActions.filter((id) => id !== actionId),
        };
      } else {
        return {
          ...prev,
          [userName]: [...userActions, actionId],
        };
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const allFiltered = {};
    filteredTrazabilidad.forEach((item) => {
      if (!allFiltered[item.usuario_nombre]) {
        allFiltered[item.usuario_nombre] = [];
      }
      allFiltered[item.usuario_nombre].push(item.id);
    });
    setSelectedActions(allFiltered);
    setMensajeSeleccion("Todas las acciones visibles han sido seleccionadas.");
    setTimeout(() => setMensajeSeleccion(""), 3000);
  };

  const handleDeselectAll = () => {
    setSelectedActions({});
    setMensajeSeleccion("Se han deseleccionado todas las acciones.");
    setTimeout(() => setMensajeSeleccion(""), 3000);
  };

  const handleExportarPDF = async (exportarTodo = false) => {
    const selectedData = exportarTodo
      ? trazabilidad // Exporta todo
      : Object.entries(selectedActions).flatMap(([userName, actionIds]) =>
        trazabilidad.filter((item) => actionIds.includes(item.id))
      );

    if (selectedData.length === 0) {
      toast.warn("No hay registros seleccionados."); // Mensaje de advertencia
      return;
    }

    try {
      const usuarioInfo = {
        nombre: selectedData[0]?.usuario_nombre || "Desconocido",
        fechaInicio: new Date(Math.min(...selectedData.map((item) => new Date(item.fecha_hora)))).toISOString(),
        fechaFin: new Date(Math.max(...selectedData.map((item) => new Date(item.fecha_hora)))).toISOString(),
      };

      await generatePDFTrazabilidad(usuarioInfo, selectedData);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Hubo un error al generar el PDF.");
    }
  };

  const handleClearFilters = () => {
    setFechaInicio(""); // Restablecer campo de fecha inicio
    setFechaFin("");    // Restablecer campo de fecha fin
    setSearchQuery(""); // Restablecer campo de búsqueda
    setFilteredTrazabilidad(trazabilidad); // Mostrar todos los registros
  };
  const actionStyles = {
    Creación: { text: "text-green-600 font-bold", dot: "bg-green-600" },
    "Actualización de datos del paciente": { text: "text-yellow-600 font-bold", dot: "bg-yellow-600" },
    "Cambio de estado del paciente": { text: "text-blue-900 font-bold", dot: "bg-blue-900" },
    "Nuevo registro de Signos Vitales": { text: "text-pink-600 font-bold", dot: "bg-pink-600" },
    "Actualización de Signos Vitales": { text: "text-purple-500 font-bold", dot: "bg-purple-500" },
    "Descarga de PDF": { text: "text-red-600 font-bold", dot: "bg-red-600" },
  };

  const getActionStyle = (action) => actionStyles[action]?.text || "text-gray-600";
  const getDotStyle = (action) => actionStyles[action]?.dot || "bg-gray-600";

  return (
    <div className="trazabilidad-page bg-gray-100 min-h-screen flex flex-col items-center p-12">
      <div className="w-full max-w-6xl">
        <div className="mb-6 text-center">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl font-bold text-blue-600">Trazabilidad de Usuarios</h1>

            <div className="grid grid-cols-3 gap-4 items-center mb-6">
              <input
                type="date"
                className="border border-gray-300 p-3 rounded w-full"
                placeholder="dd/mm/aaaa"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <input
                type="date"
                className="border border-gray-300 p-3 rounded w-full"
                placeholder="dd/mm/aaaa"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por usuario..."
                  className="border border-gray-300 p-3 pl-10 rounded w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-4 justify-start">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center space-x-2"
                onClick={handleSearch}
              >
                <FaFilter className="text-sm" />
                <span>Filtrar</span>
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center space-x-2"
                onClick={handleClearFilters}
              >
                <FaTimes className="text-sm" />
                <span>Limpiar Filtros</span>
              </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              {loading && <p className="text-center text-blue-500 py-4">Cargando registros...</p>}
              {error && <p className="text-center text-red-500 py-4">{error}</p>}
              {filteredTrazabilidad.length > 0 ? (
                <table className="table-auto w-full border-collapse bg-white text-center">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-4">Seleccionar</th>
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Acción</th>
                      <th className="p-4">Fecha - Hora</th>
                      <th className="p-4">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrazabilidad.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`${selectedActions[item.usuario_nombre]?.includes(item.id)
                          ? "bg-blue-100"
                          : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                          } hover:bg-blue-100`}
                      >
                        <td className="p-5 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedActions[item.usuario_nombre]?.includes(item.id)}
                            onChange={() => handleSelectAction(item.usuario_nombre, item.id)}
                          />
                        </td>
                        <td className="p-5 py-3 text-center align-middle">{item.usuario_nombre}</td>
                        <td
                          className={`p-5 text-center align-middle flex items-center justify-center space-x-2 ${getActionStyle(
                            item.accion
                          )}`}
                        >
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getDotStyle(item.accion)}`}
                          ></span>
                          <span>{item.accion}</span>
                        </td>

                        <td className="p-5 text-center align-middle">{new Date(item.fecha_hora).toLocaleString()}</td>
                        <td className="p-5 text-center align-middle">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                            onClick={() => {
                              setSelectedTrazabilidadId(item.id);
                              setIsModalOpen(true);
                            }}
                          >
                            <FaInfoCircle className="inline mr-2" /> Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                !loading &&
                !error &&
                trazabilidad.length === 0 && (
                  <div className="text-center py-12 flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                    <p className="text-red-500 text-lg font-semibold flex items-center">
                      <span role="img" aria-label="alert" className="mr-2">
                        🚫
                      </span>
                      No hay registros de trazabilidad disponibles.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Verifica el usuario o intenta realizar una nueva búsqueda.
                    </p>
                  </div>
                )
              )}
            </div>

            {generatingPDF && (
              <div className="text-center text-blue-500 mt-4 font-bold">Generando PDF...</div>
            )}

            <div className="flex justify-center space-x-4 mt-4">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
                onClick={handleSelectAllFiltered}
              >
                <FaListAlt /> {/* Icono de lista */}
                <span>Seleccionar Todo</span>
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition flex items-center space-x-2"
                onClick={handleDeselectAll}
              >
                <FaTimes /> {/* Icono de cruz */}
                <span>Quitar Selecciones</span>
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
                onClick={() => handleExportarPDF(false)}
              >
                <FaCheck /> {/* Icono de cheque */}
                <span>Exportar Seleccionados</span>
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
                onClick={() => handleExportarPDF(true)}
              >
                <FaFileExport /> {/* Icono de exportar */}
                <span>Exportar Todo</span>
              </button>
            </div>

            {/* Botón para volver al panel */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/admin-panel')}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
              >
                <FiHome size={20} className="mr-2" /> Regresar al Panel
              </button>
            </div>

            <DetalleTrazabilidadModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              trazabilidadId={selectedTrazabilidadId}
            />
          </div>
        </div>
      </div>
    </div>
  );

};

export default TrazabilidadPage; 