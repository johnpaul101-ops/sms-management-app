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
    <div className="flex flex-col gap-5 bg-main-bg dark:bg-dark-bg-main min-h-screen p-5">
      <Navbar hasSidebar={true} />
      <div className="flex gap-5 relative">
        <Sidebar links={links} mainPath={"/admin"} />

        <main className="w-full bg-surface dark:bg-dark-bg-card rounded-2xl p-5 border border-border-color dark:border-dark-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
