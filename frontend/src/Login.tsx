import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                username: email,
                password: password
            });

            console.log('API Response:', response);

            // Save the access token to localStorage
            const accessToken = response.data.access_token;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('username', email);


            // Use the navigate function to go to the /app route
            navigate('/app');

            // You can handle the response as needed, e.g., redirect or show a success message.
        } catch (error: any) {
            console.error('API Error:', error.message);

            // You can handle the error as needed, e.g., show an error message to the user.
        }
    };

    return (
        <div>
            <a href="#" className="flex mx-[1rem] pt-4 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-[12rem] h-[3rem] mr-2" src="https://www.autohangaradvantage.com/static/images/og-logo.jpg" alt="logo" />
            </a>
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <a href="#" className="flex items-center justify-center pt-4 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                            <img className="w-[16rem] h-[5rem] mr-2" src="https://www.autohangaradvantage.com/static/images/og-logo.jpg" alt="logo" />
                        </a>
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-[#6f1d62] md:text-2xl dark:text-white">
                                Login in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        className="bg-gray-50 border border-[#6f1d62] text-gray-900 sm:text-sm rounded-lg focus:ring-[#bb44b1] focus:border-[#bb44b1] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-[#6f1d62]"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-[#6f1d62] text-gray-900 sm:text-sm rounded-lg focus:ring-[#6f1d62] focus:border-[#6f1d62] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full text-white bg-[#6f1d62] hover:bg-primary-700 focus:ring-2 focus:outline-none focus:ring-[#bb44b1] font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-[#6f1d62] dark:focus:ring-primary-800"
                                >
                                    Sign in
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
