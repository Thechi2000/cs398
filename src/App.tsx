//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";
import { listenEvent, useEventBus } from "./main";
import ProjectMenu from "./components/ProjectMenu";

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
  listenEvent("dialog.project.create", (projectDirectoryPath) => {
    invoke("set_project_state", projectDirectoryPath)
    
  });


  return (
    <div id="root">
      <TaskBar />
      <MenuScreen />
      <ProjectMenu />
    </div>
  );
}

export default App;
