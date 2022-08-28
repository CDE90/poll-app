import React from "react";

type ButtonProps = {
  callback?: CallableFunction;
  displayText: string;
  styles?: string;
  type?: "button" | "submit" | "reset";
};

const Button: React.FC<ButtonProps> = ({
  callback,
  displayText,
  styles,
  type,
}) => {
  const baseStyle =
    "p-2 rounded-md border-2 border-zinc-800 focus:outline-none hover:bg-zinc-800 hover:transition-all ";
  return (
    <button
      onClick={(event) => {
        event.preventDefault();

        if (callback) {
          callback();
        }
      }}
      className={styles ? baseStyle + styles : baseStyle}
      type={type}
    >
      {displayText}
    </button>
  );
};

export default Button;
