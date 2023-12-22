import * as Dialog from "@radix-ui/react-dialog";
//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api";
import MenuScreen from "./components/MenuScreen";
import TaskBar from "./components/TaskBar";
import { listenEvent, useEventBus } from "./main";
import ProjectMenu from "./components/ProjectMenu";
import { useState } from "react";
import { FileCreator, FileType } from "./components/FileDialog";

type DialogType = "project" | "file";

function App() {
  const events = useEventBus();
  const [hasProject, setHasProject] = useState(false);
  const [fileCreationType, setFileCreationType] = useState(FileType.None);
  const [currentDialog, setCurrentDialog] = useState(null as null | DialogType);
  const setOpen = (dialogType: DialogType) => (visible: boolean) =>
    setCurrentDialog(visible ? dialogType : null);

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
    setCurrentDialog("project");
  });

  listenEvent("dialog.create-file.verilog", () => {
    setCurrentDialog("file");
    setFileCreationType(FileType.VerilogCodeFile);
  });
  listenEvent("dialog.create-file.testbench", () => {
    setCurrentDialog("file");
    setFileCreationType(FileType.TestBenchFile);
  });

  if (hasProject) {
    return (
      <div id="root">
        <TaskBar />
        <MenuScreen />

        <Dialog.Root
          open={currentDialog === "project"}
          onOpenChange={setOpen("project")}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <ProjectMenu setVisible={setOpen("project")} closeable />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root
          open={currentDialog === "file"}
          onOpenChange={setOpen("file")}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <FileCreator
                fileType={fileCreationType}
                setOpen={setOpen("file")}
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
