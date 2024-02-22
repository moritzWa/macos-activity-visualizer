import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

export const App = () => {
  console.log("test");
  const [theme, setTheme] = useState("light");

  interface AppEvent {
    app: string;
    icon?: string; // Potential path to app icon
    isChrome?: boolean;
    websiteTitle?: string;
    websiteUrl?: string;
  }

  useEffect(() => {
    // frontmost app
    ipcRenderer.on("frontmost-app-changed", (event: AppEvent, app) => {
      console.log("Frontmost App Changed:", app);
      // Update your react state based on 'app'
    });

    // theme
    ipcRenderer.invoke("get-darkmode").then((mode: "dark" | "light") => {
      setTheme(mode);
    });
    ipcRenderer.on(
      "dark-mode-changed",
      (event: AppEvent, mode: "dark" | "light") => {
        console.log("Dark Mode Changed:", mode);
        // Update state for dark mode based on 'mode'
      }
    );
  }, []);

  //   const darkmode = systemPreferences.getEffectiveAppearance();
  const darkmode = "wip";

  return <h1>Hello Electron TypeScript React App! {darkmode}</h1>;
};
