import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventBus } from "../main";

export default function TaskBar() {
  const events = useEventBus();

  return (
    <div className="flex p-2 gap-4 bg-slate-400 select-none h-[4%] items-center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>New Project</DropdownMenu.Item>
            <DropdownMenu.Item>New Verilog File</DropdownMenu.Item>
            <DropdownMenu.Item>New Testbench</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Open Project</DropdownMenu.Item>
            <DropdownMenu.Item>Open File</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Save</DropdownMenu.Item>
            <DropdownMenu.Item>Save As ...</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Close Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={() => {
                invoke("compile")
                  .then((v) => events.emit("output.compilation", v))
                  .catch((e) => console.error(e));
              }}
            >
              Compile
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => {
                invoke("simulate")
                  .then((v) => events.emit("output.simulation", v))
                  .catch((e) => console.error(e));
              }}
            >
              Run
            </DropdownMenu.Item>
            <DropdownMenu.Item>New Testbench</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Open Project</DropdownMenu.Item>
            <DropdownMenu.Item>Open File</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Save</DropdownMenu.Item>
            <DropdownMenu.Item>Save As ...</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Close Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Test</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Test</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Test</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <p>File</p>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Item>Test</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Test</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
