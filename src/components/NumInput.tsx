import { useEffect, useState, type InputHTMLAttributes } from "react";
import { num } from "../lib/state";

const parse = (txt: string) => (txt.trim() === "" ? null : num(txt));

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | null | undefined;
  onValue: (v: number | null) => void;
}

/**
 * Numeric input that keeps what the person is typing ("7," or "7.") while the
 * stored value is a number. Text is only reset when the value changes from outside.
 */
export function NumInput({ value, onValue, ...rest }: Props) {
  const [txt, setTxt] = useState(value == null ? "" : String(value));

  useEffect(() => {
    setTxt((cur) => (parse(cur) === (value ?? null) ? cur : value == null ? "" : String(value)));
  }, [value]);

  return (
    <input
      {...rest}
      value={txt}
      onChange={(e) => {
        setTxt(e.target.value);
        onValue(parse(e.target.value));
      }}
    />
  );
}
