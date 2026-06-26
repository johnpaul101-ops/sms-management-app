import { Link } from "react-router-dom";

const GrizzlySms = () => {
  return (
    <main className="w-full flex items-center justify-center h-screen bg-main-bg">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-heading">
          This feature is not yet available.
        </h1>
        <Link
          to={"/"}
          className="bg-primary px-3 py-2 rounded-md font-body text-white"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
};

export default GrizzlySms;
