import { useContext, useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";
import RequestContext from "../contexts/RequestContext";
import { ClipLoader } from "react-spinners";
import { GrFormPrevious } from "react-icons/gr";
import { MdNavigateNext } from "react-icons/md";
import TransactionHistoryTable from "../components/TransactionHistoryTable";
import TransactionHistoryCard from "../components/TransactionHistoryCard";
import { CiFilter } from "react-icons/ci";
const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  const filterCategories = ["", "pending", "success", "cancelled"];

  useEffect(() => {
    let URL = `${baseUrl}/transactions?page=${page}&limit=40`;
    const fetchAllTransacHistory = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);
      try {
        if (category && category != "") {
          URL = URL + `&category=${category}`;
        }

        const response = await fetch(URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [page, category]);

  const pages = Array.from(
    { length: Math.min(10, totalPages) },
    (_, i) => i + 1,
  );
  console.log(category);
  return (
    <div className="flex flex-col gap-5 p-1 lg:p-5 overflow-y-auto items-center relative">
      <h1 className="text-xl md:text-5xl text-header-text dark:text-dark-text-main font-heading">
        Activation History
      </h1>
      <div className="w-fit absolute right-5">
        <div className="flex flex-col relative">
          <button
            className="flex gap-4 items-center bg-primary hover:bg-violet-500 transition px-2 py-1 rounded-md text-white font-body cursor-pointer"
            onClick={() => setOpenFilterModal((prev) => !prev)}
          >
            <CiFilter size={20} /> Filter
          </button>

          <div
            className={`${openFilterModal ? "flex" : "hidden"} flex-col gap-4 px-2 py-3 w-56 bg-white absolute top-7 right-18 rounded-md shadow-xl`}
          >
            {filterCategories?.map((cat) => (
              <div className="flex justify-between items-center px-2" key={cat}>
                <input
                  type="radio"
                  className="size-5 accent-purple-500 cursor-pointer"
                  value={cat}
                  onChange={(e) => setCategory(e.target.value)}
                  checked={cat == category}
                />
                <span className="font-body capitalize">
                  {cat == "" ? "All" : cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TransactionHistoryTable
        isLoading={isLoading}
        ClipLoader={ClipLoader}
        transactionHistory={transactionHistory}
        GoDotFill={GoDotFill}
      />
      <TransactionHistoryCard
        isLoading={isLoading}
        ClipLoader={ClipLoader}
        transactionHistory={transactionHistory}
        GoDotFill={GoDotFill}
      />
      <div className="flex gap-2 mt-2 justify-self-center">
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-primary hover:text-white font-body cursor-pointer disabled:cursor-not-allowed text-xs"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page <= 1}
        >
          <GrFormPrevious />
        </button>
        {pages.map((num) => (
          <button
            className={`hidden sm:block px-3 py-1 bg-gray-200 text-header-text rounded hover:bg-primary hover:text-white ${page == num ? "bg-primary text-white disabled:cursor-not-allowed" : ""} font-body cursor-pointer text-xs`}
            onClick={() => setPage(num)}
            key={num}
            disabled={page == num}
          >
            {num}
          </button>
        ))}
        {totalPages > 10 ? (
          <>
            <input
              type="number"
              placeholder="Page #"
              className={`w-16 px-3 py-1 bg-gray-200 text-header-text rounded hover:bg-primary hover:text-white font-body cursor-text text-xs focus:outline-none no-spinner`}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  setPage(e.target.value);
                }
              }}
            />
            <button
              className="px-2 py-1 bg-gray-200 rounded hover:bg-primary hover:text-white font-body cursor-pointer disabled:cursor-not-allowed text-xs"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              {totalPages}
            </button>
          </>
        ) : (
          ""
        )}
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-primary hover:text-white font-body cursor-pointer disabled:cursor-not-allowed text-xs"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
        >
          <MdNavigateNext />
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
