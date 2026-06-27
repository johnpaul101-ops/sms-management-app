import { useContext, useEffect, useRef } from "react";
import RequestContext from "../contexts/RequestContext";
import { useState } from "react";
import { toast } from "react-toastify";
import AnosimTransactionTable from "../components/AnosimTransactionTable";

const AnosimActivation = () => {
  const { baseUrl } = useContext(RequestContext);
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [countryId, setCountryId] = useState("");
  const [service, setService] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [providerList, setProviderList] = useState([]);
  const [productId, setProductId] = useState("");
  const [provId, setProvId] = useState("0");
  const [amount, setAmount] = useState(1);
  const [transaction, setTransaction] = useState([]);

  const currentIndex = useRef(0);

  const countryList = [
    {
      id: 98,
      country: "Germany",
    },
  ];

  const servicesList = [
    {
      id: 409,
      service: "GMX",
    },

    {
      id: 483,
      service: "Lovoo",
    },
  ];
  const filteredCountryList = countryList.filter((name) => {
    if (!country) return countryList;
    return name.country.toLowerCase().includes(country.toLowerCase());
  });
  const filteredServicesList = servicesList.filter((name) => {
    if (!service) return servicesList;
    return name.service.toLowerCase().includes(service.toLowerCase());
  });

  useEffect(() => {
    if (!countryId || !serviceId) return;

    const getProductPrice = async () => {
      const token = localStorage.getItem("accessToken");

      setIsLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/anosim/products?countryId=${countryId}&rentalTypeId=${1}&serviceId=${serviceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok)
          throw new Error(`${response.status}: ${data.message}`);

        console.log(data);

        if (data && data.length > 0) {
          const product = data[0];

          setPrice(product.basePrice);
          setDuration(product.durationInMinutes);
          setProductId(product.id);

          if (product.priceMap && product.priceMap.length > 0) {
            const firstPriceMap = product.priceMap[0];

            setProviderList(firstPriceMap.providers || []);
          } else {
            setProviderList([]);
          }
        } else {
          console.log("No product found");
        }
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getProductPrice();
  }, [countryId, serviceId]);

  const handleBookNumber = async () => {
    if (!countryId || !serviceId || !productId) return;

    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    const handleBookNumberPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${baseUrl}/anosim/activate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, amount, provId }),
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

        window.dispatchEvent(new Event("anosimRefetchBalance"));
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
          return data?.message || "Successfully booked a number";
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
      const response = await fetch(`${baseUrl}/anosim/change-status`, {
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

    if (!transaction) {
      return;
    }

    const globalInterval = setInterval(() => {
      getActiveTransaction();
    }, 10000);

    return () => clearInterval(globalInterval);
  }, []);

  useEffect(() => {
    if (!transaction || transaction.length === 0) return;

    const fetchInterval = setInterval(async () => {
      const indexToFetch = currentIndex.current % transaction.length;

      const currentItem = transaction[indexToFetch];

      const currentId = currentItem?._id || currentItem;

      if (!currentId || currentId === "undefined") {
        currentIndex.current += 1;
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/anosim/get-sms/${currentId}`);
        if (!response.ok)
          throw new Error(
            `${response.status}: Failed fetching sms from anosim`,
          );
      } catch (error) {
        console.error(error);
      }

      currentIndex.current += 1;
    }, 5000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [transaction]);

  return (
    <div className="flex flex-col gap-5 h-full items-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl text-header-text font-heading text-center mt-5">
          Anosim
        </h1>
        <h1 className="text-3xl text-header-text font-heading">Activation</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="w-64 flex flex-col gap-2">
          <h1 className="text-header-text text-xl text-center">Country</h1>
          <input
            type="text"
            className="bg-surface-2 w-full px-2 py-3 rounded-md focus:outline-none"
            placeholder={"Search..."}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <div className="bg-surface-2 p-3 rounded-md">
            <ul className="flex flex-col gap-3">
              {filteredCountryList?.map(({ country, id }) => (
                <li
                  className={`flex flex-col gap-3 pl-3 py-3 border-b border-zinc-400 text-lg font-body cursor-pointer ${countryId == id ? "bg-zinc-400" : ""}`}
                  key={id}
                  onClick={() => setCountryId(id)}
                >
                  {country}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-64 flex flex-col gap-2">
          <h1 className="text-header-text text-xl text-center">Service</h1>
          <input
            type="text"
            className="bg-surface-2 w-full px-2 py-3 rounded-md focus:outline-none"
            placeholder={"Search..."}
            value={service}
            onChange={(e) => setService(e.target.value)}
          />

          {countryId ? (
            <div className="bg-surface-2 p-3 rounded-md">
              <ul className="flex flex-col gap-3">
                {filteredServicesList?.map(({ service, id }) => (
                  <li
                    className={`flex flex-col gap-3 pl-3 py-3 border-b border-zinc-400 text-lg font-body cursor-pointer ${serviceId == id ? "bg-zinc-400" : ""}`}
                    key={id}
                    onClick={() => setServiceId(id)}
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="w-full p-3 bg-surface-2 rounded-md">
              <span className="text-lg text-zinc-500">Select a Country</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-56">
          <h1 className="text-header-text text-xl text-center">Price</h1>

          {isLoading ? (
            <div className="bg-surface-2 w-full px-2 py-3 rounded-md">
              <span className="text-zinc-500 text-center">Loading...</span>
            </div>
          ) : (
            <>
              {serviceId ? (
                <div className="flex justify-between items-center px-4 bg-zinc-400 w-full py-3 rounded-md">
                  <span className="text-lg text-white">{duration}m</span>
                  <span className="bg-surface-2 px-3 py-0.5 rounded-md text-lg">
                    ${price}
                  </span>
                </div>
              ) : (
                <div className="bg-surface-2 w-full px-2 py-3 rounded-md">
                  <span className="text-zinc-500 text-center">
                    Select Service
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 w-72">
          <h1 className="text-header-text text-xl text-center">Provider</h1>

          {isLoading ? (
            <div className="bg-surface-2 w-full px-2 py-3 rounded-md">
              <span className="text-zinc-500 text-center">Loading...</span>
            </div>
          ) : (
            <>
              {serviceId ? (
                <div className="flex flex-col bg-surface-2 p-3 rounded-md gap-5">
                  {providerList.length > 0 ? (
                    <>
                      {providerList?.map(
                        ({ availableCount, name, providerId }) => (
                          <div
                            className={`flex justify-between items-center border-b border-zinc-400 rounded-md py-3 px-2 cursor-pointer ${providerId == provId ? "bg-zinc-400" : ""}`}
                            key={providerId}
                            onClick={() => setProvId(providerId)}
                          >
                            <span className="text-lg">{name}</span>
                            <span className="text-header-text bg-surface-2 px-2 py-1 rounded-md">
                              Available: {availableCount}
                            </span>
                          </div>
                        ),
                      )}
                    </>
                  ) : (
                    <div
                      className={`flex justify-between items-center border-b border-zinc-400 rounded-md bg-zinc-400 py-3 px-2 cursor-pointer`}
                    >
                      <span className="text-lg">Any</span>
                      <span className="text-header-text bg-surface-2 px-2 py-1 rounded-md">
                        Available: 0
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface-2 w-full px-2 py-3 rounded-md">
                  <span className="text-zinc-500 text-center">
                    Select Service
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 w-32">
          <h1 className="text-header-text text-xl text-center">Amount</h1>

          <div className="flex flex-col gap-4">
            <div className=" flex justify-between bg-surface-2 rounded-md">
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
              className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow py-2 font-body text-white rounded-md cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading}
              onClick={() => handleBookNumber()}
            >
              Book Number
            </button>
          </div>
        </div>
      </div>

      <AnosimTransactionTable
        transaction={transaction}
        activeTransaction={getActiveTransaction}
      />
    </div>
  );
};

export default AnosimActivation;
