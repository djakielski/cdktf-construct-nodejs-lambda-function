import { cdktf } from 'projen';
const project = new cdktf.ConstructLibraryCdktf({
  author: 'Dominik Jakielski',
  authorAddress: 'd.jakielski@reply.de',
  cdktfVersion: '^0.13.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'tfcdk-nodejs-function',
  projenrcTs: true,
  repositoryUrl: 'https://gitlab.com/dj-tfcdk-libraries/tfcdk-nodejs-function.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();