export type UserProfile = {
    username: string;
    password: string;
    deviceKey: string;
}

export const getUserProfile = (): UserProfile | null => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        return JSON.parse(userProfile);
    }
    return null;
}