import React, { useState } from 'react';
import './PowerAndRestart.css';
import { PowerIcon } from '../Icons';
import { DropDownMenu } from './DropdownMenu';


export function PowerAndRestart(): React.ReactElement {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open);
    return (
        <>
            <button
                className="power-options"
                type="button"
                onClick={toggle}
            >
                <PowerIcon isHovered={false} />
            </button>

            {open && (<DropDownMenu onMouseLeave={() => setOpen(false)}
            />)}
        </>

    );
}