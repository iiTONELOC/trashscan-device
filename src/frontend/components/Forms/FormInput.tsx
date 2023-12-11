import React from 'preact/compat';

export type FormInputProps = {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    errors?: string[];
    setValidated?: React.Dispatch<React.SetStateAction<boolean>>;
    onChange?: (event: Event) => void;
    onBlur?: (event: Event) => void;
    onFocus?: (event: Event) => void;
}

export default function FormInput(props: Readonly<FormInputProps>): React.JSX.Element {
    return (
        <>
            <div className='Form-label-container'>
                <label htmlFor={props.id}>{props.label}</label>
                <span>
                    {
                        props.errors?.map(
                            (error, i) => <p className='Text-shadow Error'
                                key={`${props.label}-${i}`}>{error}</p> // NOSONAR
                        )
                    }
                </span>
            </div>

            <input tabIndex={0} {...props} />
        </>
    );
}
