import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import UIContext from "../contexts/UIContext";
import { jwtDecode } from "jwt-decode";
import { SyncLoader } from "react-spinners";
import DarkToggle from "./DarkToggle";
import { useDarkMode } from "../hooks/DarkMode.jsx";
const Navbar = ({ hasBalance, balance, hasSidebar, isLoading }) => {
  const { darkMode, setDarkMode } = useDarkMode();

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Anosim",
      path: "/anosim",
    },
    {
      name: "HeroSMS",
      path: "/herosms",
    },
    {
      name: "5Sim",
      path: "/fivesim",
    },
    {
      name: "GrizzlySMS",
      path: "/grizzlysms",
    },
  ];
  const { openSidebar, setOpenSidebar } = useContext(UIContext);
  const token = localStorage.getItem("accessToken");
  const user = jwtDecode(token);

  return (
    <header className="bg-surface dark:bg-dark-bg-card px-10 py-5 rounded-2xl flex items-center justify-between border border-border-color dark:border-dark-border">
      <nav className="flex items-center gap-5">
        {hasSidebar ? (
          <>
            {openSidebar ? (
              <button onClick={() => setOpenSidebar(false)}>
                <RxCross2 className="text-header-text dark:text-dark-text-main text-4xl block cursor-pointer" />
              </button>
            ) : (
              <button onClick={() => setOpenSidebar(true)}>
                <IoIosMenu className="text-header-text dark:text-dark-text-main text-4xl block cursor-pointer" />
              </button>
            )}
          </>
        ) : (
          ""
        )}
        <ul className="flex gap-4 items-center">
          {navLinks.map(({ name, path }) => (
            <li
              key={name}
              className={`text-sm lg:text-lg xl:text-xl font-body text-secondary-text dark:text-dark-text-main hover:text-[#8B5CF6] transition duration-200 ease-in-out`}
            >
              <Link to={path}>{name}</Link>
            </li>
          ))}
          {user.isAdmin ? (
            <li
              className={`text-sm lg:text-lg xl:text-xl font-body text-secondary-text dark:text-dark-text-main hover:text-[#8B5CF6] transition duration-200 ease-in-out`}
            >
              <Link to="/admin">Admin</Link>
            </li>
          ) : (
            ""
          )}
        </ul>
      </nav>

      <div className="flex items-center gap-5">
        <DarkToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        {hasBalance ? (
          <>
            {isLoading ? (
              <span className="bg-primary py-2 px-4 rounded-md text-white">
                <SyncLoader color="#ffffff" size={10} />
              </span>
            ) : (
              <span className="bg-primary py-2 px-4 rounded-md text-white">
                ${balance}
              </span>
            )}
          </>
        ) : (
          ""
        )}
      </div>
    </header>
  );
};

export default Navbar;
