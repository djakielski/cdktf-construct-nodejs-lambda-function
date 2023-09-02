import { Testing } from "cdktf";
import { NodejsFunction } from "../src";
import "cdktf/lib/testing/adapters/jest";

describe("Test NodejsFunction", () => {
  it("snapshotTest", () => {
    expect(
      Testing.synthScope((scope) => {
        new NodejsFunction(scope, "function", {
          sourceCodePath: "test-resources/pnpm",
          functionName: "myNodeJsFunction",
          role: "myIamRole",
        });
      }),
    ).toMatchSnapshot();
  });
});
