//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";
import { listenEvent, useEventBus } from "./main";

function App() {
  const events = useEventBus();

  listenEvent("project.build", () => {
    invoke("compile")
      .then((v) => events.emit("output.compilation", v))
      .catch((e) => console.error(e));
  });
  listenEvent("project.run", () => {
    invoke("compile")
      .then((v: any) => {
        if (v.status === "success") {
          invoke("simulate").then((v) => events.emit("output.simulation", v));
        } else {
          events.emit("output.compilation", v);
        }
      })
      .catch((e) => console.error(e));
  });

  return (
    <div id="root">
      <TaskBar />
      <MenuScreen />
    </div>
  );
}

export default App;
