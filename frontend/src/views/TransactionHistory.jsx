import { useContext, useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";
import RequestContext from "../contexts/RequestContext";
import { ClipLoader } from "react-spinners";
const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  useEffect(() => {
    const fetchAllTransacHistory = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(`${response.status}: ${errorData.message}`);
        }

        const data = await response.json();

        setTransactionHistory(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchAllTransacHistory();
  }, []);
  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto items-center">
      <h1 className="text-5xl text-header-text font-heading">
        Activation History
      </h1>

      <div className="w-full max-w-8xl">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr_2fr] bg-purple-200 px-4 py-2 rounded-t-md items-center text-sm">
          <span className="font-body">Provider</span>
          <span className="font-body">User</span>
          <span className="font-body">Country</span>
          <span className="font-body">Service</span>
          <span className="font-body">Number</span>
          <span className="font-body">Cost</span>
          <span className="font-body">Status</span>
        </div>

        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <ClipLoader size={100} color="#a78bfa" />
          </div>
        ) : (
          <div className="flex flex-col bg-purple-100 gap-5 rounded-b-md h-full max-h-[65vh] overflow-auto">
            {transactionHistory?.map(
              ({
                _id,
                provider,
                userName,
                country,
                service,
                phoneNumber,
                price,
                status,
              }) => (
                <div
                  className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr_2fr] px-4 py-2 items-center border-b border-zinc-400 text-sm"
                  key={_id}
                >
                  <span className="font-body">{provider}</span>
                  <span className="font-body">{userName}</span>
                  <span className="font-body">{country}</span>
                  <span className="font-body">{service}</span>
                  <span className="font-body">{phoneNumber}</span>
                  <span className="font-body">${price}</span>

                  <div
                    className={`flex items-center justify-center gap-2 border ${status == "success" ? "border-green-500" : status == "pending" ? "border-yellow-500" : "border-red-500"} px-2 py-1 w-fit rounded-md`}
                  >
                    <GoDotFill
                      className={`${status == "success" ? "text-green-500" : status == "pending" ? "text-yellow-300" : "text-red-500"}`}
                    />
                    <span className="font-body capitalize">{status}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
