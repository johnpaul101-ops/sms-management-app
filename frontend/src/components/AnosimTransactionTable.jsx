import CountdownDisplay from "./CountdownDisplay";
import { RxCross2 } from "react-icons/rx";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import RequestContext from "../contexts/RequestContext";
const AnosimTransactionTable = ({ transaction, activeTransaction }) => {
  const { baseUrl } = useContext(RequestContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelActivation = async (id) => {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    const cancelActivationPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${baseUrl}/anosim/cancel/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          reject(new Error(`${response.status}: ${errorMessage?.message}`));
        }

        const data = await response.json();

        console.log(data);
        resolve(data);
        activeTransaction();
        window.dispatchEvent(new Event("anosimRefetchBalance"));
      } catch (error) {
        reject(error);
      } finally {
        setIsLoading(false);
      }
    });

    toast.promise(cancelActivationPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data?.message || "Successfully cancelled your activation";
        },
      },
      error: {
        render({ data }) {
          return data?.message || "Something went wrong!";
        },
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mt-5">
      <div className="grid grid-cols-[1fr_1fr_3fr_1fr_1fr_4fr_2fr] bg-purple-200 px-5 py-2 rounded-t-md">
        <span className="font-body">Service</span>
        <span className="font-body">Country</span>
        <span className="font-body">Number</span>
        <span className="font-body">Cost</span>
        <span className="font-body">Time</span>
        <span className="font-body">Status</span>
        <span className="font-body text-center">Action</span>
      </div>

      {transaction?.length > 0 ? (
        <>
          {transaction?.map((tx) => (
            <div className="flex flex-col bg-purple-100 px-5 py-4 border-b border-zinc-400 gap-3">
              <div className="grid grid-cols-[1fr_1fr_3fr_1fr_1fr_4fr_2fr] items-center">
                <span className="font-body">{tx.service}</span>
                <span className="font-body">{tx.country}</span>
                <div className="flex gap-5 items-center">
                  <span className="bg-purple-50 px-2 py-1 font-body rounded-sm">
                    {tx.phoneNumber}
                  </span>

                  <div className="relative group flex flex-col items-center">
                    <span className="absolute text-xs bg-surface-2 w-21 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                      Copy Number
                    </span>

                    <button
                      className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tx.phoneNumber);
                      }}
                    >
                      <IoCopyOutline />
                    </button>
                  </div>
                </div>
                <span className="font-body">${tx.price}</span>
                <CountdownDisplay
                  initialSeconds={tx.timeLeftInSeconds}
                  key={`${tx._id}`}
                />

                <span
                  className={`px-2 py-1 border border-black rounded-md ${tx.smsCode.length > 0 ? "border-green-800" : ""} w-fit`}
                >
                  {tx.smsCode.length > 0 ? "SMS Received" : "Waiting for SMS"}
                </span>

                <div className="relative group flex flex-col items-center">
                  <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                    Cancel Activation
                  </span>
                  <button
                    className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                    onClick={() => handleCancelActivation(tx.activationId)}
                    disabled={isLoading}
                  >
                    <RxCross2 />
                  </button>
                </div>
              </div>

              {tx.smsCode?.length > 0
                ? tx.smsCode?.map((code, i) => (
                    <div className="flex flex-col gap-2" key={i}>
                      <div className="flex gap-2 items-center">
                        <span className="text-lg">Text: </span>
                        <span className="bg-purple-200 px-2 py-1 rounded-md">
                          {code}
                        </span>
                      </div>
                    </div>
                  ))
                : ""}
            </div>
          ))}
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default AnosimTransactionTable;
