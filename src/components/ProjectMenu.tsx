import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { listenEvent, useEventBus } from "../main";
import { open } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";

import "../styles/App.scss";

export default function ProjectMenu() {
  const [visible, setVisible] = useState(true);
  const [projectDirectory, setProjectDirectory] = useState("./" as string);
  const events = useEventBus();

  useEffect(() => {
    desktopDir().then((path) => setProjectDirectory(path));
  }, []);

  listenEvent("dialog.project.new", () => {
    setVisible(true);
  });

  async function setProjectPath() {
    const selectedProjectDirectory = await open({
      directory: true,
      multiple: false,
      defaultPath: projectDirectory || (await desktopDir()),
      recursive:true,
    });

    console.log(selectedProjectDirectory);

    if (
      selectedProjectDirectory !== null &&
      !Array.isArray(selectedProjectDirectory)
    ) {
      setProjectDirectory(selectedProjectDirectory);
    }
  }

  function createProject() {
    events.emit("dialog.project.create");
    // TODO : PASS THE PROJECTDIRECTORYPATH
    setVisible(false);
    desktopDir().then((path) => setProjectDirectory(path));
  }

  return (
    <div id="ProjectMenu">
      <Dialog.Root open={visible} onOpenChange={setVisible}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">New Project</Dialog.Title>
            <Dialog.Description />
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="pojectName">
                Project Name
              </label>
              <input className="Input" id="pojectName" defaultValue="Lab X" />
            </fieldset>
            <fieldset className="Fieldset">
              <label className="Label" htmlFor="rootDirectoryPath">
                Root Directory
              </label>
              <button type="button" onClick={setProjectPath}>
                Select Project Root Directory
              </button>
              <p>{projectDirectory}</p>
            </fieldset>
            <button type="button" onClick={createProject}>Create Project</button>
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
