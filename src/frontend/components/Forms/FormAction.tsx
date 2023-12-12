import Loading from '../Loading';
import { useEffect, useState } from 'preact/compat';

export type FormActionProps = {
    type: string;
    isValid: boolean;
    label?: string;
    hasError?: boolean;
    onAction?: (event: Event) => void;
}

export default function FormAction(props: Readonly<FormActionProps>): React.JSX.Element {
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const isValid: boolean = props.isValid && !isClicked;

    const buttonClass: string = isValid ? 'Action-button Text-shadow' : 'Text-shadow Disabled-button';

    const actionWrapper = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();

        if (props.onAction) {
            setIsClicked(true);
            props.onAction(event);
        }
    };

    useEffect(() => {
        if (props.hasError) {
            setIsClicked(false);
        }
    }, [props.hasError]);


    return (
        <div className='Form-action-container'>
            <button
                onClick={actionWrapper}
                disabled={!props.isValid}
                className={buttonClass}
                onTouchStart={() => setIsClicked(!isClicked)}
            >
                {isClicked ? <Loading label='Processing...' /> : props.label ?? 'Submit'}

            </button>
        </div>
    );
}
