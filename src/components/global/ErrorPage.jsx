import React from 'react';
import { Link } from 'react-router';
import error from "../../assets/error.png"

const ErrorPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#222222]">
            <div className=" text-center space-y-6">
                <img src={error} alt="error-image" />
                <div className="space-y-2 px-5">
                    <h2 className="text-4xl font-semibold text-white">Page Not Found</h2>
                    <p className="text-gray-200">Sorry, we couldn't find the page you're looking for.</p>
                </div>
                <Link 
                    to="/" 
                    className="bg-[#00CE51] text-sm md:text-md xl:text-lg px-4 py-2 rounded-lg  text-white w-full sm:w-auto"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;