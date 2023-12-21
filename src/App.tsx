import * as Dialog from "@radix-ui/react-dialog";
//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";
import { listenEvent, useEventBus } from "./main";
import ProjectMenu from "./components/ProjectMenu";
import { useState } from "react";

function App() {
  const events = useEventBus();
  const [projectModalWindowVisible, setProjectModalWindowVisible] =
    useState(false);
  const [hasProject, setHasProject] = useState(false);

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
  listenEvent("project.open", (projectDirectoryPath) => {
    invoke("set_project_state", { projectPath: projectDirectoryPath });
    setHasProject(true);
  });
  listenEvent("dialog.project.open", () => {
    setProjectModalWindowVisible(true);
  });

  if (hasProject) {
    return (
      <div id="root">
        <TaskBar />
        <MenuScreen />

        <Dialog.Root
          open={projectModalWindowVisible}
          onOpenChange={setProjectModalWindowVisible}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <ProjectMenu
                setVisible={setProjectModalWindowVisible}
                closeable
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  } else {
    return (
      <div id="root">
        <ProjectMenu />
      </div>
    );
  }
}

export default App;
