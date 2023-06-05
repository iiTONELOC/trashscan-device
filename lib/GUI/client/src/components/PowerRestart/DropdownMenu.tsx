import React from 'react';
import { MenuItem } from './MenuItem';
import { PowerIcon, RestartIcon } from '../Icons';

const handleShutdown = () => {
    console.log('Shutdown');

    const confirm = window.confirm('Are you sure you want to shutdown?');
    if (confirm) {
        fetch('/api/shutdown', {
            method: 'POST',
        })
    }
};

const handleRestart = () => {
    console.log('Restart');

    const confirm = window.confirm('Are you sure you want to restart?');
    if (confirm) {
        fetch('/api/restart', {
            method: 'POST',
        })
    }
}


const menuData = [
    {
        text: 'Shutdown',
        Icon: PowerIcon,
        isShutdown: true,
        onClick: handleShutdown,
    },
    {
        text: 'Restart',
        Icon: RestartIcon,
        onClick: handleRestart,
    }
]

export function DropDownMenu({ onMouseLeave }: { onMouseLeave: () => void }) {

    return (
        <div className="dropdown" onMouseLeave={onMouseLeave}>
            <menu>
                {menuData.map(({ text, Icon, isShutdown, onClick }) => (
                    <MenuItem
                        key={text}
                        text={text}
                        Icon={Icon}
                        isShutdown={isShutdown}
                        onClick={onClick}
                    />
                ))}
            </menu>
        </div>
    )
}