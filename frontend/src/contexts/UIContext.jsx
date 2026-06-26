import { createContext, useState } from "react";

const UIContext = createContext();

export const UIContextProvider = ({ children }) => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <UIContext.Provider value={{ openSidebar, setOpenSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;
