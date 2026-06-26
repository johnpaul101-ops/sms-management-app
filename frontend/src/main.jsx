import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RequestContextProvider } from "./contexts/RequestContext.jsx";
import { UIContextProvider } from "./contexts/UIContext.jsx";
import { apiClient } from "./api/apiClient.js";
import { ToastContainer } from "react-toastify";
window._originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  if (typeof url === "string" && !url.includes("onrender.com")) {
    return window._originalFetch(url, options);
  }

  try {
    const response = await apiClient({
      method: options.method || "GET",
      url:
        typeof url === "string"
          ? url.replace("https://sms-management-app.onrender.com/api/v1", "")
          : url,
      data: options.body ? JSON.parse(options.body) : null,
      headers: options.headers,
    });
    return {
      ok: true,
      status: response.status,
      json: async () => response.data,
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    return {
      ok: false,
      status: status,

      json: async () =>
        typeof data === "string"
          ? { message: data, error: true }
          : data || { message: "Error" },
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
