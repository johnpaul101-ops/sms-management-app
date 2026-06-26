import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestContext from "../contexts/RequestContext";
import { toast } from "react-toastify";
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { baseUrl } = useContext(RequestContext);

  let navigate = useNavigate();

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

        navigate("/login");
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
    <main className="bg-main-bg h-screen flex items-center justify-center">
      <form
        className="flex flex-col p-4 gap-5 w-lg  bg-surface border border-border-color rounded-lg"
        onSubmit={handleCreateAccount}
      >
        <h1 className="text-header-text font-heading text-center text-2xl">
          Sign Up
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-secondary-text font-body">
            Name
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
          <label htmlFor="email" className="text-secondary-text font-body">
            Email
          </label>
          <input
            type="text"
            name="email"
            className="bg-surface-2 focus:outline-none rounded-md px-3 py-2"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-secondary-text font-body">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="bg-surface-2 focus:outline-none rounded-md px-3 py-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="border-none bg-primary hover:bg-violet-500 transition active:scale-95 shadow-sm hover:shadow rounded-md px-3 py-2 text-white font-body text-lg cursor-pointer"
          type="submit"
        >
          Create Account
        </button>

        <span className="font-body text-secondary-text text-center">
          Don't have an account?{" "}
          <Link className="text-[#8B5CF6]" to={"/login"}>
            Sign In
          </Link>
        </span>
      </form>
    </main>
  );
};

export default SignUp;
