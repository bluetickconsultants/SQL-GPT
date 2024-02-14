import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Log {
    created_at: string;
    id: number;
    is_resolved: boolean;
    query: string;
    response: string;
    user_id: number;
}

const DynamicTable: React.FC = () => {
    const [filterName, setFilterName] = useState<string>('');
    const [filterDate, setFilterDate] = useState<Date | null>(new Date('2024-02-12'));
    const [showOnlyPercentage, setShowOnlyPercentage] = useState<boolean>(true);
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        if (filterDate) {
            const formattedDate = filterDate.toISOString().slice(0, 10);
            let apiUrl = `http://127.0.0.1:5000/dashboard/?name=${localStorage.getItem("username")}`;
            apiUrl += `&date=${formattedDate}`;

            if (showOnlyPercentage) {
                apiUrl += `&is_resolved=${showOnlyPercentage}`;
            }

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    setLogs(data.logs);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }, [filterDate, showOnlyPercentage]);

    const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
    };

    const handleDateFilterChange = (date: Date | null) => {
        if (date) {
            const offset = date.getTimezoneOffset() || 0;
            const correctedDate = new Date(date.getTime() + (offset * 60 * 1000));
            setFilterDate(correctedDate);
        } else {
            setFilterDate(null);
        }
    };

    const handleCheckboxChange = () => {
        setShowOnlyPercentage(prevState => !prevState);
    };

    return (
        <div>
            <div className='flex gap-2 mx-[1rem] my-[1rem] '>
                <DatePicker selected={filterDate}
                    className='border border-gray-300 rounded-md p-2'
                    onChange={handleDateFilterChange}
                    dateFormat="yyyy-MM-dd" />

                <input type="checkbox" checked={showOnlyPercentage} onChange={handleCheckboxChange} />
                {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Submit
                </button> */}
            </div>
            <div className="block  mx-[1rem] pb-[1rem] rounded-md border overflow-auto h-[55rem]">
                {logs.length === 0 ? (
                    <div className="text-center mt-4 text-gray-500">No data available</div>
                ) : (
                    <table className="items-center rounded-md bg-transparent border-collapse">
                        <thead>
                            <tr>
                                <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-[1.25rem] font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                                    No.
                                </th>
                                <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-[1.25rem] font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                                    Query
                                </th>
                                <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-[1.25rem] font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                                    Response
                                </th>
                                <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-[1.25rem] font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap min-w-140-px">
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log, index) => (
                                <tr key={index} className="text-gray-500">
                                    <th className="border-t-0 px-4 align-middle text-[1.25rem] font-normal  p-4 text-left">{index + 1}</th>
                                    <th className="border-t-0 px-4 align-middle text-[1.25rem] font-normal  p-4 text-left">{log.query}</th>
                                    <td className="border-t-0 px-4 align-middle text-[1.25rem] font-medium text-gray-900  p-4">
                                        {log.response}
                                    </td>
                                    <td className="border-t-0 px-4 align-middle text-[1.25rem]  p-4">
                                        <div className="flex items-center">
                                            {/* Add your percentage logic here */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DynamicTable;
