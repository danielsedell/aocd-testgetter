import { assert, assertEquals } from "@std/assert";
import sinon from "npm:sinon@^16";
import { Aocd, type AocdSource } from "./mod.ts";

class TestAocdSource implements AocdSource {
  getInput = sinon.spy((year: number, day: number) =>
    Promise.resolve(JSON.stringify({ year, day }))
  );

  getTestData = (_year: number, _day: number): Promise<string> => {
    throw new Error("Method not implemented.");
  };

  submit = sinon.spy(
    (
      _year: number,
      _day: number,
      _part: number,
      _solution: number,
    ): Promise<boolean> => {
      throw new Error("Method not implemented.");
    },
  );
}

Deno.test("Aocd.runPart", async () => {
  const source = new TestAocdSource();
  const aocd = new Aocd({
    options: { printResults: false },
    source,
  });

  const part1 = sinon.spy((input: string): number => {
    assertEquals(JSON.parse(input), { year: 2021, day: 7 });
    return 42;
  });

  const result = await aocd.runPart(2021, 7, 1, part1);
  assertEquals(result.answer, 42);
  assert(source.getInput.calledOnce);
  assert(part1.calledOnce);
});
