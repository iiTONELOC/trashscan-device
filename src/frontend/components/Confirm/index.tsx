
import './ConfirmModal.css'

export function Confirm({ message, onConfirm, onCancel }:
    Readonly<{ message: string, onConfirm: () => void, onCancel: () => void }>) {
    return (
        <div className='confirm'>
            <p className='confirm-message text-shadow'>{message}</p>

            <span className='confirm-buttons'>
                <button className='confirm-yes text-shadow' onClick={onConfirm}> Yes</button>
                <button className='confirm-no text-shadow' onClick={onCancel}> No</button>
            </span>
        </div>
    )
}