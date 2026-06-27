import { useContext, useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";
import RequestContext from "../contexts/RequestContext";
import { ClipLoader } from "react-spinners";
const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  useEffect(() => {
    const fetchAllTransacHistory = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/transactions?page=${page}&limit=40`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(`${response.status}: ${errorData.message}`);
        }

        const data = await response.json();

        setPage(data.page);
        setTotalPages(data.totalPages);
        setTransactionHistory(data.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchAllTransacHistory();
  }, [page]);

  const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-5 p-5 overflow-y-auto items-center">
      <h1 className="text-5xl text-header-text dark:text-dark-text-main font-heading">
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
          <div className="flex flex-col bg-purple-100 gap-5 rounded-b-md h-[60vh] max-h-[65vh] overflow-auto">
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
        <div className="flex gap-2 mt-4 justify-self-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-primary hover:text-white font-body cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          {totalPagesArray.map((num) => (
            <button
              className={`px-4 py-2 bg-gray-200 text-header-text rounded hover:bg-primary hover:text-white ${page == num ? "bg-primary text-white disabled:cursor-not-allowed" : ""} font-body cursor-pointer`}
              onClick={() => setPage(num)}
              key={num}
              disabled={page == num}
            >
              {num}
            </button>
          ))}

          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-primary hover:text-white font-body cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
