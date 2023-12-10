import './Header.css';
import { JSX } from 'preact/compat';
import { useState, useEffect } from 'preact/hooks';
import { Settings } from '../Settings';

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
                <Settings />
            </section>

        </div>
    );
}
