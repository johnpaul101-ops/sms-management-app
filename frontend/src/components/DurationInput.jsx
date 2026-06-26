const DurationInput = ({
  duration,
  value,
  setValue,
  price,
  isChecked,
  count,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center cursor-pointer">
        <input
          type="radio"
          className="size-7 accent-purple cursor-pointer"
          value={value}
          onChange={setValue}
          checked={isChecked}
        />
        <span className="text-lg font-body">{duration}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-body">from {price}</span>
        <span className="text-sm font-body">stock: {count}</span>
      </div>
    </div>
  );
};

export default DurationInput;
