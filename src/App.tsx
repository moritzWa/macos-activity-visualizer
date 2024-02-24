import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

export const App = () => {
  console.log("test");
  const [theme, setTheme] = useState("light");
  const [permissionsStatus, setPermissionsStatus] = useState("unknown");

  interface AppEvent {
    app: string;
    icon?: string; // Potential path to app icon
    isChrome?: boolean;
    websiteTitle?: string;
    websiteUrl?: string;
  }

  useEffect(() => {
    ipcRenderer.on("permissions-needed", () => {
      console.log("Permissions needed event received"); // Add logging
      setPermissionsStatus("denied");
    });

    ipcRenderer.on("permissions-granted", () => {
      console.log("Permissions granted event received"); // Add logging
      setPermissionsStatus("granted");
    });

    ipcRenderer.on("frontmost-app-changed", (appData: AppEvent) => {
      console.log(
        "Frontmost App Changed (React):",
        JSON.stringify(appData, null, 2)
      );
    });

    // theme
    ipcRenderer.invoke("get-darkmode").then((mode: "dark" | "light") => {
      setTheme(mode);
    });
    ipcRenderer.on("dark-mode-changed", (mode: "dark" | "light") => {
      console.log("Dark Mode Changed:", mode);
      // Update state for dark mode based on 'mode'
    });
  }, []);

  //   const darkmode = systemPreferences.getEffectiveAppearance();

  return (
    <div>
      <h1>Hello Electron TypeScript React App! {theme}</h1>
      <h2>Permissions Status: {permissionsStatus}</h2>
    </div>
  );
};
