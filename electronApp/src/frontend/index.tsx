import './index.css';
import { render } from 'preact';
import { checkForUsers } from './utils/API';
import { SignUpPage, MainViewPage } from './pages';
import React, { useEffect, useState } from 'preact/compat';


function RenderApp() {
    const [hasUsers, setHasUsers] = useState<boolean>(true);
    // const [loggedInUser, setLoggedInUser] = useState<IUserEncrypted | null>(null);

    const initViews = async (): Promise<void> => {
        const hasUsers = await checkForUsers();
        setHasUsers(hasUsers);
    };

    const renderPage = (): React.JSX.Element => {
        if (!hasUsers) {
            return <SignUpPage />;
        } else {
            return <MainViewPage />;
        }

    };

    useEffect(() => {
        initViews();
    }, []);


    return (
        <div className='App'>
            {renderPage()}
        </div>
    );
}


function FrontEnd(): void {
    render(<RenderApp />, document.body);
}

FrontEnd();
