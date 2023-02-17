import React from "react";
import ReactDOM from "react-dom/client";
import store from "../../common/store.js";
import { Provider } from "react-redux";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);

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
