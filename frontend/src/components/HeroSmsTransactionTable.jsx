import { useState, useContext } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import CountdownDisplay from "../components/CountdownDisplay.jsx";
import { IoCheckmarkOutline } from "react-icons/io5";
import { GrPowerCycle } from "react-icons/gr";
import { LuMessageSquareMore } from "react-icons/lu";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { toast } from "react-toastify";
import RequestContext from "../contexts/RequestContext.jsx";

const HeroSmsTransactionTable = ({ transaction, activeTransaction }) => {
  const [downSmsCode, setDownSmsCode] = useState(false);
  const [transacId, setTransacId] = useState("");
  const { baseUrl } = useContext(RequestContext);

  const changeActivationStatus = async (id, status) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${baseUrl}/herosms/status?id=${id}&status=${Number(status)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(`${response.status}: ${errorMessage.message}`);
      }

      const data = await response.json();
      activeTransaction();
      window.dispatchEvent(new Event("heroSmsRefetchBalance"));
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleChangeStatus = async (id, status) => {
    const cancelPromise = changeActivationStatus(id, status);

    toast.promise(cancelPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data?.message || "Successfully change status";
        },
      },
      error: {
        render({ data }) {
          return data?.message || "Something went wrong!";
        },
      },
    });
  };

  const handleGetTransactionId = (id) => {
    setDownSmsCode((prev) => !prev);
    setTransacId(id);
  };
  return (
    <>
      <div className="w-full max-w-7xl hidden md:block">
        <div className="grid grid-cols-[1fr_1fr_3fr_1fr_1fr_3fr_2fr] bg-purple-200 px-5 py-2 rounded-t-md">
          <span className="font-body text-xs md:text-sm">Service</span>
          <span className="font-body text-xs md:text-sm">Country</span>
          <span className="font-body text-xs md:text-sm">Number</span>
          <span className="font-body text-xs md:text-sm">Cost</span>
          <span className="font-body text-xs md:text-sm">Time</span>
          <span className="font-body text-xs md:text-sm">Status</span>
          <span className="font-body text-center text-xs md:text-sm">
            Action
          </span>
        </div>

        {transaction?.length > 0 ? (
          <>
            {transaction?.map((tx) => (
              <div className="grid grid-cols-[1fr_1fr_3fr_1fr_1fr_3fr_2fr] bg-purple-100 px-5 py-2 items-center text-xs">
                <span className="font-body">{tx.service}</span>
                <span className="font-body">{tx.country}</span>
                <div className="flex gap-2 lg:gap-5 items-center">
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2 items-center">
                      <span className={`font-body`}>SMS Code:</span>

                      <span
                        className={`px-2 py-1 border border-black rounded-md ${tx.smsCode.length > 0 ? "border-green-800" : ""} cursor-pointer hover:bg-purple-300 transition ease-in-out duration-200`}
                        onClick={() => {
                          navigator.clipboard.writeText(tx?.smsCode.at(-1));
                        }}
                      >
                        {tx?.smsCode.length > 0
                          ? `${tx?.smsCode.at(-1)}`
                          : "Waiting for SMS"}
                      </span>
                    </div>
                  </div>

                  {tx?.smsCode.length > 0 ? (
                    <div className="w-56 flex flex-col gap-2 relative">
                      <div
                        className="flex gap-2 items-center bg-purple-200 w-fit px-2 rounded-md py-1 cursor-pointer hover:bg-purple-400 transition duration-200 ease-in-out"
                        onClick={() => handleGetTransactionId(tx._id)}
                      >
                        <LuMessageSquareMore />
                        <span>{tx?.smsCode.length}</span>
                        <MdOutlineArrowDropDown className="size-5" />
                      </div>

                      <div
                        className={`flex flex-col gap-2 bg-purple-300 px-2 py-2 rounded-md absolute top-10 ${downSmsCode && transacId == tx._id ? "" : "hidden"} cursor-pointer z-40`}
                      >
                        {tx?.smsCode.map((code) => (
                          <span
                            className="bg-purple-200 px-2 py-1 rounded-md hover:bg-pink-400 transition duration-200 ease-in-out"
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                            }}
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                {tx?.smsCode.length > 0 ? (
                  <div className="flex gap-3 items-center justify-center">
                    <div className="relative group flex flex-col items-center">
                      <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                        Resend SMS
                      </span>
                      <button
                        className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                        onClick={() => handleChangeStatus(tx.activationId, 3)}
                      >
                        <GrPowerCycle />
                      </button>
                    </div>
                    <div className="relative group flex flex-col items-center">
                      <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                        Complete Activation
                      </span>
                      <button
                        className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                        onClick={() => handleChangeStatus(tx.activationId, 6)}
                      >
                        <IoCheckmarkOutline />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group flex flex-col items-center">
                    <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                      Cancel Activation
                    </span>
                    <button
                      className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                      onClick={() => handleChangeStatus(tx.activationId, 8)}
                    >
                      <RxCross2 />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          ""
        )}
      </div>

      {/* Transaction Mobile View  */}
      {transaction?.length > 0 ? (
        <div className="flex md:hidden flex-col w-full px-4 py-2 bg-purple-100 rounded-md">
          {transaction?.map((tx) => (
            <div className="flex flex-col gap-3 border-b border-gray-400 p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-body">${tx?.price}</span>
                <CountdownDisplay
                  initialSeconds={tx?.timeLeftInSeconds}
                  key={`${tx._id}`}
                />
              </div>

              <div className="flex items-center gap-5">
                <span className="text-xs font-body">{tx?.service}</span>
                <span className="text-xs font-body">{tx?.country}</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex gap-2 md:gap-5 items-center">
                  <span className="bg-purple-50 px-2 py-1 font-body rounded-sm text-sm">
                    {tx?.phoneNumber}
                  </span>

                  <div className="relative group flex flex-col items-center">
                    <span className="absolute text-xs bg-surface-2 w-21 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                      Copy Number
                    </span>

                    <button
                      className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tx?.phoneNumber);
                      }}
                    >
                      <IoCopyOutline />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2 items-center">
                      <span className={`font-body`}>SMS Code:</span>

                      <span
                        className={`px-2 py-1 border border-black rounded-md $ cursor-pointer hover:bg-purple-300 transition ease-in-out duration-200`}
                        onClick={() => {
                          navigator.clipboard.writeText(tx?.smsCode.at(-1));
                        }}
                      >
                        {tx?.smsCode.length > 0
                          ? `${tx?.smsCode.at(-1)}`
                          : "Waiting for SMS"}
                      </span>
                    </div>
                  </div>

                  {tx?.smsCode.length > 0 ? (
                    <div className="w-56 flex flex-col gap-2 relative">
                      <div
                        className="flex gap-2 items-center bg-purple-200 w-fit px-2 rounded-md py-1 cursor-pointer hover:bg-purple-400 transition duration-200 ease-in-out"
                        onClick={() => handleGetTransactionId(tx._id)}
                      >
                        <LuMessageSquareMore />
                        <span>{tx?.smsCode.length}</span>
                        <MdOutlineArrowDropDown className="size-5" />
                      </div>

                      <div
                        className={`flex flex-col gap-2 bg-purple-300 px-2 py-2 rounded-md absolute top-10 ${downSmsCode && transacId == tx._id ? "" : "hidden"} cursor-pointer z-40`}
                      >
                        {tx?.smsCode.map((code) => (
                          <span
                            className="bg-purple-200 px-2 py-1 rounded-md hover:bg-pink-400 transition duration-200 ease-in-out"
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                            }}
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {tx?.smsCode.length > 0 ? (
                <div className="flex gap-3 items-center">
                  <div className="relative group flex flex-col items-center">
                    <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                      Resend SMS
                    </span>
                    <button
                      className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                      onClick={() => handleChangeStatus(tx.activationId, 3)}
                    >
                      <GrPowerCycle />
                    </button>
                  </div>
                  <div className="relative group flex flex-col items-center">
                    <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                      Complete Activation
                    </span>
                    <button
                      className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                      onClick={() => handleChangeStatus(tx.activationId, 6)}
                    >
                      <IoCheckmarkOutline />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group flex flex-col items-start w-fit">
                  <span className="absolute text-xs bg-surface-2 p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 group-hover:-translate-y-9 transition-all duration-200 ease-in-out cursor-pointer">
                    Cancel Activation
                  </span>
                  <button
                    className="bg-purple-50 p-2 rounded-full hover:bg-purple-300 transition duration-200 ease-in-out cursor-pointer w-8"
                    onClick={() => handleChangeStatus(tx.activationId, 8)}
                  >
                    <RxCross2 />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default HeroSmsTransactionTable;
