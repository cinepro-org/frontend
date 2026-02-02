import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};
type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};
const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
};
export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
