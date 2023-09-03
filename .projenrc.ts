import { cdktf } from "projen";
import { GitlabConfiguration } from "projen/lib/gitlab";
import {
  NodePackageManager,
  UpdateSnapshot,
  UpgradeDependenciesSchedule,
} from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const project = new cdktf.ConstructLibraryCdktf({
  name: "cdktf-nodejs-function",
  description: "construct library for nodejs lambda function",
  author: "Dominik Jakielski",
  authorAddress: "git@jakielski.de",
  cdktfVersion: "^0.18.0",
  defaultReleaseBranch: "main",
  jsiiVersion: "^5.0.21",
  projenrcTs: true,
  repositoryUrl:
    "https://gitlab.com/dj-cdktf-libraries/cdktf-nodejs-function.git",
  releaseToNpm: true,
  github: true,
  dependabot: true,
  minMajorVersion: 1,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["auto-approve", "automerge", "dependencies"],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  prettier: true,
  githubOptions: {
    workflows: true,
  },
  docgen: true,
  minNodeVersion: "18.0.0",
  deps: ["esbuild@^0.19.2"],
  devDeps: ["testcontainers"],
  peerDeps: ["@cdktf/provider-aws@^17.0.2"],
  bundledDeps: ["esbuild@^0.19.2"],
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
  },
  release: true,
  releaseTrigger: ReleaseTrigger.continuous(),
  packageManager: NodePackageManager.PNPM,
  keywords: ["ckd", "aws", "lambda", "nodejs", "constructs"],
});

new GitlabConfiguration(project, {
  stages: ["test", "release"],
  default: {
    image: {
      name: "node:19-alpine",
    },
  },
  jobs: {
    test: {
      script: ["pnpm install", "pnpm test"],
      stage: "test",
    },
    release: {
      script: ["pnpm install", "pnpm run release"],
      stage: "release",
      only: ["tags"],
    },
  },
});
project.synth();
