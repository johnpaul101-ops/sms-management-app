const UserCard = ({
  isLoading,
  ClipLoader,
  GoDotFill,
  users,
  handleDeleteUser,
  handleMakeUserAdmin,
}) => {
  return (
    <>
      {isLoading ? (
        <div className="w-full h-96 flex md:min-[852px]:hidden items-center justify-center">
          <ClipLoader size={100} color="#a78bfa" />
        </div>
      ) : (
        <div className="flex md:min-[852px]:hidden flex-col w-full bg-purple-200 gap-4 rounded-md overflow-y-auto h-[80vh] [&::-webkit-scrollbar]:hidden">
          {users?.map((user) => (
            <div className="flex flex-col gap-3 p-3 border-b border-gray-400">
              <div className="flex items-center justify-between">
                <span className="font-body">
                  {user.name} {user.isAdmin ? "(Admin)" : ""}
                </span>
                <div className="flex items-center justify-center">
                  <div
                    className={`flex gap-2 border-2 w-fit px-2 py-1 rounded-md ${user.isOnline ? "border-green-400" : "border-gray-600"} items-center`}
                  >
                    <GoDotFill
                      className={`size-5 ${user.isOnline ? "text-green-400" : "text-gray-500"}`}
                    />
                    <span className={`font-body text-center text-sm`}>
                      {user?.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <span className="font-body hidden sm:block">{user.email}</span>
              <div className="hidden sm:flex items-center gap-3">
                <button
                  className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-2 py-1 text-white rounded-md cursor-pointer"
                  onClick={() => handleMakeUserAdmin(user._id)}
                  disabled={isLoading}
                >
                  Make Admin
                </button>
                <button
                  className="bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow px-2 py-1 text-white rounded-md cursor-pointer"
                  onClick={() => handleDeleteUser(user._id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UserCard;
