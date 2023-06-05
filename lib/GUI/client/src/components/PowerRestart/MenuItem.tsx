import React, { useState } from 'react';

export interface MenuItemProps {
    text: string;
    onClick: () => void;
    Icon: React.FC<{ isHovered: boolean, isShutdown?: boolean }>;
    isShutdown?: boolean;
}

export function MenuItem({ Icon, text, onClick, isShutdown }: MenuItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <li
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className='drop-menu-item'
        >
            <Icon isHovered={isHovered} isShutdown={isShutdown} />
            <p className='drop-menu-option'>{text}</p>
        </li>
    )
}