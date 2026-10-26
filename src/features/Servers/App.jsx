import { Servers } from "./Servers.jsx";
import "../../styles.css";

export const App = () => {
  return (
    <div className="flex flex-col h-[100vh]">
      <div className="grow min-h-0 bg-gray-150">
        <Servers />
      </div>
    </div>
  );
};

export default App;
