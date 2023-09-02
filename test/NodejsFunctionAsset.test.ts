import * as path from "path";
import { TerraformStack, Testing } from "cdktf";
import { NodejsFunctionAsset } from "../src/NodejsFunctionAsset";

describe("Test NodejsFunctionAsset", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");
  it("pnpm", () => {
    const asset = new NodejsFunctionAsset(stack, "test", {
      path: "test-resources/pnpm",
    });
    expect(asset.bundledPath).toBe(path.resolve("test-resources/pnpm/dist"));
  });
});