//import reactLogo from "./assets/react.svg";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";

function App() {
  return (
    <div className="w-screen h-screen max-w-screen max-h-screen">
      <TaskBar />
      <MenuScreen />
    </div>
  );
}

export default App;
