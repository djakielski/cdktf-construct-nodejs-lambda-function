import { cdktf } from "projen";
import { GitlabConfiguration } from "projen/lib/gitlab";
import { NodePackageManager, UpdateSnapshot } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const project = new cdktf.ConstructLibraryCdktf({
  author: "Dominik Jakielski",
  authorAddress: "git@jakielski.de",
  cdktfVersion: "^0.18.0",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.0.0",
  name: "cdktf-nodejs-function",
  projenrcTs: true,
  repositoryUrl:
    "https://gitlab.com/dj-cdktf-libraries/cdktf-nodejs-function.git",
  releaseToNpm: true,
  github: true,
  githubOptions: {
    workflows: true,
  },
  eslintOptions: {
    dirs: [],
    prettier: true,
  },
  pnpmVersion: "8",
  devDeps: ["esbuild@^0.19.2", "testcontainers"],
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
  },
  description: "construct library for nodejs lambda function",
  release: true,
  releaseTrigger: ReleaseTrigger.continuous(),
  packageManager: NodePackageManager.PNPM,
});
project.addPeerDeps("@cdktf/provider-aws@12.x");
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
