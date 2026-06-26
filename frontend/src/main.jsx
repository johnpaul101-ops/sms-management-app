import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RequestContextProvider } from "./contexts/RequestContext.jsx";
import { ToastContainer } from "react-toastify";
import { UIContextProvider } from "./contexts/UIContext.jsx";

import { apiClient } from "./api/apiClient.js";

window._originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  if (
    typeof url === "string" &&
    !url.startsWith("http") &&
    !url.startsWith("/api") &&
    !url.includes("localhost:5000")
  ) {
    return window._originalFetch(url, options);
  }

  const method = (options.method || "GET").toLowerCase();
  const config = {
    method: method,
    url:
      typeof url === "string"
        ? url.replace("https://sms-management-app.onrender.com/api/v1", "")
        : url,
    headers: options.headers || {},
  };

  if (options.body) {
    try {
      config.data = JSON.parse(options.body);
    } catch {
      config.data = options.body;
    }
  }

  try {
    const response = await apiClient(config);
    return {
      ok: true,
      status: response.status,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    return {
      ok: false,
      status: status,
      json: async () =>
        typeof data === "string" ? { message: data, error: true } : data,
    };
  }
};

createRoot(document.getElementById("root")).render(
  <UIContextProvider>
    <RequestContextProvider>
      <App />
      <ToastContainer />
    </RequestContextProvider>
  </UIContextProvider>,
);
