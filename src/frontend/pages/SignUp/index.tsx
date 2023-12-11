import './SignUp.css';
import SignUpForm from './SignUpForm';
import React, { useEffect, useState } from 'preact/compat';


export default function SignUpPage(): React.JSX.Element {
    const [isMounted, setIsMounted] = useState<boolean | null>(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);

    return isMounted ? (
        <section className='SignUp'>
            <header className='SignUp-form-header'>
                <h1>
                    <span className='Welcome-span'>Welcome</span> to {' '}
                    <span className='Hub-span'>TrashScanner&trade;</span>
                </h1>
            </header>

            <div className='SignUp-info'>
                <div className='Encryption-notice'>
                    <div className='Encryption-info'>
                        <h2>Encryption Notice</h2>
                        <span>
                            <p className='Text-shadow'>
                                This app encrypts sensitive data using AES-256 bit encryption.
                                The app does not have the ability to decrypt your data. Only you can decrypt your data using your password.
                                This means that if you forget your encryption password, your data will be lost forever.
                                Please keep your password safe and secure.
                            </p>
                        </span>
                    </div>
                </div>

                <h2 className='SignUp-info-heading'>Enter your account details to get started</h2>
                <p className={'SignUp-info-p'}>If you do not have an existing account, please <a
                    target='_blank'
                    rel={'noreferrer noopener'}
                    href={'https://iitoneloc.github.io/trashscanner-web-app/'}>create one here
                </a> before continuing.
                </p>
            </div>

            <SignUpForm />
        </section>
    ) : <></>;
}
