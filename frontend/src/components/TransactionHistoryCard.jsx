const TransactionHistoryCard = ({
  isLoading,
  ClipLoader,
  transactionHistory,
  GoDotFill,
}) => {
  return (
    <>
      {isLoading ? (
        <div className="w-full h-96 flex md:min-[852px]:hidden items-center justify-center">
          <ClipLoader size={100} color="#a78bfa" />
        </div>
      ) : (
        <div className="flex md:min-[852px]:hidden flex-col w-full bg-purple-200 gap-4 rounded-md overflow-y-auto h-[80vh] [&::-webkit-scrollbar]:hidden">
          {transactionHistory?.map(
            ({
              _id,
              provider,
              userName,
              country,
              service,
              phoneNumber,
              price,
              timeStamp,
              status,
            }) => (
              <div
                className="flex flex-col gap-2 p-3 border-b border-gray-400"
                key={_id}
              >
                <div className="flex gap-3 items-center justify-between">
                  <div
                    className={`flex items-center justify-center gap-2 border ${status == "success" ? "border-green-500" : status == "pending" ? "border-yellow-500" : "border-red-500"} px-2 py-1 w-fit rounded-md`}
                  >
                    <GoDotFill
                      className={`${status == "success" ? "text-green-500" : status == "pending" ? "text-yellow-300" : "text-red-500"}`}
                    />
                    <span className="font-body capitalize">{status}</span>
                  </div>
                  <span className="font-body font-bold">{timeStamp}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-body">{userName}</span>
                  <GoDotFill />
                  <span className="font-body">{provider}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body">{country}</span>
                  <span>-</span>
                  <span className="font-body">{service}</span>
                </div>
                <span className="font-body">{phoneNumber}</span>
                <span className="font-body font-bold">${price}</span>
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
};

export default TransactionHistoryCard;
