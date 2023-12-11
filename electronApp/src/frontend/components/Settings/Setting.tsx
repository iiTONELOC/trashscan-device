import './Settings.css';
import SettingInput from './SettingInput';
import React, { useState, useEffect } from 'preact/compat';
import SettingActionButtons from './SettingActionButtons';
import { getSetting, setSetting } from '../../utils/API';

export type SettingProps = {
    name: string;
    missing: boolean;
    description: string;
    onAdded: (setting: string) => void;
    setLeaveOpen: (value: boolean) => void;
}

// This component is used to display a single setting, which is a Key/Value pair of required environment variables
// That are unique to the user and their system. These settings are required for the application to function and are
// displayed in red if they are missing.
export default function Setting(props: Readonly<SettingProps>): React.JSX.Element {
    const [editorValue, setEditorValue] = useState<string>('');
    const [isMissing, setIsMissing] = useState<boolean>(props.missing);
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [value, setValue] = useState<string>('***************');
    const [showEditorValue, setShowEditorValue] = useState<boolean>(false);

    const handleEditorChange = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        // eslint-disable-next-line
        // @ts-ignore
        setEditorValue(e.target.value)
    };

    const handleSaveSetting = async (e: Event): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();
        // set the setting in the db
        const didSet = await setSetting(props.name, editorValue);
        // update the missing status
        setShowEditor(false);
        if (didSet) {
            setIsMissing(false);
            props.setLeaveOpen(true);
            props.onAdded(props.name);

            // TODO: CHECK if the setting being set is the AUTO_LOGIN setting
            const isAutoLogin = props.name === 'AUTO_LOGIN';
            if (isAutoLogin) {

                if (editorValue === 'true') {
                    window.centralBridge.session.enableAutoLogin();
                    console.log('Logging IN');
                } else {
                    console.log('Disabling Auto Login');
                    window.centralBridge.session.disableAutoLogin()
                }
            }


        } else {
            setIsMissing(true);
            props.setLeaveOpen(false);
        }
    };

    const handleSecretDoubleClick = (): void => {
        if (isMissing) {
            setShowEditor(true);
        }
    };

    const handleCancelSetting = (): void => {
        setShowEditor(false);
        setEditorValue('');
    };

    const checkIfSettingIsMissing = async (): Promise<void> => {
        const key = await getSetting(props.name);
        key ? setIsMissing(false) : setIsMissing(true);
    };

    const handleShowEditorValue = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        setShowEditorValue(!showEditorValue);
    };


    useEffect(() => {
        checkIfSettingIsMissing();
        return () => handleCancelSetting();
    }, []);


    return (
        <li className='Setting'>
            <article
                className='Setting-info'
                onDblClick={handleSecretDoubleClick}
            >
                <div className='Secret'>
                    <label className={isMissing ? 'Secret-p-missing' : ' '} htmlFor={props.name}>
                        &#9919; {props.name}
                    </label>
                    {
                        showEditor ?
                            <SettingInput
                                name={props.name}
                                editorValue={editorValue}
                                showEditorValue={showEditorValue}
                                handleSaveSetting={handleSaveSetting}
                                handleEditorChange={handleEditorChange}
                                handleCancelSetting={handleCancelSetting}
                                handleShowEditorValue={handleShowEditorValue}
                            />
                            :
                            <p
                                className={isMissing ? 'Secret-p-missing' : 'Secret-p'}
                                onDblClick={handleSecretDoubleClick}
                            >
                                {value}
                            </p>
                    }
                </div>

                <div className='Setting-description'>
                    <p><em>{props.description}</em></p>
                    {!isMissing && <div>
                        <SettingActionButtons
                            name={props.name}
                            value={value}
                            setValue={setValue}
                            setShowEditor={setShowEditor}
                        />
                    </div>}
                </div>
            </article>
        </li>
    )
}
