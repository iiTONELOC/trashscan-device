import './styles.css';


export type SaveAndCancelButtonsProps = {
    onSave: (e: Event) => void | Promise<void>,
    onCancel: (e: Event) => void | Promise<void>,
    type?: 'Save' | 'Submit'
}

export default function SaveAndCancelButtons(props: Readonly<SaveAndCancelButtonsProps>): React.JSX.Element {
    return (
        <div className='Setting-editor-buttons'>
            <button className='Settings-save-btn Text-shadow' onClick={props.onSave}>{props.type ?? 'Save'}</button>
            <button className='Settings-cancel-btn Text-shadow' onClick={props.onCancel}>Cancel</button>
        </div>
    )
}
