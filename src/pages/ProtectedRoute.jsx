import { Navigate } from 'react-router-dom'


function ProtectedRoute({children}) {
    const token = localStorage.getItem('token'); //asigna en el almacenamiento el item de token

    return token ? children : <Navigate to={"/login"} />
}

export default ProtectedRoute; 