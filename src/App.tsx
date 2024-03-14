import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

interface EthiDbResult {
  // TODO:
  // Example:
  id: number;
  sessionId: number;
  title: string;
  // ...other properties
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

    // db query
    const query = "SELECT * FROM Activities LIMIT 10";
    ipcRenderer
      .invoke("query-ethi-db", query)
      .then((results: EthiDbResult[]) => {
        // Type annotation here
        console.log("Ethi DB Results:", results);
        // Use the results to update component state
      })
      .catch((error: Error) => {
        // Type annotation for error
        console.error("Error querying Ethi database:", error);
      });
  }, []);

  return (
    <div>
      <h1>Hello Electron TypeScript React App! {theme}</h1>
      test
    </div>
  );
};
