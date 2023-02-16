import React from "react";
import ReactDOM from "react-dom/client";
import store from "./app/store.js";
import { Provider } from "react-redux";
import App from "./app/App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
  <Provider store={store}>
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Provider>
  //</React.StrictMode>
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
