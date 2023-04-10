import * as path from "path";
import {AssetType, TerraformAsset} from "cdktf";
import {Construct} from "constructs";
import {buildSync} from "esbuild";
import {LambdaFunction, LambdaFunctionConfig} from "@cdktf/provider-aws/lib/lambda-function";

export interface NodejsFunctionProps {
    readonly path: string;
}

const bundle = (workingDirectory: string, entryPoint: string) => {
    buildSync({
        entryPoints: [entryPoint],
        platform: "node",
        target: "es2018",
        bundle: true,
        format: "cjs",
        sourcemap: "external",
        outdir: "dist",
        absWorkingDir: workingDirectory,
    });

    return path.join(workingDirectory, "dist");
};

export class NodejsFunctionArtifact extends Construct {
    public readonly asset: TerraformAsset;
    public readonly bundledPath: string;

    constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
        super(scope, id);

        const workingDirectory = path.resolve(path.dirname(props.path));
        const distPath = bundle(workingDirectory, path.basename(props.path));

        this.bundledPath = path.join(
            distPath,
            `${path.basename(props.path, ".ts")}.js`
        );

        this.asset = new TerraformAsset(this, "lambda-asset", {
            path: distPath,
            type: AssetType.ARCHIVE,
        });
    }
}

export interface NodeJsLambdaFunctionConfig extends LambdaFunctionConfig {
    readonly sourceCodePath: string;
}

export class NodeJsFunction extends LambdaFunction {
    constructor(scope: Construct, id: string, props: NodeJsLambdaFunctionConfig) {
        super(scope, id, props);
        this.handler = "index.index"
        this.runtime = "nodejs18.x"
        this.lifecycle = {
            ignoreChanges: ["source_code_hash"]
        }

        const code = new NodejsFunctionArtifact(this, id+"-code", {path: props.sourceCodePath})
        this.filename = code.asset.path
        this.sourceCodeHash = code.asset.assetHash
    }
}