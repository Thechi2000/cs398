import { useState } from "react";
import CompilationOutcomeDisplay, {
  CompilationOutcome,
} from "./CompilationOutcomeDisplay";
import Waves, { VCDFile } from "./Waves";
import { listenEvent } from "../main";

export default function Output() {
  const [content, setContent] = useState(
    null as
      | null
      | {
          type: "compilation";
          outcome: CompilationOutcome;
        }
      | {
          type: "simulation";
          waves: VCDFile;
        }
  );

  listenEvent("output.compilation", (outcome) =>
    setContent({ type: "compilation", outcome })
  );
  listenEvent("output.simulation", (vcd) =>
    setContent({ type: "simulation", waves: vcd })
  );

  return content ? (
    content.type == "compilation" ? (
      <CompilationOutcomeDisplay outcome={content.outcome} />
    ) : (
      <Waves vcd={content.waves} />
    )
  ) : (
    <></>
  );
}
