import './Power.css'
import React, { useState, useEffect } from 'react';

const createFillClass = (isShutdown: boolean) => {
    if (isShutdown) {
        return 'power-fill-shutdown';
    }
    return 'power-fill';
}

export function PowerIcon({ isHovered, isShutdown = false }: { isHovered: boolean, isShutdown?: boolean }) {
    const [hovered, setIsHovered] = useState<boolean>(false);

    const baseClass = createFillClass(isShutdown);
    const fillClass = hovered ? `${baseClass}-hover` : baseClass;

    useEffect(() => {
        setIsHovered(isHovered);
    }, [isHovered]);



    return (
        <svg width="800px" height="800px" viewBox="0 -0.5 17 17" version="1.1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">

            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(1.000000, 0.000000)" className={fillClass}>
                    <path
                        d="M10.124,1.613 L10.124,3.962 C11.73,4.849 12.756,6.586 12.756,8.54 C12.756,11.394 10.406,13.709 7.508,13.709 C4.612,13.709 2.262,11.395 2.262,8.54 C2.262,6.523 3.274,4.791 4.958,3.939 L4.958,1.611 C2.021,2.586 0.063,5.304 0.063,8.54 C0.063,12.592 3.397,15.875 7.507,15.875 C11.618,15.875 14.953,12.592 14.953,8.54 C14.954,5.363 12.98,2.638 10.124,1.613 L10.124,1.613 Z"
                    >

                    </path>
                    <path
                        d="M7.46,7.873 C8.238,7.873 8.872,7.393 8.872,6.798 L8.872,1.115 C8.872,0.521 8.238,0.04 7.46,0.04 C6.681,0.04 6.048,0.521 6.048,1.115 L6.048,6.798 C6.048,7.393 6.681,7.873 7.46,7.873 L7.46,7.873 Z"
                    >
                    </path>
                </g>
            </g>
        </svg>
    )
}