'use client';
import { Children, useEffect, useState } from "react";
import ThemeContext from "@/context/themeContext";
const ThemeProvider = ({ children }: { children: React.ReactNode}) => {

    const themeFromStorage = typeof localStorage !== "undefined" && localStorage.getItem('facility-theme') 
    ? JSON.parse(localStorage.getItem('facility-theme')!)
    : false;

const [darkTheme, setDarkTheme] = useState<boolean>(themeFromStorage);
const [renderComponent, setRenderComponent] = useState(false);

useEffect(() => {
    setRenderComponent(true);
}, []);
    
if (!renderComponent) return <></>;

    return(
        <ThemeContext.Provider value={{ darkTheme, setDarkTheme}}>
        <div className={`${darkTheme ? 'dark' : ''} min-h-screen`}>
            <div className="dark:text-white dark:bg-secondary text-[#1E1E1E]">
                {children}
            </div>
        </div>

    </ThemeContext.Provider>
    );
    
};

export   default ThemeProvider;
