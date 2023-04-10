import {cdktf, gitlab} from 'projen';
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
   description: "construct library for nodejs lambda function",
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
      script: ["yarn install --frozen-lockfile","yarn test"],
      stage: "test"
    },
    release: {
      script: ["yarn install --frozen-lockfile","yarn run release"],
      stage: "release",
      only: ["tags"]
    }
  }
});
project.synth();