import React, { useContext, useEffect, useState } from "react";
import RequestContext from "../contexts/RequestContext";
import { toast } from "react-toastify";
import SmsCodeTransactionTable from "../components/SmsCodeTransactionTable";

const SmsCodeActivation = () => {
  const [quantity, setQuantity] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [price, setPrice] = useState(0);
  const [productId, setProductId] = useState(null);
  const [serviceData, setServiceData] = useState({ id: null, name: "" });
  const [countryData, setCountryData] = useState({ id: null, name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  const countryList = [
    {
      id: 51,
      name: "Austria",
    },
    {
      id: 44,
      name: "Germany",
    },
    {
      id: 174,
      name: "Switzerland",
    },
  ];
  const serviceList = [
    {
      id: 97,
      name: "GMX",
    },
    {
      id: 466,
      name: "LOVOO",
    },
    {
      id: 99,
      name: "WEBDE",
    },
  ];

  useEffect(() => {
    if (!countryData.id || !serviceData.id) return;

    const getCurrentPrices = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/smscode/price-list`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            countryId: countryData.id,
            serviceId: serviceData.id,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          setPriceList({});
          throw new Error(`${response.status}: ${errorMessage.message}`);
        }

        const data = await response.json();

        setPriceList(data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getCurrentPrices();
  }, [countryData.id, serviceData.id]);

  const handleBookNumber = async () => {
    if (!countryData.id || !serviceData.id || !productId) return;

    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    const handleBookNumberPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${baseUrl}/smscode/activate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: Number(productId),
            countryName: countryData.name,
            serviceName: serviceData.name,
            quantity: quantity,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          reject(
            new Error(
              data.message || `${response.status}: Failed to book a number`,
            ),
          );

          return;
        }
        getActiveTransaction();
        resolve(data);

        window.dispatchEvent(new Event("smsCodeRefetchBalance"));
      } catch (error) {
        reject(error);
      } finally {
        setIsLoading(false);
      }
    });

    toast.promise(handleBookNumberPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return (
            data?.message ||
            `Successfully booked ${quantity > 1 ? `${quantity} numbers` : "a number"}`
          );
        },
      },
      error: {
        render({ data }) {
          return data?.message || "Failed to book a number";
        },
      },
    });
  };

  const getActiveTransaction = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${baseUrl}/smscode/change-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(`${data.message}`);

      setTransactions(data);
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
          SMSCode
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
            {countryList.map(({ id, name }) => (
              <li
                key={id}
                className={`text-sm md:text-lg lg:text-xl font-body cursor-pointer border-b border-zinc-400 rounded-md px-1 py-2 ${id == countryData.id ? "bg-zinc-400" : ""}`}
                onClick={() => setCountryData({ id, name })}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-t-md font-body">
            Select a service
          </span>

          {countryData.id ? (
            <ul className="bg-surface-2 px-5 py-3 rounded-b-md flex flex-col gap-5">
              {serviceList.map(({ id, name }) => (
                <li
                  key={id}
                  className={`text-sm md:text-lg lg:text-xl font-body cursor-pointer border-b border-zinc-400 rounded-md px-1 py-2 ${id == serviceData.id ? "bg-zinc-400" : ""}`}
                  onClick={() => setServiceData({ id, name })}
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

          {serviceData.id ? (
            <>
              {isLoading ? (
                <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-b-md font-body">
                  Loading...
                </span>
              ) : (
                <>
                  {!priceList || priceList.length === 0 ? (
                    <span className="bg-surface-2 px-5 py-3 text-sm md:text-lg lg:text-xl rounded-b-md font-body">
                      No numbers
                    </span>
                  ) : (
                    <div className="bg-surface-2 px-5 py-3 rounded-b-md flex flex-col gap-5 max-h-96 h-fit overflow-auto">
                      {priceList?.map(({ id, available, price }) => (
                        <div
                          key={id}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              className="size-6 accent-purple cursor-pointer"
                              value={id}
                              checked={id == productId}
                              onChange={(e) => {
                                setProductId(e.target.value);
                                setPrice(price.amount);
                              }}
                            />
                            <span>${price.amount}</span>
                          </div>
                          <span>{available} pcs</span>
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
            onClick={() => setQuantity((prev) => prev - 1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="w-full text-center py-3">{quantity}</span>

          <button
            className="w-full text-center bg-zinc-400 py-3 rounded-tr-md rounded-br-md cursor-pointer hover:bg-zinc-300 transition duration-200 ease-in-out"
            onClick={() => setQuantity((prev) => prev + 1)}
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
      <SmsCodeTransactionTable
        router={"smscode"}
        provider={"smsCode"}
        transaction={transactions}
        activeTransaction={getActiveTransaction}
      />
    </div>
  );
};

export default SmsCodeActivation;
