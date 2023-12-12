import './Login.css';
import LoginForm from './LoginForm';
import React, { useEffect, useState } from 'react';


export default function LoginPage(): React.JSX.Element {
    const [isMounted, setIsMounted] = useState<boolean | null>(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);

    return isMounted ? (
        <section className='Login'>
            <header className='Login-form-header'>
                <h1>
                    Welcome Back!
                </h1>

                <h2>Login:</h2>
            </header>

            <LoginForm />
        </section>
    ) : <></>;
}
