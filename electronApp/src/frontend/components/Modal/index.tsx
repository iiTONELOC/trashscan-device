import './Modal.css';
import React from 'preact/compat';


export type ModalProps = {
    title: string;
    setOpen: boolean;
    onClose?: () => void;
    _ref?: React.RefObject<HTMLDivElement>;
    children: React.ReactNode | React.ReactNode[];
    toggleModal: () => void
}

export default function Modal(props: ModalProps): React.JSX.Element {
    const handleClose = (): void => {
        props.toggleModal();
        props?.onClose?.();
    };

    return props.setOpen ? (
        <section className='Modal-container'>
            <article className='Modal' ref={props._ref}>
                <header className='Modal-header'>
                    <h2 className='Modal-title'>{props.title}</h2>
                    <button className='Modal-close' onClick={handleClose}>X</button>
                </header>
                <div className='Modal-body'>
                    {props.children}
                </div>
            </article>
        </section>
    ) : <></>;
}
