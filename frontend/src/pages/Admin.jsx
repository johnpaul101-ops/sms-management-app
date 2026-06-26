import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Admin = () => {
  const links = [
    {
      name: "Users",
      path: "users",
    },
    {
      name: "Activation History",
      path: "activation-history",
    },
  ];

  return (
    <div className="flex flex-col gap-5 bg-main-bg min-h-screen p-5">
      <Navbar hasSidebar={true} />
      <div className="flex gap-5 relative">
        <Sidebar links={links} mainPath={"/admin"} />

        <main className="w-full bg-surface rounded-2xl p-5 border border-border-color">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
