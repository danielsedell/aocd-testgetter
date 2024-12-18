import type {
  Answer,
  AocdSource,
  Config,
  MaybeAnswer,
  Options,
  PartResult,
  Solver,
} from "./_common.ts";

const defaultOptions: Options = {
  time: false,
  submit: false,
  concurrency: false,
  printResults: true,
  resultsInOrder: true,
};

export class Aocd {
  readonly source: AocdSource;
  readonly #options: Options;
  #tasksComplete = Promise.resolve();

  constructor(
    config: Config,
  ) {
    this.#options = { ...defaultOptions, ...config.options };
    this.source = config.source;
  }

  async runPart(
    year: number,
    day: number,
    part: number,
    solver: Solver,
  ): Promise<PartResult> {
    const inputPromise = this.getInput(year, day);
    let runAndGetResultShower = async (): Promise<() => PartResult> => {
      const input = await inputPromise;

      let answer: MaybeAnswer;
      try {
        if (this.#options.time) {
          console.log(`part ${part} starting`);
          console.time(`part ${part}`);
        }
        answer = await solver(input);
      } finally {
        if (this.#options.time) {
          console.timeEnd(`part ${part}`);
        }
      }

      let correct: boolean | undefined;
      if (this.#options.submit && answer != null) {
        correct = await this.submit(year, day, part, answer);
      }

      return () => {
        if (this.#options.printResults) {
          if (answer == null) {
            console.log(
              `${year} Day ${day} Part ${part} finished executing with no answer returned.`,
            );
          } else {
            console.log(`${year} Day ${day} Part ${part}: ${answer}`);
          }
          if (correct != undefined) {
            console.log(
              `The answer has been submitted and it is ${
                correct ? "correct!" : "wrong."
              }`,
            );
          }
        }
        return { answer, correct };
      };
    };

    if (this.#options.concurrency && !this.#options.resultsInOrder) {
      const showResult = await runAndGetResultShower();
      return showResult();
    } else {
      if (this.#options.concurrency && this.#options.resultsInOrder) {
        const showResultPromise = runAndGetResultShower();
        runAndGetResultShower = () => showResultPromise;
      }
      const partPromise = this.#tasksComplete.then(
        async (): Promise<PartResult> => {
          const showResult = await runAndGetResultShower();
          return showResult();
        },
      );
      this.#tasksComplete = partPromise.then(() => {});
      return partPromise;
    }
  }

  getInput(year: number, day: number): Promise<string> {
    return this.source.getInput(year, day);
  }

  getTestData(year: number, day: number): Promise<string> {
    return this.source.getTestData(year, day);
  }

  submit(
    year: number,
    day: number,
    part: number,
    solution: Answer,
  ): Promise<boolean> {
    return this.source.submit(year, day, part, solution);
  }
}
