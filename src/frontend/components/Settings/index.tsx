import './Settings.css';
import Modal from '../Modal';
import Setting from './Setting';
import { defaultApplicationSettings } from '../../utils/API';
import React, { useRef, useEffect, useState } from 'preact/compat';

export type SettingsProps = {
    title: string;
    setOpen: boolean;
    onClose?: () => void;
    setShow: (value: boolean) => void;
    missingSettings: { found: boolean, missing: string[], handleSettingAdded: (setting: string) => void };
}

// used internally in the Settings component
function MissingMessage(): React.JSX.Element {
    return (
        <div className='Setting-modal-info-container'>
            <p className='Setting-modal-info'>
                The following settings are required for the application to function but are unique to you and your system.
                Please fill out all variables currently marked in <span className='Red-span'>RED</span>.
            </p>
            <p className='Setting-modal-info'>
                You will not be able to use the application or close the
                modal until all settings have been provided.
            </p>
        </div>
    )
}

// Renders a list of required settings in a modal
// This Modal is displayed automatically if there are missing settings
// And cannot be closed until all settings have been provided. (You can close but it just reopens)
export default function Settings(props: SettingsProps): React.JSX.Element {
    const [leaveOpen, setLeaveOpen] = useState<boolean>(false);
    const settingsRef = useRef<HTMLUListElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleLeaveOpen = (): void => {
        if (!props.setOpen && leaveOpen) {
            setLeaveOpen(false);
        }
    };

    const handleClose = (): void => {
        handleLeaveOpen();
        props.onClose && props.onClose();
    };


    const handleEscape = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
            setLeaveOpen(false);
        }
    }, []);

    return (
        <Modal
            title={props.title}
            setOpen={props.setOpen || leaveOpen}
            onClose={handleClose}
            toggleModal={() => props.setShow(!props.setOpen)}
            _ref={modalRef}
        >
            {!props.missingSettings.found ? <MissingMessage /> : null}
            <ul className={'Settings'} ref={settingsRef}>
                {defaultApplicationSettings?.map(setting => (
                    <Setting
                        key={setting.setting}
                        name={setting.setting}
                        setLeaveOpen={setLeaveOpen}
                        description={setting.description}
                        onAdded={props.missingSettings.handleSettingAdded}
                        missing={props.missingSettings?.missing.includes(setting.setting) ?? false}
                    />
                ))}
            </ul>
        </Modal>
    )
}
