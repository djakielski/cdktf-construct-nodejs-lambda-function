import { Testing } from "cdktf";
import {NodejsFunction} from "../src";
import "cdktf/lib/testing/adapters/jest";

expect.addSnapshotSerializer({
    test: (val) => typeof val === 'string',
    print: (val) =>
        `"${(val as string)
            // eslint-disable-next-line no-useless-escape
            .replace(/\"/g, '\\"')
            .replace(/([A-Fa-f0-9]{32})\.(json|zip)/, '[FILENAME REMOVED]')
            .replace(
                /container-assets-\${AWS::AccountId}-\${AWS::Region}:([A-Fa-f0-9]{64})/,
                'container-assets-${AWS::AccountId}-${AWS::Region}:[HASH REMOVED]',
            )
            .replace(
                /lambda-asset_([A-Za-z0-9]{8})\/([A-Za-z0-9]{32})/,
                'lambda-asset_[HASH REMOVED]/[HASH REMOVED]',
            ).replace(
                /([A-Fa-f0-9]{32})/,
                '[HASH REMOVED]',
            )}"`,
});


describe("Test NodejsFunction", () => {
    it("snapshotTest", () => {
        expect(
            Testing.synthScope((scope) => {
                new NodejsFunction(scope, "function", {
                    sourceCodePath: "test-resources/index.ts",
                    functionName: "myNodeJsFunction",
                    role: "myIamRole"
                });
            })
        ).toMatchSnapshot()
    });
});