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
  const [permissionsStatus, setPermissionsStatus] = useState("unknown");
  const [activeApp, setActiveApp] = useState<AppEvent>({} as AppEvent);

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
      setActiveApp(appData);
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
      {activeApp && (
        <div>
          <h3>Active App: {activeApp.app}</h3>
          {activeApp.websiteTitle && <h4>Title: {activeApp.websiteTitle}</h4>}
          {activeApp.websiteUrl && <h4>URL: {activeApp.websiteUrl}</h4>}
          {/* {activeApp.icon && <img src={activeApp.icon} />} */}
        </div>
      )}
    </div>
  );
};
