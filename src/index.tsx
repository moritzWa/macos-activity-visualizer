import React from "react";
import ReactDOM from "react-dom";

const App = () => {
  console.log("test");

  return <h1>Hello Electron TypeScript React App!</h1>;
};

ReactDOM.render(<App />, document.getElementById("app"));
