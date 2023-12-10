import './Settings.css';
import { JSX } from 'preact/compat';
import { SettingsGearIcon } from '../Icons';


export function Settings(): JSX.Element {
    return (
        <div className="settings-container">
            <SettingsGearIcon isHovered={false} />
        </div>
    );
}