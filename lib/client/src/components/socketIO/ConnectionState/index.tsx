import React, { useState, useEffect } from 'react';
import './ConnectionState.css'; // Import the CSS file
import { useSocketContext, ISocketContext } from '../SocketProvider';

export function ConnectionState() {
    const { isConnected }: ISocketContext = useSocketContext();
    const [currentTime, setCurrentTime] = useState<string>(
        new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })
    );
    const [currentDate, setCurrentDate] = useState<string>(
        new Date().toLocaleDateString('en-US')
    );

    useEffect(() => {
        const timer = setInterval(() => {
            const newTime = new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
            setCurrentTime(newTime);
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        const updateDate = () => {
            const newDate = new Date().toLocaleDateString('en-US');
            setCurrentDate(newDate);
        };

        const timer = setInterval(() => {
            updateDate();
        }, 1000 * 60 * 60);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="header">
            <p>{currentDate}</p>
            <p>{currentTime}</p>

            <div className='status'>
                <p>{isConnected ? 'Online' : 'Offline'}</p>
                <span className={`status-circle ${isConnected ? 'online' : 'offline'}`} />
            </div>

        </div>
    );
}
