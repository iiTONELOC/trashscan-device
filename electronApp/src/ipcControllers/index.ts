import mainWindowIpcController,
{
    sessionLogin, sessionLogout,
    IMainWindowIpcBridge, ICreateUserArgs, ILoginArgs
} from './mainWindow';

// Export only what we need to expose to the main and renderer processes.

// The interfaces are used to define the arguments used by the login and create user functions.
export {
    ILoginArgs,
    ICreateUserArgs
}


// The bridges are used to expose the handlers to the renderer process and go in the preload scripts.
// The controllers are used to register the handlers with the main process and go in the main process.
// The Login and Logout handlers are needed directly by the main process and go to the main process.
export {
    IMainWindowIpcBridge,
    mainWindowIpcHandlers,
    mainWindowIpcController
}


// Controllers to be registered with the main process.
export default {
    mainWindowIpcController
}

// Handlers needing to be invoked by the main process.
const mainWindowIpcHandlers = {
    sessionLogin,
    sessionLogout
};
