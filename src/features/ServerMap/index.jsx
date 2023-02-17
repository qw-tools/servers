import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

if (import.meta.env.PROD) {
  console.log(`
███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ ███████╗
██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝
███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝███████╗
╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║
███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║███████║
╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝

source code: https://github.com/qw-tools/servers
`);
}
