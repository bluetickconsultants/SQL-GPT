// src/Chat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Chat = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [apiResponse, setApiResponse] = useState<string>('');
    const [inputMessage, setInputMessage] = useState<string>('');
    const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
    const [runapi, setRunapi] = useState(0);
    const [log, setLog] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPredefinedQuestions, setShowPredefinedQuestions] = useState<boolean>(true);

    const predefinedQuestions = [
        "Total number of test drives in Jan 2024",
        "Total number of leads in Jan 2024",
        "Total Number of leads by Amit Ashara in Jan 2024",
        "Number of Test Drives leads by Amit Ashara in Jan 2024",
        "Count of Sales of Mercedes Benz A class in January 2024",
        "Number of Delivery Given by Walk in in Jan 2024",
    ];

    const handlePredefinedQuestionClick = (question: string) => {
        setInputMessage(`${question}`);
        handleSendMessage(question);
        setShowPredefinedQuestions(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setShowPredefinedQuestions(false); // Show predefined questions when menu is toggled
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
                setApiResponse(response.data?.answer?.output);

                // Add API response to the UI
                const newMessage = { type: 'incoming', text: `${response.data?.answer?.output}` };
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                setApiResponse('');
                setIsLoading(false);

            }, 1000);
            setRunapi(() => runapi + 1)
        } catch (error: any) {
            console.error('API Error:', error.response.data.error);

            setTimeout(() => {
                setApiResponse(error.response.data.error);

                // Add API response to the UI
                const newMessage = { type: 'incoming', text: `Error: ${error.response.data.error}` };
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                setApiResponse('');
                setIsLoading(false);

            }, 1000);
            setRunapi(() => runapi + 1)
            setIsLoading(false);
            // Handle the error as needed
        }
    };

    const handleSendMessage = (question: string) => {
        const newMessage = { type: 'outgoing', text: `${question}` };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        makeApiCall(question);
        setInputMessage('');
    };

    return (
        <div className={`${isMenuOpen ? 'flex' : 'flex justify-center'}`} onClick={closeMenu}>
            <div className={`${isMenuOpen ? 'hidden' : 'block'}`} onClick={toggleMenu}>
                <img width="32" height="32" className='cursor-pointer mx-[1rem] absolute' src="https://img.icons8.com/windows/32/menu--v1.png" alt="menu--v1" />
            </div>
            {/* Sidebar */}
            <div className={`w-1/4 bg-white border-r border-gray-300  ${isMenuOpen ? 'block' : 'hidden'}`} onClick={toggleMenu}>
                {/* Sidebar Header */}
                <header className={`p-4 border-b border-gray-300 flex justify-between items-center bg-[#6f1d62] text-white ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <img width="32" height="32" className='cursor-pointer' src="https://img.icons8.com/windows/32/000000/menu--v1.png" alt="menu--v1" />
                    <h1 className="text-2xl font-semibold">Logs</h1>
                </header>
                <div className='h-screen overflow-y-auto p-4 pb-[20rem]'>
                    {log?.map((i: any, index: number) => (
                        <div key={index}>
                            <p className='pb-[1rem]'>{i}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="w-[75%]">
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
                            className={`flex mb-4 items-center cursor-pointer justify-${message.type === 'outgoing' ? 'end' : 'start'}`}
                        >

                            <div
                                className={`flex max-w-96 bg-${message.type === 'outgoing' ? '#bb44b1' : 'bb44b1'} text-${message.type === 'outgoing' ? 'gray-700' : 'gray-700'} rounded-lg p-3 gap-3`}
                            >
                                <p className={`flex max-w-96 bg-${message.type === 'outgoing' ? 'white' : '[#bb44b1]'} text-${message.type === 'outgoing' ? 'black' : 'white'} border  rounded-lg p-3 gap-3 text-[1.25rem]`}>{message.text}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${message.type === 'outgoing' ? 'mr-2' : 'ml-2'}`}>
                                <img
                                    src={message.type === 'outgoing' ? "./autohangar.svg" : "./vite.svg"}
                                    alt={message.type === 'outgoing' ? 'My Avatar' : 'User Avatar'}
                                    className="w-15 h-15 rounded-full"
                                />
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

                    {showPredefinedQuestions && (
                        <div className="grid grid-cols-2 gap-2 mt-[17rem] mx-[1rem]">
                            {/* Display first three questions */}
                            <div className="flex flex-col gap-4">
                                {predefinedQuestions.slice(0, 3).map((question, index) => (
                                    <div
                                        key={index}
                                        className="cursor-pointer border border-purple-300 w-[30rem] rounded-lg bg-[#bb44b1]  mb-[1rem] flex flex-col gap-[1rem] items-center"
                                        onClick={() => handlePredefinedQuestionClick(question)}
                                    >
                                        <p className='p-[1rem] text-white'>{question}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Display last three questions */}
                            <div className="flex flex-col gap-4">
                                {predefinedQuestions.slice(3, 6).map((question, index) => (
                                    <div
                                        key={index + 3} // Adding an offset to ensure unique keys
                                        className="cursor-pointer border border-purple-300 w-[30rem] rounded-lg bg-[#bb44b1]  mb-[1rem] flex flex-col gap-[1rem] items-center"
                                        onClick={() => handlePredefinedQuestionClick(question)}
                                    >
                                        <p className='p-[1rem] text-white'>{question}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                onClick={() => { handleSendMessage(inputMessage); setShowPredefinedQuestions(false) }}
                                className="bg-[#6f1d62] text-white px-4 py-2 rounded-md ml-2"
                            >
                                Send
                            </button>
                        </div>
                    </footer>
                </div>

                {/* Chat Input */}

            </div>
        </div>
    );
};

export default Chat;