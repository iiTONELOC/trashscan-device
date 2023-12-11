import React, { useEffect } from 'preact/compat';
import SaveAndCancelButtons from '../SaveAndCancelButtons';

export type PromptPasswordProps = {
    password: string,
    onCancel: () => void,
    setPassword: (password: string) => void
    onPasswordEntered: (password: string) => void,
}

export default function PromptPassword(props: PromptPasswordProps): React.JSX.Element {

    const handlePasswordChange = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.setPassword(e.target?.value);
    };

    const handlePasswordSubmit = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        props.onPasswordEntered(props.password);
    };

    const handleCancelPassword = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        props.setPassword('');
        props.onCancel();
    };

    useEffect(() => () => props.setPassword(''), []);

    return (
        <form className='PromptPassword'>
            <input type='password' id='password' value={props.password} required minLength={8} onChange={handlePasswordChange} />
            <SaveAndCancelButtons onSave={handlePasswordSubmit} onCancel={handleCancelPassword} type='Submit' />
        </form>
    )
}
