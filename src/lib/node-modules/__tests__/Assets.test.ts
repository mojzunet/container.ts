import * as path from "path";
import { Container, Environment } from "../../../container";
import { Assets, AssetsError } from "../Assets";

describe("Assets", () => {

  const ENVIRONMENT = new Environment()
    .set(Assets.ENV.PATH, path.resolve(__dirname, "assets"));

  const CONTAINER = new Container("Test", ENVIRONMENT)
    .registerModule(Assets.NAME, Assets);

  const ASSETS = CONTAINER.resolve<Assets>(Assets.NAME);

  beforeAll(async () => {
    await CONTAINER.up().toPromise();
  });

  afterAll(async () => {
    await CONTAINER.down().toPromise();
  });

  it("#Assets", () => {
    expect(ASSETS).toBeDefined();
    expect(ASSETS.name).toEqual(Assets.NAME);
  });

  it("#readFile without encoding", async () => {
    const data = await ASSETS.readFile("test.txt").toPromise();
    expect(data instanceof Buffer).toEqual(true);
  });

  it("#readFile with encoding", async () => {
    const text = await ASSETS.readFile("test.txt", { encoding: "utf8" }).toPromise();
    expect(typeof text === "string").toEqual(true);
  });

  it("#readJson", async () => {
    const json = await ASSETS.readJson("test.json").toPromise();
    expect(typeof json === "object").toEqual(true);
  });

  it("#readJson parse error", async () => {
    try {
      await ASSETS.readJson("invalid.json").toPromise();
      fail();
    } catch (error) {
      expect(error instanceof AssetsError).toEqual(true);
      expect(error.name).toEqual(Assets.ERROR.JSON_PARSE);
    }
  });

  it("#readJson does not exist", async () => {
    try {
      await ASSETS.readJson("doesnotexist.json").toPromise();
      fail();
    } catch (error) {
      expect(error instanceof AssetsError).toEqual(true);
      expect(error.name).toEqual(Assets.ERROR.READ_FILE);
    }
  });

});
