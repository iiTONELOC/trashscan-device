import { JSX } from 'preact/compat';
import { useState } from 'preact/hooks';

export interface MenuItemProps {
    text: string;
    onClick: () => void;
    Icon: React.FC<{ isHovered: boolean, isShutdown?: boolean }>;
    isShutdown?: boolean;
}

export function MenuItem({ Icon, text, onClick, isShutdown }: Readonly<MenuItemProps>): JSX.Element {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <li // NOSONAR
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