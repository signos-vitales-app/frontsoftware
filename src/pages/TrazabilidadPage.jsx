import { useEffect, useState } from "react";
import { fetchTrazabilidad } from "../services/trazabilidadService";
import { FaSearch, FaInfoCircle, FaCheck, FaTimes, FaFileExport, FaListAlt, FaFilter} from "react-icons/fa";
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

      return (
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
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
    setMensajeSeleccion(
      <span className="text-red-500 font-bold">
        Se han deseleccionado todas las acciones.
      </span>
    );
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
        {/* Título */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-blue-600">Trazabilidad de Usuarios</h1>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-center space-x-6 mb-6">
            {/* Fecha de Inicio */}
            <div className="flex items-center">
              <label
                htmlFor="fechaInicio"
                className="mr-2 text-gray-700 font-semibold text-sm"
              >
                Fecha de inicio:
              </label>
              <input
                id="fechaInicio"
                type="date"
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            {/* Fecha de Fin */}
            <div className="flex items-center">
              <label
                htmlFor="fechaFin"
                className="mx-2 text-gray-700 font-semibold text-sm"
              >
                Fecha de fin:
              </label>
              <input
                id="fechaFin"
                type="date"
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            {/* Buscar Usuario */}
            <div className="flex items-center">
              <label
                htmlFor="buscarUsuario"
                className="mx-2 text-gray-700 font-semibold text-sm"
              >
                Buscar usuario:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <FaSearch />
                </span>
                <input
                  id="buscarUsuario"
                  type="text"
                  placeholder="Ingrese el nombre"
                  className="p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
              onClick={handleSearch}
            >
              <FaFilter />
              <span>Filtrar</span>
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center space-x-2"
              onClick={handleClearFilters}
            >
              <FaTimes />
              <span>Limpiar Filtros</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white shadow rounded-lg">
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
                      className={`$ {
                        selectedActions[item.usuario_nombre]?.includes(item.id)
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
              !loading && (
                <div className="text-center text-red-500 py-6">
                  {searchQuery
                    ? `No hay usuarios registrados con el nombre '${searchQuery}'.`
                    : fechaInicio || fechaFin
                      ? "No hay trazabilidad en el rango de fechas seleccionado, verifica nuevamente."
                      : "No hay registros disponibles."}
                </div>
              )
            )}
          </div>

          {mensajeSeleccion && (
            <div className="text-center text-green-500 font-bold py-4">
              {mensajeSeleccion}
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
              onClick={handleSelectAllFiltered}
            >
              <FaListAlt />
              <span>Seleccionar Todo</span>
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition flex items-center space-x-2"
              onClick={handleDeselectAll}
            >
              <FaTimes />
              <span>Quitar Selecciones</span>
            </button>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
              onClick={() => handleExportarPDF(false)}
            >
              <FaCheck />
              <span>Exportar Seleccionados</span>
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-green-600 transition flex items-center space-x-2"
              onClick={() => handleExportarPDF(true)}
            >
              <FaFileExport />
              <span>Exportar Todo</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin-panel')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
          >
            <FiHome size={20} className="mr-2" /> Regresar al Panel
          </button>
        </div>
      </div>

      <DetalleTrazabilidadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trazabilidadId={selectedTrazabilidadId}
      />
    </div>
  );
};

export default TrazabilidadPage;