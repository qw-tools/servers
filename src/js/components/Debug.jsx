export const Debug = (props) => (
  <pre>{JSON.stringify(props.value, null, 2)}</pre>
);
