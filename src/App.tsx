import moment from "moment";
import React, { useEffect, useState } from "react";
// import { Tooltip } from "./Tooltip";
import * as Tooltip from "@radix-ui/react-tooltip";
import "./styles.css";
import { getFaviconURL, getRootOfURL } from "./utils";
const { ipcRenderer } = window.require("electron");

interface EthiDbResult {
  id: number;
  sessionId: number;
  title: string;
  url: string;
  end: string; // format: YYYY-MM-DD HH:mm:ss
  start: string; // format: YYYY-MM-DD HH:mm:ss
}

interface FaviconData {
  url: string;
  favicon: string;
}

export const App = () => {
  const [theme, setTheme] = useState("light");
  const [ethiData, setEthiData] = useState<EthiDbResult[]>([]);
  const [faviconData, setFaviconData] = useState<FaviconData[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  const handleNextDay = () => {
    setSelectedDate(
      moment.utc(selectedDate).add(1, "day").format("YYYY-MM-DD")
    );
  };

  const handlePreviousDay = () => {
    setSelectedDate(
      moment.utc(selectedDate).subtract(1, "day").format("YYYY-MM-DD")
    );
  };

  const fetchData = () => {
    ipcRenderer
      .invoke("query-ethi-db", selectedDate)
      .then((results: EthiDbResult[]) => {
        const filteredResults = results
          .filter(
            (row) =>
              (row.title ? row.title.trim() : "") !== "" &&
              // (row.url ? row.url.trim() : "") !== "" &&
              row.url !== "chrome://newtab/" &&
              row.url !==
                "chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html" &&
              row.url !==
                "chrome-extension://pfglnpdpgmecffbejlfgpnebopinlclj/html/options.html"
          )
          .map((row) => ({
            ...row,
            start: moment.utc(row.start).local().format("YYYY-MM-DD HH:mm:ss"),
            end: moment.utc(row.end).local().format("YYYY-MM-DD HH:mm:ss"),
          }));

        setEthiData(filteredResults);

        const uniqueUrls = Array.from(
          new Set(filteredResults.map((result) => getRootOfURL(result.url)))
        ).filter((url) => url !== "");

        const favicons = uniqueUrls.map((url) => ({
          url,
          favicon: getFaviconURL(url),
        }));
        setFaviconData(favicons);
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

  return (
    <div className={`${theme === "dark" ? "dark" : ""} h-full`}>
      <div className="dark:bg-dark-bg h-auto dark:text-dark-text p-4">
        <h1 className="text-3xl font-bold mb-4 ">
          Hello Electron TypeScript React App! {theme}
        </h1>
        <div>Selected Date: {moment(selectedDate).format("MM-DD")}</div>
        <div className="flex flex-row  gap-4 py-4">
          <button onClick={handlePreviousDay}>Previous Day</button>
          <button onClick={handleNextDay}>Next Day</button>
        </div>

        {Array.apply(null, Array(24)).map((hourOfDay, i) => (
          <div className="h-28 border-t flex">
            <div className="pt-1 pr-3 w-14 flex justify-end">{i}:00</div>
            <div className="grid flex-col w-full">
              {Array.apply(null, Array(4)).map((fifteenMinutes, j) => {
                const start = moment(selectedDate)
                  .add(i, "hours")
                  .add(j * 15, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");
                const end = moment(start)
                  .add(15, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");
                const dataInThisSlot = ethiData
                  .filter((data) => {
                    return data.start >= start && data.end <= end;
                  })
                  .filter(
                    (v, i, a) => a.findIndex((t) => t.title === v.title) === i
                  );
                const faviconsInThisSlot = faviconData.filter((data) =>
                  dataInThisSlot.some((d) => getRootOfURL(d.url) === data.url)
                );

                return (
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div className="flex flex-row overflow-x-auto">
                          {faviconsInThisSlot.map((data) => (
                            <img
                              src={data.favicon}
                              alt="favicon"
                              className="h-6 w-6 mr-1"
                            />
                          ))}
                        </div>
                      </Tooltip.Trigger>
                      {dataInThisSlot.length !== 0 && (
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className={`p-4 text-xs overflow-auto max-h-96 ${
                              theme === "dark"
                                ? "bg-dark-bg-secondary text-dark-text-secondary"
                                : "bg-white text-black"
                            }`}
                            sideOffset={5}
                          >
                            <ol>
                              {dataInThisSlot.map((data) => (
                                <li key={data.id}>{`${moment(data.start).format(
                                  "HH:mm"
                                )}: ${data.title} - ${data.url}`}</li>
                              ))}
                            </ol>
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      )}
                    </Tooltip.Root>
                  </Tooltip.Provider>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
