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
        ? url.replace("http://localhost:5000/api/v1", "")
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
    return {
      ok: false,
      status: error.response?.status || 500,
      json: async () => error.response?.data,
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
