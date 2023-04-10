import {cdktf, gitlab} from 'projen';
import {NodePackageManager, UpdateSnapshot} from "projen/lib/javascript";
import {ReleaseTrigger} from "projen/lib/release";

const project = new cdktf.ConstructLibraryCdktf({
  author: 'Dominik Jakielski',
  authorAddress: 'dominik@jakielski.de',
  cdktfVersion: '^0.15.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'cdktf-nodejs-function',
  projenrcTs: true,
  repositoryUrl: 'https://gitlab.com/dj-cdktf-libraries/cdktf-nodejs-function.git',
  releaseToNpm: true,
  github: false,
  deps: ["esbuild@^0.17.5"],
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER
  },
  description: "construct library for nodejs lambda function",
  release: true,
  releaseTrigger: ReleaseTrigger.continuous(),
  packageManager: NodePackageManager.PNPM,
});
project.addPeerDeps(
    "@cdktf/provider-aws@12.x"
);
new gitlab.GitlabConfiguration(project, {
  stages: ["test", "release"],
  default: {
    image: {
      name:"node:19-alpine"
    }
  },
  jobs: {
    test: {
      script: ["pnpm install","pnpm test"],
      stage: "test"
    },
    release: {
      script: ["pnpm install","pnpm run release"],
      stage: "release",
      only: ["tags"]
    }
  }
});
project.synth();