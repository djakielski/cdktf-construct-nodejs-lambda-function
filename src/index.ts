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
        minify: true,
        target: "es2020",
        bundle: true,
        format: "cjs",
        sourcemap: "linked",
        outdir: "dist",
        absWorkingDir: workingDirectory,
    });

    return path.join(workingDirectory, "dist");
};

export class NodejsFunctionAsset extends Construct {
    public readonly asset: TerraformAsset;
    public readonly bundledPath: string;

    constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
        super(scope, id);

        const workingDirectory = path.resolve(path.dirname(props.path));
        console.log(workingDirectory)
        const distPath = bundle(workingDirectory, path.basename(props.path));

        this.bundledPath = path.join(
            distPath,
            `${path.basename(props.path, ".ts")}.ts`
        );

        this.asset = new TerraformAsset(this, "lambda-asset", {
            path: distPath,
            type: AssetType.ARCHIVE,
        });
    }
}

export interface NodeJsLambdaFunctionConfig extends LambdaFunctionConfig {
    readonly sourceCodePath: string;
    readonly nodeVersion?: string; //See identifier on https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
}

export class NodejsFunction extends LambdaFunction {
    constructor(scope: Construct, id: string, props: NodeJsLambdaFunctionConfig) {
        super(scope, id, props);
        this.handler = "index.handler"
        this.runtime =  props.nodeVersion ?? "nodejs18.x"
        this.lifecycle = {
            ignoreChanges: ["source_code_hash"]
        }

        const code = new NodejsFunctionAsset(this, id+"-code", {path: props.sourceCodePath})
        this.filename = code.asset.path
        this.sourceCodeHash = code.asset.assetHash
    }
}