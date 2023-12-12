import './index.css';
import { render } from 'preact';
import { Loading } from './components';
import { IUserEncrypted } from '../backend/db/models';
import React, { useEffect, useState } from 'preact/compat';
import { LoginPage, SignUpPage, MainViewPage } from './pages';
import { checkForUsers, checkForLoggedInUser } from './utils/API';



function RenderApp() {
    const [hasUsers, setHasUsers] = useState<boolean>(true);
    const [loggedInUser, setLoggedInUser] = useState<IUserEncrypted | null>(null);

    const initViews = async (): Promise<void> => {
        const hasUsers = await checkForUsers();
        setHasUsers(hasUsers);

        const user = await checkForLoggedInUser();
        setLoggedInUser(user);
    };


    useEffect(() => {
        initViews();
    }, []);

    const renderPage = (): React.JSX.Element => {
        if (!hasUsers && !loggedInUser) {
            return <SignUpPage />;
        }
        else if (!loggedInUser && hasUsers) {
            return <LoginPage />;
        }
        else if (loggedInUser && hasUsers) {
            return <MainViewPage />;
        }
        else {
            return <Loading />;
        }
    };

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
