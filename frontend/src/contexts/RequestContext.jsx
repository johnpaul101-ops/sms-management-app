import { createContext } from "react";

const RequestContext = createContext();

export const RequestContextProvider = ({ children }) => {
  let baseUrl = import.meta.env.VITE_API_BASE_URL;
  return (
    <RequestContext.Provider
      value={{
        baseUrl,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export default RequestContext;
