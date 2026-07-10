import { useContext, useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import RequestContext from "../contexts/RequestContext";
import TransactionTable from "../components/TransactionTable";
const SmsBowerActivation = () => {
  const [countryId, setCountryId] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [transaction, setTransaction] = useState([]);
  const [prices, setPrices] = useState({});
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { baseUrl } = useContext(RequestContext);
  const countryList = [
    {
      id: 50,

      eng: "Austria",
    },
    {
      id: 43,

      eng: "Germany",
    },
    {
      id: 173,

      eng: "Switzerland",
    },
  ];

  const serviceList = [
    {
      name: "GMX",
      code: "abk",
    },
    {
      name: "LOVOO",
      code: "bpc",
    },
  ];

  useEffect(() => {
    if (!countryId || !serviceCode) return;

    const getCurrentPrices = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/smsbower/get-prices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceCode,
            countryId,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          setPrices({});
          throw new Error(`${response.status}: ${errorMessage.message}`);
        }

        const data = await response.json();
        const serviceData = data?.[countryId]?.[serviceCode];

        setPrices(serviceData || {});
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getCurrentPrices();
  }, [countryId, serviceCode]);

  const bookNumber = async (index) => {
    if (!countryId || !serviceCode) return;

    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${baseUrl}/smsbower/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceCode,
          countryId,
          countryName,
          serviceName,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message ||
            `${response.status}: Failed to book number #${index}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error at index ${index}:`, error);
      throw error;
    }
  };

  const handleBookNumber = async () => {
    setIsLoading(true);

    const promises = [];

    for (let i = 1; i <= amount; i++) {
      promises.push(bookNumber(i));
    }

    const bulkPromise = Promise.all(promises)
      .then((allResults) => {
        getActiveTransaction();
        window.dispatchEvent(new Event("heroSmsRefetchBalance"));

        return {
          message: `Successfully booked ${allResults.length} numbers!`,
          results: allResults,
        };
      })
      .finally(() => {
        setIsLoading(false);
      });

    toast.promise(bulkPromise, {
      pending:
        amount === 1
          ? "Booking your number..."
          : `Booking ${amount} numbers...`,
      success: {
        render({ data }) {
          return data?.message;
        },
      },
      error: {
        render({ data }) {
          return data?.message || "Failed to complete booking.";
        },
      },
    });
  };

  const getActiveTransaction = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${baseUrl}/smsbower/change-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(`${response.status}: ${data.message}`);

      setTransaction(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getActiveTransaction();
    }, 0);

    const globalInterval = setInterval(() => {
      getActiveTransaction();
    }, 5000);

    return () => clearInterval(globalInterval);
  }, []);
  return (
    <div className="p-5 flex flex-col gap-6 items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl md:text-5xl text-header-text dark:text-dark-text-main font-heading">
          SMSBower
        </h1>
        <h1 className="text-lg md:text-3xl text-header-text dark:text-dark-text-main font-heading">
          Activation
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_2fr_2fr_1fr_1fr] w-full lg:max-w-[1400px] items-start gap-4">
        <div className="flex flex-col">
          <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-t-md font-body">
            Select a country
          </span>

          <ul className="bg-surface-2 px-5 py-3 rounded-b-md">
            {countryList.map(({ id, eng }) => (
              <li
                key={id}
                className={`text-sm md:text-lg lg:text-xl font-body cursor-pointer border-b border-zinc-400 rounded-md px-1 py-2 ${id == countryId ? "bg-zinc-400" : ""}`}
                onClick={() => {
                  setCountryId(id);
                  setCountryName(eng);
                }}
              >
                {eng}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-t-md font-body">
            Select a service
          </span>

          {countryId ? (
            <ul className="bg-surface-2 px-5 py-3 rounded-b-md flex flex-col gap-5">
              {serviceList.map(({ name, code }) => (
                <li
                  key={code}
                  className={`text-sm md:text-lg lg:text-xl font-body cursor-pointer border-b border-zinc-400 rounded-md px-1 py-2 ${code == serviceCode ? "bg-zinc-400" : ""}`}
                  onClick={() => {
                    setServiceCode(code);
                    setServiceName(name);
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            ""
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-t-md font-body">
            Prices
          </h1>

          {serviceCode ? (
            <>
              {isLoading ? (
                <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-b-md font-body">
                  Loading...
                </span>
              ) : (
                <>
                  {!prices || Object.keys(prices).length === 0 ? (
                    <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-b-md font-body">
                      No numbers
                    </span>
                  ) : (
                    <div className="bg-surface-2 px-5 py-3 rounded-b-md flex flex-col gap-5">
                      {Object.entries(prices).map(([priceKey, pcsValue]) => (
                        <div
                          key={priceKey}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              className="size-6 accent-purple cursor-pointer"
                              value={priceKey}
                              checked={price == priceKey}
                              onChange={(e) => setPrice(e.target.value)}
                            />
                            <span>${priceKey}</span>
                          </div>
                          <span>{pcsValue} pcs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            ""
          )}
        </div>

        <div className="flex justify-between bg-surface-2 rounded-md w-32">
          <button
            className="w-full text-center bg-zinc-400 py-3 rounded-bl-md rounded-tl-md cursor-pointer hover:bg-zinc-300 transition duration-200 ease-in-out"
            onClick={() => setAmount((prev) => prev - 1)}
            disabled={amount <= 1}
          >
            -
          </button>
          <span className="w-full text-center py-3">{amount}</span>

          <button
            className="w-full text-center bg-zinc-400 py-3 rounded-tr-md rounded-br-md cursor-pointer hover:bg-zinc-300 transition duration-200 ease-in-out"
            onClick={() => setAmount((prev) => prev + 1)}
          >
            +
          </button>
        </div>

        <button
          className="bg-primary text-white hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-3 py-3 font-body rounded-md cursor-pointer disabled:cursor-not-allowed"
          onClick={() => handleBookNumber()}
          disabled={isLoading}
        >
          Buy for ${price || 0}
        </button>
      </div>

      <TransactionTable
        transaction={transaction}
        activeTransaction={getActiveTransaction}
        router={"smsbower"}
        provider={"smsBower"}
      />
    </div>
  );
};

export default SmsBowerActivation;
