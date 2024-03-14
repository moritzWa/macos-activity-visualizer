import moment from "moment";
import React, { useEffect, useState } from "react";
const { ipcRenderer } = window.require("electron");

interface EthiDbResult {
  // TODO:
  // Example:
  id: number;
  sessionId: number;
  title: string;
  url: string;
}

export const App = () => {
  const [theme, setTheme] = useState("light");
  const [ethiData, setEthiData] = useState<EthiDbResult[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  const handleNextDay = () => {
    setSelectedDate(moment(selectedDate).add(1, "day").format("YYYY-MM-DD"));
  };

  const handlePreviousDay = () => {
    setSelectedDate(
      moment(selectedDate).subtract(1, "day").format("YYYY-MM-DD")
    );
  };

  const fetchData = () => {
    ipcRenderer
      .invoke("query-ethi-db", selectedDate)
      .then((results: EthiDbResult[]) => {
        setEthiData(results);
      })
      .catch((error: Error) => {
        console.error("Error querying Ethi database:", error);
      });
  };

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
    fetchData();
  }, [selectedDate]);

  const rowsWithoutNoTitleNoUrlItems = ethiData.filter(
    (row) =>
      (row.title ? row.title.trim() : "") !== "" &&
      (row.url ? row.url.trim() : "") !== ""
  );

  return (
    <div>
      <h1>Hello Electron TypeScript React App! {theme}</h1>
      <div>Selected Date: {moment(selectedDate).format("MM-DD")}</div>
      <button onClick={handlePreviousDay}>Previous Day</button>
      <button onClick={handleNextDay}>Next Day</button>
      {ethiData.length > 0 ? (
        <ul>
          {rowsWithoutNoTitleNoUrlItems.map((row) => (
            <li key={row.id}>
              {row.title == "" ? row.url : row.title} - {row.sessionId}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data yet...</p>
      )}
    </div>
  );
};
