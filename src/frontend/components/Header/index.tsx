import './Header.css';
<<<<<<< HEAD:lib/GUI/client/src/components/Header/index.tsx
// import { ConnectionState } from '../socketIO';
import React, { useState, useEffect } from 'react';
import { PowerAndRestart } from '../PowerRestart';
=======
import { JSX } from 'preact/compat';
import { useState, useEffect } from 'preact/hooks';
>>>>>>> electron-conversion:src/frontend/components/Header/index.tsx


export function Header(): JSX.Element {
    const [currentTime, setCurrentTime] = useState<string>(
        new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })
    );
    const [currentDate, setCurrentDate] = useState<string>(
        // format the date as Day of the Week, Month, Year
        new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        })
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
            <p className='current-time'>{currentTime}</p>

            <section className='header-section'>
<<<<<<< HEAD:lib/GUI/client/src/components/Header/index.tsx
                {/* <ConnectionState /> */}
                <PowerAndRestart />
=======

>>>>>>> electron-conversion:src/frontend/components/Header/index.tsx
            </section>

        </div>
    );
}
