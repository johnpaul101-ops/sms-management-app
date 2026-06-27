import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <main className="bg-main-bg dark:bg-dark-bg-main h-screen p-5">
      <Navbar />
      <section className="flex items-center justify-center h-96">
        <h1 className="text-9xl text-header-text dark:text-dark-text-main font-heading">
          HELLO
        </h1>
      </section>
    </main>
  );
};

export default Dashboard;
