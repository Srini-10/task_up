import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          newestOnTop={true}
          hideProgressBar={true}
          closeOnClick
          pauseOnHover
          limit={3}
          draggable
          theme="light"
        />
      </BrowserRouter>
    </NextUIProvider>
  </React.StrictMode>
);
