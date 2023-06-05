import { Confirm } from '../Confirm';
import { MenuItem } from './MenuItem';
import { PowerIcon, RestartIcon } from '../Icons';
import React, { useState, useEffect } from 'react';


const handleShutdown = () => {
    fetch('/api/shutdown', {
        method: 'POST',
    });
};


const handleRestart = () => {
    fetch('/api/restart', {
        method: 'POST',
    });
};


const menuData = [
    {
        text: 'Shutdown',
        Icon: PowerIcon,
        isShutdown: true,
        type: 'shutdown',
    },
    {
        text: 'Restart',
        Icon: RestartIcon,
        type: 'restart',
    }
];

export function DropDownMenu() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState('');

    useEffect(() => {
        if (confirmType) {
            setShowConfirm(true);
        }
    }, [confirmType]);

    const resetConfirm = () => {
        setShowConfirm(false);
        setConfirmType('');
    };

    return (
        <>
            <div className="dropdown">
                <menu>
                    {menuData.map(({ text, Icon, isShutdown, type }) => (
                        <MenuItem
                            key={text}
                            text={text}
                            Icon={Icon}
                            isShutdown={isShutdown}
                            onClick={() => setConfirmType(type)}
                        />
                    ))}
                </menu>
            </div>
            {showConfirm && (
                confirmType === 'shutdown' ? (
                    <Confirm
                        message='Are you sure you want to shutdown?'
                        onConfirm={handleShutdown}
                        onCancel={() => resetConfirm()}
                    />
                ) : (
                    <Confirm
                        message='Are you sure you want to restart?'
                        onConfirm={handleRestart}
                        onCancel={() => resetConfirm()}
                    />
                )
            )}
        </>

    )
}