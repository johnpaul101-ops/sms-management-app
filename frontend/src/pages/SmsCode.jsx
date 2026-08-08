import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import RequestContext from "../contexts/RequestContext";

const SmsCode = () => {
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/smscode/checkbalance`);
        const data = await response.json();

        if (!response.ok)
          throw new Error(
            `${response.status}: Failed fetching balance from SMSCode`,
          );

        setBalance(data.balance);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    window.addEventListener("SmsCodeRefetchBalance", fetchBalance);

    fetchBalance();
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-main-bg dark:bg-dark-bg-main min-h-screen p-2 lg:p-5">
      <Navbar
        balance={balance}
        hasSidebar={false}
        isLoading={isLoading}
        hasBalance={true}
      />
      <div className="flex gap-5 relative">
        <main className="w-full min-h-[85vh] bg-surface dark:bg-dark-bg-card rounded-2xl p-2 lg:p-5 border border-border-color dark:border-dark-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SmsCode;
