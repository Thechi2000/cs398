import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEventBus } from "../main";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api";

export default function TaskBar() {
  const events = useEventBus();

  return (
    <div id="taskbar">
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item
              onClick={() => events.emit("dialog.project.open")}
            >
              Open/Create Project
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => events.emit("dialog.create-file.verilog")}
            >
              New Verilog File
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => events.emit("dialog.create-file.testbench")}
            >
              New Testbench
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() =>
                invoke("get_project_state")
                  .then((p: any) =>
                    open({ defaultPath: p.projectDirectory }).then((v) =>
                      events.emit("editor.file.open", v)
                    )
                  )
                  .catch((e) => console.error(e))
              }
            >
              Open File
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() => events.emit("editor.file.saveas")}
            >
              Save As ...
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={() => window.close()}>
              Close Window
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <p>Simulation</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownContent">
            <DropdownMenu.Item onClick={() => events.emit("project.build")}>
              Build
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => events.emit("project.run")}>
              Run
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() => {
                events.emit("project.build");
                events.emit("project.run");
              }}
            >
              Build and Run
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
