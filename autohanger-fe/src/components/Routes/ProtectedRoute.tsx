// ProtectedRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, ...rest }: any) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');

    return (
        <Route
            {...rest}
            element={isAuthenticated ? children : <Navigate to="/login" />}
        />
    );
};

export default ProtectedRoute;
