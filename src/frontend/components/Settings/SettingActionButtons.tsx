import Modal from '../Modal';
import React, { useState } from 'preact/compat';
import PromptPassword from '../PromptPassword';
import { getSettingDecrypted } from '../../utils/API';

export type SettingActionButtonsProps = {
    name: string;
    value: string;
    setValue: (value: string) => void;
    setShowEditor: (value: boolean) => void;
}

// This component is used to handle the available actions for a setting
// Settings can be decrypted and viewed for 30 seconds before being hidden again
// Settings can be edited by clicking the pen icon

export default function SettingActionButtons(props: Readonly<SettingActionButtonsProps>): React.JSX.Element {
    const [password, setPassword] = useState<string>('');
    const [needValidation, setNeedValidation] = useState<boolean>(false);
    const [validateType, setValidateType] = useState<'editor' | 'decryption'>('editor');


    let timeout: NodeJS.Timeout;
    const timeoutLength = 30000;

    const handleDecryptValue = async (): Promise<void> => {
        setNeedValidation(true);
        setValidateType('decryption');
        // set a timeout to reset the state after 30 seconds
        timeout = setTimeout(() => resetState(), timeoutLength);
    };

    const resetState = (): void => {
        setNeedValidation(false);
        setPassword('');
        props.setValue('*************');
    };

    const getSetting = async (): Promise<void> => {
        setNeedValidation(false);
        // get the decrypted value
        const decryptedValue = await getSettingDecrypted(props.name, password);
        // set the decrypted value if it exists
        decryptedValue && props.setValue(Object.values(decryptedValue)[0]);
        decryptedValue && (timeout = setTimeout(() => resetState(), timeoutLength));
    };

    const validateForEditor = (): void => {
        setNeedValidation(true);
        setValidateType('editor');
    };

    const handleShowEditor = async (): Promise<void> => {
        const decryptedValue = await getSettingDecrypted(props.name, password);
        if (!decryptedValue) {
            setNeedValidation(false);
            return;
        }
        props.setShowEditor(true);
        setNeedValidation(false);
    };

    const handleCancelPassword = (): void => {
        resetState();
        timeout && clearTimeout(timeout)
    };


    return (
        <>
            <span className='Setting-action-icons'>
                {props.value.includes('*************') ?
                    <p className='Lock-icon' onClick={handleDecryptValue}>&#128274;</p> :
                    <p className='Unlock-icon' onClick={handleCancelPassword}>&#128275;</p>
                }
                <p className='Pen-icon' onClick={validateForEditor}>&#128394;</p>
            </span>

            {needValidation && (
                <Modal
                    setOpen={needValidation}
                    toggleModal={handleCancelPassword}
                    title='Enter your password to continue:'
                >
                    <PromptPassword
                        onPasswordEntered={validateType === 'editor' ? handleShowEditor : getSetting}
                        onCancel={handleCancelPassword}
                        setPassword={setPassword}
                        password={password}
                    />
                </Modal>
            )}
        </>

    )
}
