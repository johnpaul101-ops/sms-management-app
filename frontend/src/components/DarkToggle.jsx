const DarkToggle = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="w-14 h-8 flex items-center bg-gray-300 dark:bg-darkCard rounded-full p-1 transition cursor-pointer"
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
          darkMode ? "translate-x-6 bg-primary" : ""
        }`}
      >
        {darkMode ? "🌛" : "🌞"}
      </div>
    </button>
  );
};

export default DarkToggle;
