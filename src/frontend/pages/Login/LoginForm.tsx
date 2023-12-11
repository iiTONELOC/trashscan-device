import React, { useEffect, useState } from 'preact/compat';
import { FormInput, Form, FormAction } from '../../components';
import { useInputValidation, IUseValidators } from '../../hooks';


interface FormState {
    encryptionPassword: string | null;
    username: string | null;
}

const defaultFormState: FormState = {
    encryptionPassword: '',
    username: ''
};


export default function LoginForm(): React.JSX.Element {
    const [encryptionPasswordErrors, setEncryptionPasswordErrors] = useState<string[]>([]);
    const [formState, setFormState] = useState<FormState>(defaultFormState);
    const [isFormValid, setIsFormValid] = useState<boolean | null>(null);
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
    const [hasError, setHasError] = useState<boolean>(false);

    const validatedUsername: IUseValidators = useInputValidation({
        value: formState.username,
        property: 'username'
    });

    const validateEncryptionPassword: IUseValidators = useInputValidation({
        value: formState.encryptionPassword,
        property: 'encryptionPassword'
    });


    //  event handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        // eslint-disable-next-line
        // @ts-ignore
        const name = e?.target?.getAttribute('id') ?? '';
        // eslint-disable-next-line
        // @ts-ignore
        const { value } = e.target;
        // update the form state
        setFormState({ ...formState, [name]: value });
    };


    const handleLogin = async (e: Event): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // reset the form state
            setFormState(defaultFormState);
            await window.centralBridge.session.login({ ...formState });
            window.location.reload();
        } catch (error) {
            setHasError(true);
        }
    };

    //  Component Effects

    // clean mounting and unmounting
    useEffect(() => {
        setIsMounted(true);
        // try to auto login
        (async () => {
            const didAutoLogin = await window.centralBridge.session.autoLogin();
            if (didAutoLogin) {
                window.location.reload();
            }
        })()
        return () => {
            setIsMounted(false);
            setFormState(defaultFormState);
        };
    }, []);



    // Field validation
    useEffect(() => {
        if (isMounted) {
            validatedUsername.validate();
        }
    }, [formState.username]);

    useEffect(() => {
        if (isMounted) {
            validateEncryptionPassword.validate();
        }
    }, [formState.encryptionPassword]);

    // Form validation
    useEffect(() => {
        if (isMounted) {
            const isUsernameValid: boolean = validatedUsername.validated;
            const isEncryptionPasswordValid: boolean = validateEncryptionPassword.validated;

            if (isUsernameValid && isEncryptionPasswordValid) {
                setIsFormValid(true);
            } else {
                setIsFormValid(false);
            }
        }
    }, [formState, validatedUsername.validated, validateEncryptionPassword.validated]);

    // Update the form state when input errors occur
    useEffect(() => {
        if (isMounted) {
            if (validatedUsername.error.length > 0 && formState.username !== '') {
                setUsernameErrors(validatedUsername.error.map(error => Object.values(error)[0]));
            } else {
                setUsernameErrors([]);
            }

            if (validateEncryptionPassword.error.length > 0 && formState.encryptionPassword !== '') {
                setEncryptionPasswordErrors(validateEncryptionPassword.error.map(error => Object.values(error)[0]));
            } else {
                setEncryptionPasswordErrors([]);
            }

        }
    }, [
        validateEncryptionPassword.error,
        validatedUsername.error,
    ]);

    return isMounted ? (
        <Form>
            <FormInput
                label="username"
                type="text"
                id="username"
                required
                placeholder="Enter your username"
                value={formState.username || ''}
                onChange={handleInputChange}
                onBlur={validatedUsername.validate}
                errors={usernameErrors || []}
            />

            <FormInput
                label="password"
                type="password"
                id="encryptionPassword"
                required
                placeholder="Enter your encryption password"
                value={formState.encryptionPassword || ''}
                onChange={handleInputChange}
                onBlur={validateEncryptionPassword.validate}
                errors={encryptionPasswordErrors || []}
            />

            <FormAction
                label='Login'
                type='login'
                isValid={isFormValid ?? false}
                hasError={hasError}
                onAction={handleLogin}
            />
        </Form>
    ) : <></>;
}
