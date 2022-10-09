import React from "react";

type ToggleProps = {
  isToggled: boolean;
  setToggled: CallableFunction;
  label: string;
};

const Toggle: React.FC<ToggleProps> = ({ isToggled, setToggled, label }) => {
  return (
    <div>
      <label
        htmlFor="toggle"
        className="inline-flex relative items-center cursor-pointer"
      >
        <input
          type={"checkbox"}
          value=""
          id="toggle"
          className="sr-only peer"
          checked={isToggled}
          onChange={() => {
            setToggled(!isToggled);
          }}
        />
        <div className="w-14 h-7 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ml-3">{label}</span>
      </label>
    </div>
  );
};

export default Toggle;
