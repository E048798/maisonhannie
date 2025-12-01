import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={
        [
          "w-full border px-3 py-2 rounded-md outline-none",
          "border-black/20 focus:border-black/40",
          className || "",
        ].join(" ")
      }
    />
  );
}