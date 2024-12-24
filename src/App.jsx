import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage'; 
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import PatientRegister from './pages/PatientRegister';
import PatientRecordForm from './pages/PatientRecordForm';
import SearchPatient from './pages/SearchPatient';
import PatientDataForm from './pages/PatientDataForm';
import PatientRecordHistory from './pages/PatientRecordHistory';
import PatientGraphs from './pages/PatientGraphs';
import ProtectedRoute from './pages/ProtectedRoute';
import Layout from './components/Layout';
import RegisterUser from './pages/RegisterUser'; 
import SearchUsers from './pages/SearchUsers'; 
import EditPatient from './pages/EditPatient';
import EditUser from './pages/EditUser';
import PatientHistoryPage from "./pages/PatientHistoryTable";
import EditPatientDataForm from "./pages/EditPatientDataForm"
import PatientPage from './pages/PatientHistoryTableSignos';
import TrazabilidadPage from "./pages/TrazabilidadPage";
import UpdateProfileImage from './pages/UpdateProfileImage';

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <Routes>
                {/* Ruta predeterminada de la página de inicio */}
                <Route path="/" element={<HomePage />} /> {/* Esta es la página que se mostrará al cargar el front */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> {/* ruta de registro temporalmente para facilitar la creación del admin */}
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ChangePassword />} />

                {/* Rutas protegidas */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/register-patient" element={<ProtectedRoute><Layout><PatientRegister /></Layout></ProtectedRoute>} />
                <Route path="/patient/:idPaciente/add-record" element={<ProtectedRoute><Layout><PatientDataForm /></Layout></ProtectedRoute>} />
                <Route path="/patient/:idPaciente/records" element={<ProtectedRoute><Layout><PatientRecordHistory /></Layout></ProtectedRoute>} />
                <Route path="/patient/:idPaciente/graphs" element={<ProtectedRoute><Layout><PatientGraphs /></Layout></ProtectedRoute>} />
                <Route path="/search-patient" element={<ProtectedRoute><Layout><SearchPatient /></Layout></ProtectedRoute>} />
                <Route path="/admin-panel" element={<ProtectedRoute><Layout><AdminPanel /></Layout></ProtectedRoute>} />
                <Route path="/patient-history/:idPaciente" element={<ProtectedRoute><Layout><PatientHistoryPage/></Layout> /</ProtectedRoute>}/>
                <Route path="/patient/:idPaciente/edit-record/:idRegistro" element={<ProtectedRoute><Layout><EditPatientDataForm /></Layout></ProtectedRoute>}/>
                <Route path="/patient/:idPaciente" element={<ProtectedRoute><Layout><PatientPage /></Layout></ProtectedRoute>} />
                <Route path="/update-profile" element={<ProtectedRoute><UpdateProfileImage /></ProtectedRoute>} />
            
                {/* Nuevas rutas para registro y búsqueda de usuarios */}
                <Route path="/register-user" element={<ProtectedRoute><Layout><RegisterUser /></Layout></ProtectedRoute>} />
                <Route path="/search-user" element={<ProtectedRoute><Layout><SearchUsers /></Layout></ProtectedRoute>} />
                <Route path="/edit-patient/:idPaciente" element={<ProtectedRoute><Layout><EditPatient /></Layout></ProtectedRoute>} />
                <Route path="/edit-user/:idUsuario" element={<ProtectedRoute><Layout><EditUser /></Layout></ProtectedRoute>} />

                {/* Ruta de Trazabilidad */}
                <Route path="/trazabilidad" element={<ProtectedRoute><Layout><TrazabilidadPage /></Layout></ProtectedRoute>} />


                {/* Ruta por defecto */}
                <Route path="*" element={<h1>404 Page Not Found</h1>} />
            </Routes>
        </Router>
    );
}

export default App;