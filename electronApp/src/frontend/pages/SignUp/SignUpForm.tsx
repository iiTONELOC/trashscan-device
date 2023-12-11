import { useEffect, useState } from 'preact/hooks';
import { setSetting } from '../../../frontend/utils/API';
import { FormInput, Form, FormAction } from '../../components';
import { useInputValidation, IUseValidators } from '../../hooks';

interface FormState {
    encryptionPassword: string | null;
    deviceID: string | null;
    username: string | null;
    password: string | null;
    email: string | null;
}

const defaultFormState: FormState = {
    encryptionPassword: '',
    deviceID: '',
    username: '',
    password: '',
    email: ''
};


export default function SignUpForm(): React.JSX.Element {
    const [encryptionPasswordErrors, setEncryptionPasswordErrors] = useState<string[]>([]);
    const [formState, setFormState] = useState<FormState>(defaultFormState);
    const [isFormValid, setIsFormValid] = useState<boolean | null>(null);
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
    const [deviceIDErrors, setDeviceIDErrors] = useState<string[]>([]);
    const [emailErrors, setEmailErrors] = useState<string[]>([]);
    const [hasError, setHasError] = useState<boolean>(false);

    // Create validators for each field
    const validatedPassword: IUseValidators = useInputValidation({
        value: formState.password,
        property: 'password'
    });

    const validatedUsername: IUseValidators = useInputValidation({
        value: formState.username,
        property: 'username'
    });

    const validatedDeviceID: IUseValidators = useInputValidation({
        value: formState.deviceID,
        property: 'deviceID'
    });


    const validatedEmail: IUseValidators = useInputValidation({
        value: formState.email,
        property: 'email'
    });

    const validateEncryptionPassword: IUseValidators = useInputValidation({
        value: formState.encryptionPassword,
        property: 'encryptionPassword'
    });


    //  event handlers

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const name = e?.target?.getAttribute('id') ?? '';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { value } = e.target;

        // update the form state
        setFormState({ ...formState, [name]: value });
    };


    const handleSignUp = async (e: Event): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setFormState(defaultFormState);
            const created = await window.centralBridge.db.createUser({ ...formState });

            if (created && created === formState.username) {
                setSetting('username', formState.username);
                setSetting('email', formState.email);
                setSetting('deviceID', formState.deviceID);
                setSetting('password', formState.password);

                window.location.reload();
            }
        } catch (error) {
            setHasError(true);
        }
    };

    //  Component Effects

    // clean mounting and unmounting
    useEffect(() => {
        setIsMounted(true);
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
            validatedEmail.validate();
        }
    }, [formState.email]);

    useEffect(() => {
        if (isMounted) {
            validatedDeviceID.validate();
        }
    }, [formState.deviceID]);

    useEffect(() => {
        if (isMounted) {
            validatedPassword.validate();
        }
    }, [formState.password]);

    useEffect(() => {
        if (isMounted) {
            validateEncryptionPassword.validate();
        }
    }, [formState.encryptionPassword]);

    // Form validation
    useEffect(() => {
        if (isMounted) {

            const isEmailValid: boolean = validatedEmail.validated;
            const isPasswordValid: boolean = validatedPassword.validated;
            const isUsernameValid: boolean = validatedUsername.validated;
            const isDeviceIDValid: boolean = validatedDeviceID.validated;
            const isEncryptionPasswordValid: boolean = validateEncryptionPassword.validated;

            if (isPasswordValid && isUsernameValid && isEmailValid && isEncryptionPasswordValid && isDeviceIDValid) {//NOSONAR
                setIsFormValid(true);
            } else {
                setIsFormValid(false);
            }
        }
    }, [formState, validatedEmail.validated, validatedPassword.validated,
        validatedUsername.validated, validateEncryptionPassword.validated, validatedDeviceID.validated]);

    // Update the form state when input errors occur
    useEffect(() => {
        if (isMounted) {
            if (validatedPassword.error.length > 0 && formState.password !== '') {
                setPasswordErrors(validatedPassword.error.map(error => Object.values(error)[0]));
            } else {
                setPasswordErrors([]);
            }
            if (validatedUsername.error.length > 0 && formState.username !== '') {
                setUsernameErrors(validatedUsername.error.map(error => Object.values(error)[0]));
            } else {
                setUsernameErrors([]);
            }
            if (validatedDeviceID.error.length > 0 && formState.deviceID !== '') {
                setDeviceIDErrors(validatedDeviceID.error.map(error => Object.values(error)[0]));
            } else {
                setDeviceIDErrors([]);
            }
            if (validatedEmail.error.length > 0 && formState.email !== '') {
                setEmailErrors(validatedEmail.error.map(error => Object.values(error)[0]));
            } else {
                setEmailErrors([]);
            }
            if (validateEncryptionPassword.error.length > 0 && formState.encryptionPassword !== '') {
                setEncryptionPasswordErrors(validateEncryptionPassword.error.map(error => Object.values(error)[0]));
            } else {
                setEncryptionPasswordErrors([]);
            }

        }
    }, [
        validateEncryptionPassword.error,
        validatedDeviceID.error,
        validatedPassword.error,
        validatedUsername.error,
        validatedEmail.error
    ]);

    return isMounted ? (
        <Form>
            <FormInput
                label="username"
                type="text"
                id="username"
                required
                placeholder="Enter your TrashScanner username"
                value={formState.username || ''}
                onChange={handleInputChange}
                onBlur={validatedUsername.validate}
                errors={usernameErrors || []}
            />

            <FormInput
                label="email"
                type="text"
                id="email"
                required
                placeholder="Enter your TrashScanner email address"
                value={formState.email || ''}
                onChange={handleInputChange}
                onBlur={validatedEmail.validate}
                errors={emailErrors || []}
            />

            <FormInput
                label="Device ID"
                type="password"
                id="deviceID"
                required
                placeholder="Enter the generated Device ID for your TrashScanner device"
                value={formState.deviceID || ''}
                onChange={handleInputChange}
                onBlur={validatedDeviceID.validate}
                errors={deviceIDErrors || []}
            />

            <FormInput
                label="password"
                type="password"
                id="password"
                required
                placeholder="Enter the password for your TrashScanner account"
                value={formState.password || ''}
                onChange={handleInputChange}
                onBlur={validatedPassword.validate}
                errors={passwordErrors || []}
            />

            <FormInput
                label="encryption password"
                type="password"
                id="encryptionPassword"
                required
                placeholder="Enter a secure encryption password, this should be different from above"
                value={formState.encryptionPassword || ''}
                onChange={handleInputChange}
                onBlur={validateEncryptionPassword.validate}
                errors={encryptionPasswordErrors || []}
            />

            <FormAction
                label='Add Account'
                type='signup'
                isValid={isFormValid ?? false}
                hasError={hasError}
                onAction={handleSignUp}
            />
        </Form>
    ) : <></>;
}
