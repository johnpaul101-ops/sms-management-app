import { useState, useEffect, useContext } from "react";
import RequestContext from "../contexts/RequestContext";
import { GoDotFill } from "react-icons/go";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem("accessToken");
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(`${response.status}: ${errorData.message}`);
        }

        const data = await response.json();

        setUsers(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const deleteUser = async (id) => {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(`${response.status}: ${errorMessage.message}`);
      }

      alert("Are you sure you want to delete this user?");
      const data = await response.json();
      setUsers((prev) => prev.filter((user) => user._id !== id));

      setIsLoading(false);
      return data;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const deleteUserPromise = deleteUser(id);

    toast.promise(deleteUserPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data?.message || "Successfully Deleted User";
        },
      },
      error: {
        render({ data }) {
          return data?.message || "Something went wrong!";
        },
      },
    });
  };

  const makeUserAdmin = async (id) => {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/users/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(`${response.status}: ${errorMessage.message}`);
      }

      alert("Are you sure you want to make this user admin?");
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleMakeUserAdmin = async (id) => {
    const makeUserAdminPromise = makeUserAdmin(id);

    toast.promise(makeUserAdminPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data?.message || "Successfully Make User Admin";
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
    <div className="p-5 flex flex-col gap-5 items-center">
      <h1 className="text-5xl text-header-text dark:text-dark-text-main font-heading">
        Users
      </h1>

      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-[2fr_2fr_3fr_2fr_2fr] bg-purple-200 px-4 py-2 rounded-t-md">
          <span className="font-body">Name</span>
          <span className="font-body">Email</span>
          <span className="font-body text-center">Date Created</span>
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
              className="grid grid-cols-[2fr_2fr_3fr_2fr_2fr] bg-purple-100 px-4 py-2 items-center"
              key={user._id}
            >
              <span className="font-body">
                {user.name} {user.isAdmin ? "(Admin)" : ""}
              </span>
              <span className="font-body">{user.email}</span>
              <span className="font-body text-center">{user?.dateCreated}</span>
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
    </div>
  );
};

export default Users;
