import { useState } from 'react';
import { validators } from '../utils/validators';

const noWhites = 'Cannot contain white-space';

export interface IValidationRules {
    username: { rule: (value: string) => boolean, message: string }[];
    password: { rule: (value: string) => boolean, message: string }[];
    email: { rule: (value: string) => boolean, message: string }[];
    encryptionPassword: { rule: (value: string) => boolean, message: string }[];
    deviceID: { rule: (value: string) => boolean, message: string }[];
}

const validationRules = {
    username: [
        { rule: validators.isAlphaNumeric, message: 'Must be alpha-numeric' },
        { rule: validators.isMoreThan3LessThan20, message: 'Must be between 3 and 20 characters' },
        { rule: validators.hasNoWhiteSpace, message: noWhites },
        { rule: validators.required, message: 'Required' }
    ],
    password: [
        { rule: validators.hasNoWhiteSpace, message: noWhites },
        { rule: validators.required, message: 'Required' }
    ],
    encryptionPassword: [
        { rule: validators.isMoreThan8LessThan20, message: 'Must be between 8 and 20 characters' },
        { rule: validators.hasNoWhiteSpace, message: noWhites },
        { rule: validators.hasSpecialCharacter, message: 'Must have at least one special character' },
        { rule: validators.hasUpperCase, message: 'Must have at least one uppercase letter' },
        { rule: validators.hasLowerCase, message: 'Must have at least one lowercase letter' },
        { rule: validators.hasNumber, message: 'Must have at least one number' },
        { rule: validators.required, message: 'Required' }
    ],
    email: [
        { rule: validators.isEmail, message: 'Must be a valid email address' },
        { rule: validators.required, message: 'Required' }
    ],
    deviceID: [
        { rule: validators.required, message: 'Required' },
        { rule: validators.isDeviceID, message: 'Must be a valid device ID' }
    ]
};

export interface IValidatorProps {
    value: string | null;
    property: keyof IValidationRules;
}

export interface IValidationError {
    [key: string]: string;
}

export interface IUseValidators {
    validated: boolean;
    error: IValidationError[];
    validate: () => void;
}

export default function useValidators(props: IValidatorProps): {
    validated: boolean;
    error: IValidationError[];
    validate: () => void;
} {
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState<IValidationError[]>([]);

    const validate = (): void => {
        const rules = validationRules[props.property];
        let _errors: IValidationError[] = [];
        for (const { rule, message } of rules) {
            const didPass = rule(props.value || '');

            if (!didPass) {
                _errors.push({ [props.property]: message });
            } else {
                _errors = _errors.filter((e) => e[props.property] !== message);
            }
        }

        if (_errors.length === 0) {
            setValidated(true);
        } else {
            setValidated(false);
        }
        setError(_errors);
    };

    return {
        validated: validated && error.length === 0,
        error,
        validate
    };
}
