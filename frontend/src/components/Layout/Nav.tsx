import React, { useState } from 'react';

const Nav: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        // Remove the access token from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');


        // Refresh the page
        window.location.reload();
    };


    return (
        <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full  md:px-8 lg:px-8">
            <div className="relative items-center flex gap-[4rem]">
                <a href="#" className="flex items-center justify-center pt-4 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className="w-[10rem] h-[3rem] mr-2" src="https://pdf.bluetickconsultants.com/static/dist/images/blueticklogo.webp" alt="logo" />
                </a>
                <ul className="flex items-center hidden pt-4 space-x-8 lg:flex">
                    <li className="group relative">
                        <a
                            href="/"
                            aria-label="Home"
                            title="Home"
                            className="font-medium tracking-wide text-[#6f1d62] transition-colors duration-200 group-hover:text-deep-purple-accent-400"
                        >
                            Home
                        </a>
                        <span className="absolute bottom-0 rounded-lg mt-[0.4rem] left-0 w-full h-1 bg-[#6f1d62] transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                    </li>
                    <li className="group relative">
                        <a
                            href="/"
                            aria-label="Dashboard"
                            title="Dashboard"
                            className="font-medium tracking-wide text-[#6f1d62] transition-colors duration-200 group-hover:text-deep-purple-accent-400"
                        >
                            Dashboard
                        </a>
                        <span className="absolute bottom-0 rounded-lg  mt-[0.4rem] left-0 w-full h-1 bg-[#6f1d62] transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                    </li>
                    <li className="group relative">
                        <a
                            href="/"
                            aria-label="Application"
                            title="Application"
                            className="font-medium tracking-wide text-[#6f1d62] transition-colors duration-200 group-hover:text-deep-purple-accent-400"
                        >
                            Application
                        </a>
                        <span className="absolute bottom-0 rounded-lg mt-[0.4rem] left-0 w-full h-1 bg-[#6f1d62] transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"></span>
                    </li>
                </ul>


                <ul className="flex items-center pt-4 hidden ml-auto space-x-8 lg:flex">
                    <li>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-[#6f1d62] hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none"
                            aria-label="Logout"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
                <div className="ml-auto lg:hidden">
                    <button
                        aria-label="Open Menu"
                        title="Open Menu"
                        className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z"
                            />
                            <path
                                fill="currentColor"
                                d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z"
                            />
                            <path
                                fill="currentColor"
                                d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z"
                            />
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-0 left-0 w-full">
                            <div className="p-5 bg-white border rounded shadow-sm">
                                <div className="flex items-center justify-end mb-4">

                                    <div>
                                        <button
                                            aria-label="Close Menu"
                                            title="Close Menu"
                                            className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <nav>
                                    <ul className="space-y-4">
                                        <li>
                                            <a
                                                href="/"
                                                aria-label="Our product"
                                                title="Our product"
                                                className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                                            >
                                                Home
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="/"
                                                aria-label="Our product"
                                                title="Our product"
                                                className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                                            >
                                                Dashboard
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="/"
                                                aria-label="Our product"
                                                title="Our product"
                                                className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-deep-purple-accent-400"
                                            >
                                                Application
                                            </a>
                                        </li>


                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="inline-flex items-center bg-[#6f1d62] justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none"
                                                aria-label="Logout"
                                                title="Logout"
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Nav;
