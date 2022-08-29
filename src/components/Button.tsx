import React from "react";

type ButtonProps = {
  callback?: CallableFunction;
  displayText: string;
  styles?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  callback,
  displayText,
  styles,
  type,
  disabled,
}) => {
  const baseStyle =
    "p-2 rounded-md border-2 border-zinc-800 focus:outline-none focus:border-blue-700 hover:bg-zinc-800 hover:transition-all ";
  return (
    <button
      onClick={() => {
        if (callback) {
          callback();
        }
      }}
      className={styles ? baseStyle + styles : baseStyle}
      type={type}
      disabled={disabled ?? false}
    >
      {displayText}
    </button>
  );
};

export default Button;
