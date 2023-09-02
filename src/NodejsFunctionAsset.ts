import * as fs from "fs";
import * as path from "path";
import { AssetType, TerraformAsset } from "cdktf";
import { Construct } from "constructs";
import { BuildOptions, buildSync } from "esbuild";
import { NodejsFunctionProps } from "./index";


export class NodejsFunctionAsset extends Construct {
  public readonly asset: TerraformAsset;
  public readonly bundledPath: string;

  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id);


    let workingDirectory: string;
    let distPath: string;
    let entryPoint: string;
    if (fs.lstatSync(props.path).isDirectory()) {
      workingDirectory = path.resolve(props.path);
      entryPoint = "index.ts";
    } else {
      workingDirectory = path.resolve(path.dirname(props.path));
      entryPoint = path.basename(props.path);
    }
    this.bundle(workingDirectory, entryPoint);
    distPath = path.join(workingDirectory, "dist");
    this.bundledPath = distPath;

    this.asset = new TerraformAsset(this, "lambda-asset", {
      path: distPath,
      type: AssetType.ARCHIVE,
    });
  }

  private bundle (workingDirectory: string, entryPoint: string) {
    const options = this.getBuildOptionsFromTsConfigOrDefault(workingDirectory, entryPoint);
    const c = buildSync(options);
    if (c.errors.length > 0) {throw new Error("Compiled with errors");}
    return path.join(workingDirectory, "dist");
  }

  private getBuildOptionsFromTsConfigOrDefault(workingDirectory: string, entryPoint: string) {
    let options: BuildOptions;
    const tsconfig = path.join(workingDirectory, "tsconfig.json");
    if (fs.existsSync(tsconfig)) {
      options = JSON.parse(fs.readFileSync(tsconfig).toString()).compilerOptions;
    } else {
      options = {
        platform: "node",
        minify: true,
        target: "es2020",
        bundle: true,
        format: "cjs",
        sourcemap: "linked",
        outdir: "dist",
      };
    }
    options.absWorkingDir = workingDirectory;
    options.entryPoints = [entryPoint];
    options.outdir = "dist";
    return options;
  }
}