import * as React from "react";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={[
        "w-full border px-3 py-2 rounded-md outline-none",
        "border-black/20 focus:border-black/40",
        className || "",
      ].join(" ")}
    />
  );
}