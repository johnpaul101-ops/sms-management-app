import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UIContext from "../contexts/UIContext";
import { jwtDecode } from "jwt-decode";
const Sidebar = ({ links, mainPath }) => {
  const name = localStorage.getItem("userName");
  const { openSidebar } = useContext(UIContext);
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const user = jwtDecode(token);
  let navigate = useNavigate();
  const handleLogoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event("user-logout"));
    navigate("/login");
  };

  return (
    <aside
      className={`w-80 min-h-[85vh] flex flex-col gap-4 pt-5 rounded-2xl bg-surface dark:bg-dark-bg-card fixed ${openSidebar ? "left-5" : "-left-96"} xl:static border border-border-color dark:border-dark-border transition-all duration-200 ease-in-out pb-10`}
    >
      <span className="text-xl text-center font-heading text-header-text dark:text-dark-text-main">
        {name} {user.isAdmin ? "( Admin )" : ""}
      </span>
      <div className="flex flex-col gap-3 pl-10 py-5 flex-1">
        <ul className="flex flex-col gap-5">
          {links?.map(({ name, path }) => (
            <li
              key={name}
              className={` text-xl font-body pl-5 py-3 rounded-bl-2xl rounded-tl-2xl hover:bg-main-bg hover:text-header-text dark:hover:bg-dark-bg-main dark:text-dark-text-main transition-all duration-150 ease-in-out ${location.pathname == `${mainPath}/${path}` ? "bg-main-bg text-header-text dark:bg-dark-bg-main dark:text-dark-text-main" : "text-secondary-text dark:text-dark-text-main"}`}
            >
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-3 py-2 mx-3 rounded-lg font-body text-white text-lg cursor-pointer"
        onClick={() => handleLogoutUser()}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
