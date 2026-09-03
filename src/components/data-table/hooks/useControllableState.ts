import { useState } from "react";

interface Options<T> {
  controlled?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}

export function useControllableState<T>(
  options: Options<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const { controlled, defaultValue, onChange } = options;

  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);

  const value = isControlled ? (controlled as T) : uncontrolled;

  function setValue(next: T | ((prev: T) => T)) {
    const resolved =
      typeof next === "function" ? (next as (prev: T) => T)(value) : next;

    if (!isControlled) setUncontrolled(resolved);
    onChange?.(resolved);
  }

  return [value, setValue];
}
