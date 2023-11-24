import {Route, Navigate, useLocation} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    
    if(token){
        return children
    }
    return <Navigate to="/login" state={{ from: location}} replace />
};

const AuthenticatedRoute = ({children}) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    
    if(!token){
        return children
    }
    return <Navigate to="/chat" state={{ from: location}} replace />
};

export {ProtectedRoute, AuthenticatedRoute};