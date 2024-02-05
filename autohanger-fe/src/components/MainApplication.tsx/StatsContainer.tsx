import React, { useState, useEffect } from 'react';
import '../../styles.css';

interface CardProps {
    title: string;
    value: string | number;
    bgColor: string;
    icon: React.ReactNode;
    danger: string;
    onUpdate?: (newValue: string) => void;
    textColor: any;
    blinking?: boolean;
}

const StatisticCard: React.FC<CardProps> = ({
    title,
    value,
    bgColor,
    icon,
    danger,
    onUpdate,
    textColor,
    blinking = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState<string>(String(value));

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        if (onUpdate) {
            onUpdate(editedValue);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedValue(String(value));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedValue(e.target.value);
    };

    return (
        <div
            className={`flex items-center ${danger} border rounded-sm overflow-hidden shadow ${blinking ? 'blinking' : ''}`}
        >
            <div className={`p-4 ${bgColor}`}>{icon}</div>
            <div className={`px-4 text-gray-700 ${danger ? 'text-white' : ''} ${textColor}`}>
                <h3 className="text-sm tracking-wider">{title}</h3>
                {title === 'Total Number of Passengers' ? (
                    isEditing ? (
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={editedValue}
                                onChange={handleChange}
                                className="mr-2 border-b border-gray-500 outline-none focus:border-blue-500"
                            />
                            <button onClick={handleSave} className="text-blue-500 cursor-pointer">
                                Save
                            </button>
                            <button onClick={handleCancel} className="text-red-500 cursor-pointer ml-2">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p className={`text-2xl cursor-pointer ${blinking ? 'blinking' : ''}`} onClick={handleEdit}>
                            {value}
                        </p>
                    )
                ) : (
                    <p className={`text-2xl ${blinking ? 'blinking' : ''}`}>{value}</p>
                )}
            </div>
        </div>
    );
};

interface Frames {
    frames: any;
}

const StatsContainer: React.FC<Frames> = ({ frames }) => {
    const [totalPassengers, setTotalPassengers] = useState<string>('');

    const lastCountOfPeople = frames.length > 0 ? frames[frames.length - 1].count_of_people : 0;

    const minus = parseInt(totalPassengers) - lastCountOfPeople;

    const percentageDecrease = ((parseInt(totalPassengers) - lastCountOfPeople) / parseInt(totalPassengers)) * 100;

    let dangerLastCard = '';
    let dangerThirdCard = '';

    if (percentageDecrease < 50) {
        dangerLastCard = '';
        dangerThirdCard = 'bg-[orange] text-white';
    } else {
        dangerLastCard = 'bg-[red] text-white';
        dangerThirdCard = '';
    }

    useEffect(() => {
        const storedTotalPassengers = localStorage.getItem('passengerCount');
        if (storedTotalPassengers) {
            setTotalPassengers(storedTotalPassengers);
        }
    }, []);

    const handleUpdateTotalPassengers = (newValue: string) => {
        setTotalPassengers(newValue);
        localStorage.setItem('passengerCount', newValue);
    };

    return (
        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2">
            <div>
                <h1 className="text-[1.8rem] text-[#000] font-semibold font-roboto mb-4 ">Analysis</h1>
                <div className="border border-gray-300 p-4 rounded-xl grid grid-cols-1 gap-4 sm:grid-cols-2 ">
                    <StatisticCard
                        title="Total Number of Passengers"
                        value={totalPassengers}
                        bgColor="bg-green-400"
                        danger=""
                        textColor=""
                        // blinking={percentageDecrease < 50}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                        onUpdate={handleUpdateTotalPassengers}
                    />
                    <StatisticCard
                        textColor=""
                        title="Total Number of Passenger By Video"
                        value={lastCountOfPeople}
                        bgColor="bg-blue-400"
                        danger=""
                        // blinking={percentageDecrease < 50}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    />
                </div>
            </div>
            <div>
                <h1 className="text-[1.8rem] text-[#000] font-semibold font-roboto mb-4 ">Warnings</h1>
                <div className="border border-gray-300 p-4 rounded-xl grid grid-cols-1 gap-4 sm:grid-cols-2 ">
                    <StatisticCard
                        title="Minimal Difference Warning"
                        value={minus}
                        bgColor="bg-indigo-400"
                        textColor="white"
                        danger={dangerThirdCard}
                        blinking={percentageDecrease < 50}
                        icon={<img width="50" height="50" src="https://img.icons8.com/carbon-copy/100/general-warning-sign.png" alt="general-warning-sign" />}
                    />
                    <StatisticCard
                        textColor="white"
                        title="High Difference Warning"
                        value={minus}
                        bgColor="bg-red-400"
                        danger={dangerLastCard}
                        blinking={percentageDecrease >= 50}
                        icon={<img width="50" height="50" src="https://img.icons8.com/carbon-copy/100/general-warning-sign.png" alt="general-warning-sign" />}
                    />
                </div>
            </div>
        </div>
    );
};

export default StatsContainer;
