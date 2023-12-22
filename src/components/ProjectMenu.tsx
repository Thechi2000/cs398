import { useEffect, useState } from "react";
import { useEventBus } from "../main";
import { open } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";

import "../styles/App.scss";

export default function ProjectMenu(props: {
  setVisible?: (visible: boolean) => void;
  closeable?: boolean;
}) {
  const [projectDirectory, setProjectDirectory] = useState("./");
  const events = useEventBus();

  useEffect(() => {
    desktopDir().then((path) => setProjectDirectory(path));
  }, []);

  async function chooseProjectPath() {
    const selectedProjectDirectory = await open({
      directory: true,
      multiple: false,
      defaultPath: projectDirectory || (await desktopDir()),
      recursive: true,
    });

    if (
      selectedProjectDirectory !== null &&
      !Array.isArray(selectedProjectDirectory)
    ) {
      setProjectDirectory(selectedProjectDirectory);
    }
  }

  function createProject() {
    events.emit("project.open", projectDirectory);
    if (props.setVisible) {
      props.setVisible(false);
    }
  }

  return (
    <div id="project-menu">
      <h3>Open/Create project</h3>
      <div>
        <p>Project directory:</p>
        <p>{projectDirectory}</p>
        <button onClick={chooseProjectPath}>Select project directory</button>
      </div>
      <div>
        <button onClick={createProject}>Open/Create project</button>
        {props.closeable ? (
          <button
            onClick={(_) => {
              if (props.setVisible) {
                props.setVisible(false);
              }
            }}
          >
            Cancel
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
