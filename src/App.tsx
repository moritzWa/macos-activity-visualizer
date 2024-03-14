import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

interface AppEvent {
  app: string;
  icon?: string;
  isChrome?: boolean;
  websiteTitle?: string;
  websiteUrl?: string;
}
export const App = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // dark mode
    ipcRenderer.invoke("get-darkmode").then((mode: "dark" | "light") => {
      setTheme(mode);
    });
    ipcRenderer.on("dark-mode-changed", (mode: "dark" | "light") => {
      console.log("Dark Mode Changed:", mode);
      // Update state for dark mode based on 'mode'
    });
  }, []);

  return (
    <div>
      <h1>Hello Electron TypeScript React App! {theme}</h1>
    </div>
  );
};
