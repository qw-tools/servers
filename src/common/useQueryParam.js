import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "servers.";

// arrays are stored as comma separated values, e.g. ?types=qtv,proxy
const parse = (raw, defaultValue) =>
  Array.isArray(defaultValue) ? raw.split(",").filter(Boolean) : raw;

const serialize = (value) => (Array.isArray(value) ? value.join(",") : value);

// any value is allowed when no allowed values are given (e.g. free text)
const isAllowed = (value, allowedValues) =>
  !allowedValues || [value].flat().every((v) => allowedValues.includes(v));

const readStorage = (name) => {
  try {
    return localStorage.getItem(STORAGE_PREFIX + name);
  } catch {
    return null; // e.g. storage disabled
  }
};

const writeStorage = (name, value) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + name, value);
  } catch {}
};

// state kept in a url query param (e.g. ?view=cards) and remembered in local storage,
// the url param (a link) takes precedence over the remembered value,
// unknown values fall back to the default
export const useQueryParam = (name, defaultValue, allowedValues) => {
  const [value, setValue] = useState(() => {
    const sources = [
      new URLSearchParams(window.location.search).get(name),
      readStorage(name),
    ];

    for (const raw of sources) {
      if (raw !== null) {
        const parsed = parse(raw, defaultValue);

        if (isAllowed(parsed, allowedValues)) {
          return parsed;
        }
      }
    }

    return defaultValue;
  });

  // keep the url in sync, so the current settings can be shared as a link
  useEffect(() => {
    const url = new URL(window.location.href);
    const serialized = serialize(value);

    if (serialized === serialize(defaultValue)) {
      url.searchParams.delete(name);
    } else {
      url.searchParams.set(name, serialized);
    }

    window.history.replaceState(null, "", url);
  }, [name, value, defaultValue]);

  // stable, so it can be used in effect dependencies
  const setQueryParam = useCallback(
    (newValue) => {
      writeStorage(name, serialize(newValue));
      setValue(newValue);
    },
    [name],
  );

  return [value, setQueryParam];
};
