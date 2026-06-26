import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RequestContext from "../contexts/RequestContext.jsx";
const Login = ({ setUserData }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { baseUrl } = useContext(RequestContext);
  let navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    const signInPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          reject(
            new Error(data.message || `${response.status}: Failed to sign up`),
          );

          return;
        }

        resolve(data);
        setUserData(data);
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("userName", data.data.user.name);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/");
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(signInPromise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          return data.message || "Successfully logged in";
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
        onSubmit={handleSignIn}
      >
        <h1 className="text-header-text font-heading text-center text-2xl">
          Login
        </h1>

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
          Sign In
        </button>

        <span className="font-body text-secondary-text text-center">
          Don't have an account?{" "}
          <Link className="text-[#8B5CF6]" to={"/sign-up"}>
            Sign Up
          </Link>
        </span>
      </form>
    </main>
  );
};

export default Login;
