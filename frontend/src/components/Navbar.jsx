import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import UIContext from "../contexts/UIContext";
import { jwtDecode } from "jwt-decode";
import { SyncLoader } from "react-spinners";
import DarkToggle from "./DarkToggle";
import { useDarkMode } from "../hooks/DarkMode.jsx";
import { AiOutlineMenuUnfold } from "react-icons/ai";
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
  const [openNav, setOpenNav] = useState(false);
  const token = localStorage.getItem("accessToken");
  const user = jwtDecode(token);
  const navigate = useNavigate();
  const handleLogoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event("user-logout"));
    navigate("/login");
  };

  return (
    <>
      <header className="bg-surface dark:bg-dark-bg-card px-10 py-5 rounded-2xl flex items-center justify-between border border-border-color dark:border-dark-border">
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setOpenNav(true)}>
            <IoIosMenu className="text-header-text dark:text-dark-text-main text-4xl cursor-pointer" />
          </button>
          {hasSidebar ? (
            <>
              {openSidebar ? (
                <button onClick={() => setOpenSidebar(false)}>
                  <RxCross2 className="text-header-text dark:text-dark-text-main text-2xl cursor-pointer" />
                </button>
              ) : (
                <button onClick={() => setOpenSidebar(true)}>
                  <AiOutlineMenuUnfold className="text-header-text dark:text-dark-text-main text-2xl cursor-pointer" />
                </button>
              )}
            </>
          ) : (
            ""
          )}
        </div>
        <nav className="hidden md:flex items-center gap-5">
          {hasSidebar ? (
            <>
              {openSidebar ? (
                <button onClick={() => setOpenSidebar(false)}>
                  <RxCross2 className="text-header-text dark:text-dark-text-main text-2xl block lg:hidden cursor-pointer" />
                </button>
              ) : (
                <button onClick={() => setOpenSidebar(true)}>
                  <AiOutlineMenuUnfold className="text-header-text dark:text-dark-text-main text-2xl block lg:hidden cursor-pointer" />
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
          <DarkToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <button
            className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-4 py-2 mx-3 rounded-lg font-body text-white text-lg cursor-pointer hidden md:block"
            onClick={() => handleLogoutUser()}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Navbar */}
      <div
        className={`flex flex-col justify-between w-fit h-screen pl-10 pr-20 py-20 bg-surface dark:bg-card-bg fixed -left-96 ${openNav ? "left-0" : ""} top-0 z-20 border-l border-border-color dark:border-dark-border shadow-gray-900 shadow-md transition-all duration-200 ease-in-out`}
      >
        <nav className="flex flex-col gap-8">
          <button
            className="absolute top-5 right-5"
            onClick={() => setOpenNav(false)}
          >
            <RxCross2 className="text-header-text dark:text-dark-text-main text-2xl block lg:hidden cursor-pointer" />
          </button>

          <ul className="flex flex-col gap-4">
            {navLinks.map(({ name, path }) => (
              <li
                key={name}
                className={`text-lg font-body text-secondary-text dark:text-dark-text-main hover:text-[#8B5CF6] transition duration-200 ease-in-out`}
              >
                <Link to={path}>{name}</Link>
              </li>
            ))}
            {user.isAdmin ? (
              <li
                className={`text-lg font-body text-secondary-text dark:text-dark-text-main hover:text-[#8B5CF6] transition duration-200 ease-in-out`}
              >
                <Link to="/admin">Admin</Link>
              </li>
            ) : (
              ""
            )}
          </ul>
        </nav>

        <button
          className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-4 py-2 mx-3 rounded-lg font-body text-white text-lg cursor-pointer w-full"
          onClick={() => handleLogoutUser()}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Navbar;
