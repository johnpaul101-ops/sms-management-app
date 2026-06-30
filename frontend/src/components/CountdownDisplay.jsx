import { useState, useEffect } from "react";

const CountdownDisplay = ({ initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [prevInitialSeconds, setPrevInitialSeconds] = useState(initialSeconds);

  if (initialSeconds !== prevInitialSeconds) {
    setSeconds(initialSeconds);
    setPrevInitialSeconds(initialSeconds);
  }

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono font-bold text-sm">
      {hours > 0
        ? `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        : `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`}
    </span>
  );
};

export default CountdownDisplay;
