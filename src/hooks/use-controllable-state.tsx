import { useCallback, useEffectEvent, useState } from "react";

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);

  const currentValue = isControlled ? (value as T) : uncontrolledValue;

  const onChangeEvent = useEffectEvent((newValue: T) => {
    onChange?.(newValue);
  });

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChangeEvent(newValue);
    },
    [isControlled],
  );

  return [currentValue, setValue] as const;
}
