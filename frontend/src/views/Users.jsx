import { useState, useEffect, useContext } from "react";
import RequestContext from "../contexts/RequestContext";
import { GoDotFill } from "react-icons/go";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import UserTable from "../components/UserTable";
import UserCard from "../components/UserCard";
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
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }
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

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleMakeUserAdmin = async (id) => {
    if (!confirm("Are you sure you want to make this user admin?")) {
      return;
    }
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

      <UserTable
        isLoading={isLoading}
        ClipLoader={ClipLoader}
        GoDotFill={GoDotFill}
        users={users}
        handleDeleteUser={handleDeleteUser}
        handleMakeUserAdmin={handleMakeUserAdmin}
      />
      <UserCard
        isLoading={isLoading}
        ClipLoader={ClipLoader}
        GoDotFill={GoDotFill}
        users={users}
        handleDeleteUser={handleDeleteUser}
        handleMakeUserAdmin={handleMakeUserAdmin}
      />
    </div>
  );
};

export default Users;
