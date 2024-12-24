import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { getTrazabilidadById } from "../services/trazabilidadService";

// Configuración para accesibilidad
Modal.setAppElement("#root");

// Nombres amigables para los campos
const friendlyFieldNames = {
  primer_nombre: "Primer nombre",
  segundo_nombre: "Segundo nombre",
  primer_apellido: "Primer apellido",
  segundo_apellido: "Segundo apellido",
  nombre_completo: "Nombre",
  tipo_identificacion: "Tipo de identificación",
  numero_identificacion: "Número de identificación",
  fecha_nacimiento: "Fecha de nacimiento",
  ubicacion: "Ubicación (Habitación)",
  status: "Estado",
  estadoAnterior: "Estado anterior",
  estadoNuevo: "Estado nuevo",
  age_group: "Tipo de Paciente",
  responsable_username: "Responsable del registro del paciente",
  responsable_signos: "Responsable del registro de Signos Vitales",
  responsable: "Responsable de la actualización del registro del paciente",
  created_at: "Fecha de creación",
  record_date: "Fecha de registro",
  record_time: "Hora de registro",
  presion_sistolica: "Presión Sistólica (mmHg)",
  presion_diastolica: "Presión Diastólica (mmHg)",
  presion_media: "Presión Media (mmHg)",
  pulso: "Pulso (lat/min)",
  temperatura: "Temperatura (°C)",
  frecuencia_respiratoria: "Frecuencia Respiratoria (resp/min)",
  saturacion_oxigeno: "Saturación de Oxígeno (%)",
  peso_adulto: "Peso (Adulto) (kg)",
  peso_pediatrico: "Peso (Pediátrico) (kg)",
  talla: "Talla (cm)",
  observaciones: "Observaciones",
};

// Configuración de acciones
const actionSettings = {
  Creación: {
    color: "bg-green-200",
    emoji: "✅",
    description: "Se ha creado un nuevo registro",
    showPrevious: false,
  },
  "Actualización de datos del paciente": {
    color: "bg-yellow-200",
    emoji: "⚠️",
    description: "Se actualizaron los datos del paciente",
    showPrevious: true,
  },
  "Descarga de PDF": {
    color: "bg-red-300",
    emoji: "📥",
    description: "Se ha descargado el historial del paciente",
    showPrevious: false,
  },
  "Cambio de estado del paciente": {
    color: "bg-blue-200",
    emoji: "🔄",
    description: "Se cambió el estado del paciente",
    showPrevious: true,
  },
  "Nuevo registro de Signos Vitales": {
    color: "bg-pink-200",
    emoji: "📉",
    description: "Se ha creado un nuevo registro de signos vitales",
    showPrevious: false,
  },
  "Actualización de Signos Vitales": {
    color: "bg-purple-200",
    emoji: "📝",
    description: "Se ha actualizado un registro de signos vitales",
    showPrevious: true,
  },
};

const parseDatos = (data) => {
  try {
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Error al parsear los datos:", data, err);
    return {};
  }
};

// Función para formatear fechas
const formatFecha = (fecha, includeTime = false) => {
  if (!fecha) return "No disponible";

  let date;

  if (typeof fecha === "string" && fecha.match(/^\d{4}-\d{2}-\d{2}T/)) {
    date = new Date(fecha);
  } else if (typeof fecha === "string" && fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = fecha.split("/");
    date = new Date(`${year}-${month}-${day}`);
  } else {
    date = new Date(fecha);
  }

  if (isNaN(date.getTime())) return "No disponible";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const formattedHours = date.getHours() % 12 || 12;

    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  return `${day}/${month}/${year}`;
};

