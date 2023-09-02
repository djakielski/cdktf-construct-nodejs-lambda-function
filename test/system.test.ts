// eslint-disable-next-line import/order
import { NodejsFunction } from "../src";
import "cdktf/lib/testing/adapters/jest";
import { execSync } from "child_process";
import * as path from "path";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { App, TerraformStack } from "cdktf";
import { Construct } from "constructs";
// eslint-disable-next-line import/no-extraneous-dependencies
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BindMount } from "testcontainers/build/types";

const dockerSock: BindMount = {
  mode: "rw",
  source: "/var/run/docker.sock",
  target: "/var/run/docker.sock",
};
describe("NodejsFunction", () => {
  jest.setTimeout(160000);
  const localstackContainer = getLocalstackContainer();
  let localstack: StartedTestContainer;

  beforeAll(async () => {
    localstack = await localstackContainer.start();
  });

  it("systemTest", () => {
    const app = new App();
    const stack = awsTerraformStack(app);

    new NodejsFunction(stack, "function", {
      sourceCodePath: "test-resources/pnpm",
      functionName: "myNodeJsFunction",
      role: "myIamRole",
    });

    terraformApply(app, stack);
  });

  afterAll(async () => {
    await localstack.stop();
  });

  function getLocalstackContainer() {
    return new GenericContainer("localstack/localstack")
      .withExposedPorts(4566)
      .withWaitStrategy(Wait.forLogMessage("Ready", 1))
      .withStartupTimeout(120_000)
      .withEnvironment({ LOCALSTACK_HOST: "localhost" })
      .withBindMounts([dockerSock]);
  }
  function awsTerraformStack(scope: Construct): TerraformStack {
    const stack = new TerraformStack(scope, "test");
    const localstackUrl =
      "https://" +
      localstack.getHost() +
      ":" +
      localstack.getFirstMappedPort().toString();
    new AwsProvider(stack, "aws", {
      region: "eu-central-1",
      endpoints: [
        {
          lambda: localstackUrl,
          iam: localstackUrl,
          sts: localstackUrl,
          cloudwatch: localstackUrl,
          s3: localstackUrl,
        },
      ],
      accessKey: "accesskey",
      secretKey: "secretkey",
      insecure: true,
    });
    return stack;
  }

  function terraformApply(app: App, stack: TerraformStack) {
    app.synth();
    const cwd = path.join(app.outdir, "stacks", stack.toString());
    const e1 = execSync("terraform init", { cwd: cwd });
    expect(e1.toString()).not.toContain("Error");
    const e3 = execSync("terraform apply --auto-approve", { cwd: cwd });
    expect(e3.toString()).not.toContain("Error");
  }
});
