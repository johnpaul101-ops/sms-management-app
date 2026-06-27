import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import RequestContext from "../contexts/RequestContext";

const Herosms = () => {
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);
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
        const response = await fetch(`${baseUrl}/herosms/checkbalance`);
        const data = await response.json();

        if (!response.ok)
          throw new Error(
            `${response.status}: Failed fetching balance from HeroSMS`,
          );

        setBalance(data.balance);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    window.addEventListener("heroSmsRefetchBalance", fetchBalance);

    fetchBalance();
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-main-bg dark:bg-dark-bg-main min-h-screen p-5">
      <Navbar
        balance={balance}
        hasSidebar={true}
        isLoading={isLoading}
        hasBalance={true}
      />
      <div className="flex gap-5 relative">
        <Sidebar links={links} mainPath={"/herosms"} />

        <main className="w-full bg-surface dark:bg-dark-bg-card rounded-2xl p-5 border border-border-color dark:border-dark-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Herosms;
