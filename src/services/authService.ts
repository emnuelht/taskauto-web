const ACCESS_TOKEN_KEY = 'auth_access_token';
const USERNAME_KEY = 'auth_username';

const authService = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    setAccessToken(token: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },
    removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    getUsername(): string | null {
        return localStorage.getItem(USERNAME_KEY);
    },
    setUsername(username: string): void {
        localStorage.setItem(USERNAME_KEY, username);
    },
    removeUsername(): void {
        localStorage.removeItem(USERNAME_KEY);
    },

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },

    clearSession(): void {
        this.removeAccessToken();
        this.removeUsername();
    },
};

export default authService;
