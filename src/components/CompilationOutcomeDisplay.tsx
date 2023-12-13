import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useEventBus } from "../main";

export type CompilationOutcome =
  | { status: "success" }
  | {
      status: "failure";
      errors: {
        [file: string]: {
          global: string[];
          lines: { [line: string]: string[] };
        };
      };
    };

export default function CompilationOutcomeDisplay({
  outcome,
}: {
  outcome: CompilationOutcome;
}) {
  const events = useEventBus();

  if (outcome.status === "success") {
    return (
      <div id="build-output-success">
        <h2>Success !</h2>
        <button onClick={() => events.emit("project.run")}>Run</button>
      </div>
    );
  } else {
    return (
      <div id="build-output-errors">
        <h3>Errors:</h3>
        {Object.entries(outcome.errors).map((f) => (
          <div
            className="file-errors"
            onDoubleClick={() => events.emit("editor.file.open", f[0])}
          >
            <p>{f[0]}:</p>
            <div>
              {f[1].global.map((g) => (
                <div>
                  <p>{g}</p>
                </div>
              ))}
              {Object.entries(f[1].lines).map((e) =>
                e[1].map((m) => (
                  <div>
                    <CrossCircledIcon />
                    <p>
                      {e[0]}: {m}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