// Componente para mostrar datos en tarjetas
const DatosCard = ({ datos, titulo, colorClass, emoji, soloMostrarNuevo = false }) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return (
      <div className={`p-4 rounded-lg shadow ${colorClass} mt-4`}>
        <h4 className="text-lg font-bold flex items-center mb-3">
          <span className="mr-2">{emoji}</span> {titulo}
        </h4>
        <p className="text-gray-500">No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  // Lista de campos a excluir en datos nuevos
  const camposExcluidosEnNuevos = ["id_paciente", "id", "paciente"];
  const camposExcluidosGlobal = ["id_paciente", "id", "paciente"];

  // Verificar si hay peso pediátrico o adulto
  const tienePesoPediatrico = datos.peso_pediatrico;
  const tienePesoAdulto = datos.peso_adulto;

  // Filtrar datos para excluir campos no deseados y manejar pesos
  const datosFiltrados = Object.entries(datos).filter(([key]) => {
    if (soloMostrarNuevo && camposExcluidosEnNuevos.includes(key)) return false;
    if (camposExcluidosGlobal.includes(key)) return false;
    if (key === "peso_adulto" && tienePesoPediatrico) return false;
    if (key === "peso_pediatrico" && tienePesoAdulto) return false;
    return true;
  });

  // Función para aplicar formatFecha si el valor es una fecha válida
  const formatValue = (value) => {
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return formatFecha(value, false); // Mostrar solo fecha sin hora
    }
    return value;
  };

  return (
    <div className={`p-4 rounded-lg shadow ${colorClass} mt-4`}>
      <h4 className="text-lg font-bold flex items-center mb-3">
        <span className="mr-2">{emoji}</span> {titulo}
      </h4>
      <ul className="list-disc pl-5">
        {datosFiltrados.map(([key, value]) => (
          <li key={key} className="leading-6">
            <strong>{friendlyFieldNames[key] || key}:</strong>{" "}
            {typeof value === "object" && value !== null ? (
              soloMostrarNuevo ? (
                formatValue(value.nuevo) || "Sin información"
              ) : (
                <div className="ml-4">
                  <p>
                    <span className="font-semibold text-gray-600">Anterior:</span>{" "}
                    {formatValue(value.anterior) || "Sin información"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">Nuevo:</span>{" "}
                    {formatValue(value.nuevo) || "Sin información"}
                  </p>
                </div>
              )
            ) : (
              formatValue(value) || "Sin información"
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const DetalleTrazabilidadModal = ({ isOpen, onClose, trazabilidadId }) => {
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrazabilidad = async () => {
      try {
        const data = await getTrazabilidadById(trazabilidadId);
        setTrazabilidad({
          ...data,
          datos_antiguos: parseDatos(data.datos_antiguos),
          datos_nuevos: parseDatos(data.datos_nuevos),
        });
      } catch (err) {
        console.error("Error al cargar trazabilidad:", err);
        setError("No se pudo cargar la información.");
      }
    };
    if (trazabilidadId) fetchTrazabilidad();
  }, [trazabilidadId]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full md:w-[50%] bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto transform scale-100 opacity-100"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[9999] flex justify-center items-center"
    >
      <div>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Detalles de Trazabilidad</h2>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : trazabilidad ? (
          <>
            <p className="mb-2">
              <strong>Usuario:</strong> {trazabilidad.usuario_nombre || "No disponible"}
            </p>
            <p className="mb-2 flex items-center">
              <strong className="mr-2">Acción:</strong>
              <span
                className={`px-2 py-1 rounded-md font-semibold text-black ${actionSettings[trazabilidad.accion]?.color}`}
              >
                {trazabilidad.accion}
              </span>
            </p>
            <p className="mb-2">
              <strong>Fecha:</strong> {formatFecha(trazabilidad.fecha_hora, true)}
            </p>
            <p className="mb-5 flex items-center">
              <strong className="mr-2">Detalle:</strong>
              {actionSettings[trazabilidad.accion]?.description || "No disponible"}
              <span className="ml-2">{actionSettings[trazabilidad.accion]?.emoji}</span>
            </p>

            {/* Información del paciente */}
            {["Nuevo registro de Signos Vitales", "Actualización de Signos Vitales"].includes(trazabilidad.accion) ? (
              trazabilidad.datos_nuevos?.paciente ? (
                <div className="p-4 rounded-lg shadow bg-blue-100 mt-4">
                  <h4 className="text-lg font-bold flex items-center mb-3">
                    <span className="mr-2">📋</span> Información del Paciente
                  </h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(trazabilidad.datos_nuevos.paciente).map(([key, value]) => (
                      <li key={key} className="leading-6">
                        <strong>{friendlyFieldNames[key] || key}:</strong> {value || "No disponible"}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 mt-4">No se encontró información del paciente asociada.</p>
              )
            ) : null}

            {/* Información del Paciente (Solo para Descarga de PDF) */}
            {trazabilidad.accion === "Descarga de PDF" ? (
              <>
                <DatosCard
                  datos={trazabilidad.datos_nuevos}
                  titulo="Información del Paciente"
                  colorClass="bg-red-300"
                  emoji="📋"
                  soloMostrarNuevo={true}
                />

                {/* Responsable de la Descarga */}
                <div className="p-4 rounded-lg shadow bg-blue-200 mt-4">
                  <h4 className="text-lg font-bold flex items-center mb-3">
                    <span className="mr-2">👤</span> Responsable de la Descarga
                  </h4>
                  <p className="leading-6">
                    <strong>Responsable:</strong> {trazabilidad.usuario_nombre || "No disponible"}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Datos Nuevos */}
                <DatosCard
                  datos={trazabilidad.datos_nuevos}
                  titulo="Datos Nuevos"
                  colorClass={actionSettings[trazabilidad.accion]?.color || "bg-gray-200"}
                  emoji={actionSettings[trazabilidad.accion]?.emoji || "🆕"}
                  soloMostrarNuevo={true}
                />
              </>
            )}

            {/* Datos Anteriores */}
            {actionSettings[trazabilidad.accion]?.showPrevious && (
              <DatosCard
                datos={trazabilidad.datos_antiguos}
                titulo="Datos Anteriores"
                colorClass="bg-gray-100"
                emoji="📑"
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center">Cargando datos...</p>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"

          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DetalleTrazabilidadModal;