// src/Chat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [apiResponse, setApiResponse] = useState<string>('');
    const [inputMessage, setInputMessage] = useState<string>('');
    const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
    const [runapi, setRunapi] = useState(0)
    const [log, setLog] = useState<Array<any>>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = (e: React.MouseEvent) => {
        if (
            !e.currentTarget.contains(e.target as Node) &&
            !document.getElementById('menuButton')?.contains(e.target as Node)
        ) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/get-logs/${localStorage.getItem("username")}`);
                const logs = response.data; // Assuming the response is an array of logs

                // Assuming logs is an array, update the state
                setLog(logs.logs);
                console.log('Fetched logs:', logs.logs);
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        };



        fetchLogs();

    }, [runapi]);

    const makeApiCall = async (question: string) => {
        try {
            setIsLoading(true);

            const response = await axios.post(
                'http://127.0.0.1:5000/ask',
                { question },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log("API response:", response.data?.answer);

            // Simulate delay for loader visibility
            setTimeout(() => {
                setApiResponse(response.data?.answer);

                // Add API response to the UI
                const newMessage = { type: 'incoming', text: `${response.data?.answer}` };
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                setApiResponse('');
                setIsLoading(false);

            }, 1000);
            setRunapi(()=>runapi+1)
        } catch (error) {
            console.error('API Error:', error);
            setIsLoading(false);
            // Handle the error as needed
        }
    };




    const handleSendMessage = () => {
        const newMessage = { type: 'outgoing', text: inputMessage };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        makeApiCall(inputMessage);
        setInputMessage('');
    };

    return (
        <div className="flex" onClick={closeMenu}>
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-300">
                {/* Sidebar Header */}
                <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-[#6f1d62] text-white">
                    <h1 className="text-2xl font-semibold">Logs</h1>

                </header>
                <div className='h-screen overflow-y-auto p-4 pb-[20rem]'>
                    {
                        log?.map((i: any) => {
                            return <div>
                                <p className='pb-[1rem]'>{i}</p>
                            </div>
                        })
                    }
                </div>


            </div>

            {/* Main Chat Area */}
            <div className="flex-1">
                {/* Chat Header */}
                <header className="bg-white p-4 text-gray-700">
                    <a href="#" className="flex items-center justify-end pt-2 mb-0 text-2xl font-semibold text-gray-900 dark:text-white">
                        <img className="w-[10rem] h-[3rem] mr-2" src="https://www.autohangaradvantage.com/static/images/og-logo.jpg" alt="logo" />
                    </a>
                </header>

                {/* Chat Messages */}
                <div className="h-screen overflow-y-auto p-4 pb-[20rem]">
                    {/* Display messages */}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex mb-4 cursor-pointer justify-${message.type === 'outgoing' ? 'end' : 'start'}`}
                        >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${message.type === 'outgoing' ? 'ml-2' : 'mr-2'}`}>
                                <img
                                    src={message.type === 'outgoing' ?"./autohangar.svg":"./vite.svg"}
                                    alt={message.type === 'outgoing' ? 'My Avatar' : 'User Avatar'}
                                    className="w-8 h-8 rounded-full"
                                />
                            </div>
                            <div
                                className={`flex max-w-96 bg-${message.type === 'outgoing' ? '#bb44b1' : 'bb44b1'} text-${message.type === 'outgoing' ? 'gray-700' : 'gray-700'} rounded-lg p-3 gap-3`}
                            >
                                <p>{message.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder loader */}
                    {isLoading && (
                        <div className="flex justify-end mb-4 cursor-pointer">
                            <div className="flex max-w-96 bg-[#bb44b1] text-white rounded-lg p-3 gap-3">
                                <p>Loading...</p>
                            </div>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                                <img
                                    src="./vite.svg"
                                    alt="My Avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* ... (rest of the messages) */}
                </div>

                {/* Chat Input */}
                <footer className="bg-white border-t border-gray-300 p-4 absolute bottom-0 w-3/4">
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-[#bb44b1]"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-[#6f1d62] text-white px-4 py-2 rounded-md ml-2"
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Chat;
