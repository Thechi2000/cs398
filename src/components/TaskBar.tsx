import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function TaskBar() {
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
