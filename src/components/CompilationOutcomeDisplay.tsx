export type CompilationOutcome =
  | { sucess: string }
  | {
      failure: {
        [file: string]: {
          global: string[];
          lines: { [line: string]: string };
        };
      };
    };

export default function CompilationOutcomeDisplay({
  outcome,
}: {
  outcome: CompilationOutcome;
}) {
  return <p>{JSON.stringify(outcome)}</p>;
}
