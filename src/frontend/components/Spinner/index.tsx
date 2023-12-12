

export type SpinnerProps = {
    textColor?: string;
    label?: string;
}


export default function Spinner(props: SpinnerProps): React.JSX.Element {
    const textColor = props.textColor ?? 'Spinner-green-text';
    const spinnerStyles = `Spinner ${textColor}`;

    return (
        <div className='Spinner-container'>
            <div className={spinnerStyles}>
            </div>
            <span className="Spinner-text">{props.label ?? 'Loading...'}</span>
        </div>
    );
}
