import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

export const App = () => {
  const [theme, setTheme] = useState("light");
  const [permissionsStatus, setPermissionsStatus] = useState("unknown");

  interface AppEvent {
    app: string;
    icon?: string;
    isChrome?: boolean;
    websiteTitle?: string;
    websiteUrl?: string;
  }

  useEffect(() => {
    ipcRenderer.on("permissions-needed", () => {
      setPermissionsStatus("denied");
    });

    ipcRenderer.on("permissions-granted", () => {
      setPermissionsStatus("granted");
    });

    ipcRenderer.on("permissions-requested", () => {
      setPermissionsStatus("pending");
    });

    ipcRenderer.on("frontmost-app-changed", (appData: AppEvent) => {
      console.log(
        "Frontmost App Changed (React):",
        JSON.stringify(appData, null, 2)
      );
    });

    ipcRenderer.invoke("get-darkmode").then((mode: "dark" | "light") => {
      setTheme(mode);
    });

    ipcRenderer.on("dark-mode-changed", (mode: "dark" | "light") => {
      console.log("Dark Mode Changed:", mode);
      // Update state for dark mode based on 'mode'
    });
  }, []);

  const handleRecheckPermissions = () => {
    ipcRenderer.invoke("recheck-permissions");
  };

  return (
    <div>
      <h1>Hello Electron TypeScript React App! {theme}</h1>
      <h2>Permissions Status: {permissionsStatus}</h2>
      {permissionsStatus === "pending" && (
        <p>Waiting for you to grant permissions in System Settings...</p>
      )}
      {permissionsStatus !== "granted" && (
        <button onClick={handleRecheckPermissions}>Recheck Permissions</button>
      )}
    </div>
  );
};
