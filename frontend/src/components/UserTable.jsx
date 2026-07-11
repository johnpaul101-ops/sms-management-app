const UserTable = ({
  isLoading,
  ClipLoader,
  GoDotFill,
  users,
  handleDeleteUser,
  handleMakeUserAdmin,
}) => {
  return (
    <div className="w-full max-w-7xl text-sm hidden md:min-[852px]:block">
      <div className="grid grid-cols-[2fr_2fr_2fr_2fr] bg-purple-200 px-4 py-2 rounded-t-md">
        <span className="font-body">Name</span>
        <span className="font-body">Email/Username</span>
        <span className="font-body text-center">Status</span>
        <span className="font-body text-center">Action</span>
      </div>

      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <ClipLoader size={100} color="#a78bfa" />
        </div>
      ) : (
        users.map((user) => (
          <div
            className="grid grid-cols-[2fr_2fr_2fr_2fr] bg-purple-100 px-4 py-2 items-center"
            key={user._id}
          >
            <span className="font-body">
              {user.name} {user.isAdmin ? "(Admin)" : ""}
            </span>
            <span className="font-body">{user.email}</span>
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
            <div className="flex items-center gap-3 justify-center">
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
        ))
      )}
    </div>
  );
};

export default UserTable;
