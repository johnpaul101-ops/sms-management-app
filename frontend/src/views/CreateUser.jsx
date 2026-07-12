import { useContext, useState } from "react";
import RequestContext from "../contexts/RequestContext";
import { toast } from "react-toastify";
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { baseUrl } = useContext(RequestContext);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      return;
    }

    const signUpPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${baseUrl}/auth/sign-up`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          reject(
            new Error(data.message || `${response.status}: Failed to sign up`),
          );

          return;
        }

        setName("");
        setEmail("");
        setPassword("");
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signUpPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data.message || "Successfully Created Account";
        },
      },
      error: {
        render({ data }) {
          return data.message || "Something went wrong";
        },
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-full">
      <form
        className="flex flex-col p-4 gap-5 w-lg  bg-surface border border-border-color rounded-lg"
        onSubmit={handleCreateAccount}
      >
        <h1 className="text-header-text font-heading text-center text-2xl">
          Create User
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-secondary-text font-body">
            Display Name
          </label>
          <input
            type="text"
            name="name"
            className="bg-surface-2 focus:outline-none rounded-md px-3 py-2"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-secondary-text font-body">
            Username
          </label>
          <input
            type="text"
            name="username"
            className="bg-surface-2 focus:outline-none rounded-md px-3 py-2"
            placeholder="Enter your username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-secondary-text font-body">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="bg-surface-2 focus:outline-none rounded-md px-3 py-2 w-full"
              placeholder="Enter user password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute top-3 right-5 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>
        </div>

        <button
          className="border-none bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow rounded-md px-3 py-2 text-white font-body text-lg cursor-pointer"
          type="submit"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
