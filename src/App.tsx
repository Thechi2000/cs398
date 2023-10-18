import { useState } from "react";
//import reactLogo from "./assets/react.svg";
import "./App.css";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";

function App() {
  const [centralComponent, setCentralComponent] = useState(<MenuScreen />);

  return (
    <div className="w-screen h-screen max-w-screen max-h-screen">
      <TaskBar setCentralComponent={setCentralComponent} />
      {centralComponent}
    </div>
  );
}

export default App;
