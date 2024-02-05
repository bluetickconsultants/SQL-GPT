import React from 'react';
import Nav from './components/Layout/Nav';
import Chat from './components/Application/Chat';


const Application = () => {
    return (
        <div className='h-screen overflow-hidden'>
            <Nav />
            <Chat />
        </div>
    );
}

export default Application;
