import React from 'react'
import Nav from './components/Layout/Nav'
import DynamicTable from './components/Dashboard/DynamicTable'

const Dashboard = () => {
    return (
        <div className='h-screen overflow-hidden'>
            <Nav />
            
            <div className=''>
            <DynamicTable />
            </div>
        </div>
    )
}

export default Dashboard