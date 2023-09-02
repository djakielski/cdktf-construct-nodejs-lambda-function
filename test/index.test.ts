import { TerraformStack, Testing } from "cdktf";
import { NodejsFunction } from "../src";
import "cdktf/lib/testing/adapters/jest";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

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

    it("planningTest", () => {
        const app = Testing.app();
        const stack = new TerraformStack(app, "test");
        new AwsProvider(stack, "aws", { region: "eu-central-1" });
        new NodejsFunction(stack, "function", {
            sourceCodePath: "test-resources/pnpm",
            functionName: "myNodeJsFunction",
            role: "myIamRole",
        });
        expect(Testing.fullSynth(stack)).toPlanSuccessfully();
    });
});