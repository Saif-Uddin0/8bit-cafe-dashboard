import React from 'react';
import { Outlet } from 'react-router';

const Auth = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};
export default Auth;