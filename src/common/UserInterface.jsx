import { useEffect, useState } from "react";

export const flagUrl = (cc) =>
  `https://flagcdn.com/h24/${cc.toLowerCase()}.webp`;

export const Flag = (props) => (
  <img
    src={flagUrl(props.cc)}
    className={"inline align-baseline"}
    height={12}
    style={{ height: 12, width: "auto" }}
    alt={props.cc}
    title={props.cc}
  />
);

// text that copies itself to the clipboard when clicked
export const CopyText = (props) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeout = setTimeout(() => setIsCopied(false), 1000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleClick = () =>
    navigator.clipboard.writeText(props.text).then(() => setIsCopied(true));

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
      className={`cursor-pointer rounded hover:bg-black/5 ${
        isCopied ? "text-green-600" : ""
      } ${props.className ?? ""}`}
    >
      {props.text}
    </button>
  );
};

// segmented control of radio buttons
export const ButtonGroup = (props) => (
  <div role="radiogroup" aria-label={props.label} className="join">
    {props.options.map(({ value, label }) => (
      <input
        key={value}
        type="radio"
        name={props.name}
        className={`join-item btn ${props.size ?? "btn-sm"}`}
        aria-label={label}
        value={value}
        checked={props.value === value}
        onChange={() => props.onChange(value)}
      />
    ))}
  </div>
);
