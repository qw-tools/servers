import React from "react";

export const Flag = (props) => (
  <img
    src={`https://www.quakeworld.nu/images/flags/${props.cc.toLowerCase()}.gif`}
    width={16}
    height={11}
  />
);

export const Debug = (props) => (
  <pre>{JSON.stringify(props.value, null, 2)}</pre>
);
