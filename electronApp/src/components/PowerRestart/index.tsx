import './PowerAndRestart.css';
import { JSX } from 'preact/compat';
import { PowerIcon } from '../Icons';
import { useState } from 'preact/hooks';
import { DropDownMenu } from './DropdownMenu';


export function PowerAndRestart(): JSX.Element {
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

            {open && (<DropDownMenu />)}
        </>

    );
}