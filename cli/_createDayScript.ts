import { dayScript } from "./_templates.ts";
import { writeNewFile } from "./_writeNewFile.ts";
import { DefaultAocdSource } from "../DefaultAocdSource.ts";

const defaultAocdSource = new DefaultAocdSource();

export async function createDayScript(year: number, day: number) {
  const newFileName = `day_${day}.ts`;
  const testData = await defaultAocdSource.getTestData(year, day);
  await writeNewFile(newFileName, dayScript(year, day, testData));
  console.log(`Created ${newFileName}`);
}
