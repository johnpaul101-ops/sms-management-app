import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import RequestContext from "../contexts/RequestContext";

const Anosim = () => {
  const { baseUrl } = useContext(RequestContext);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const links = [
    {
      name: "Activation",
      path: "activation",
    },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/anosim/checkbalance`);
        const data = await response.json();

        if (!response.ok)
          throw new Error("Failed fetching balance from anosim", data.message);

        setBalance((data?.balance ?? 0).toFixed(2));
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    window.addEventListener("anosimRefetchBalance", fetchBalance);

    fetchBalance();
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-main-bg dark:bg-dark-bg-main min-h-screen p-2 sm:p-5">
      <Navbar
        hasBalance={true}
        balance={balance}
        hasSidebar={true}
        isLoading={isLoading}
      />
      <div className="flex gap-5 relative">
        <Sidebar links={links} mainPath={"/anosim"} />

        <main className="w-full min-h-[85vh] bg-surface dark:bg-dark-bg-card rounded-2xl p-2 lg:p-5 border border-border-color dark:border-dark-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Anosim;
