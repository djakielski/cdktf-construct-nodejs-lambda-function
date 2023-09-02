import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { LambdaFunction, LambdaFunctionConfig } from '@cdktf/provider-aws/lib/lambda-function';
import { Construct } from 'constructs';
import { NodejsFunctionAsset } from './NodejsFunctionAsset';

export interface NodejsFunctionProps {
  readonly path: string;
}

export interface NodeJsLambdaFunctionConfig extends LambdaFunctionConfig {
  readonly sourceCodePath: string;
  readonly nodeVersion?: string; //See identifier on https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
}

export class NodejsFunction extends LambdaFunction {
  constructor(scope: Construct, id: string, props: NodeJsLambdaFunctionConfig) {
    super(scope, id, props);
    this.handler = 'index.handler';
    this.runtime = props.nodeVersion ?? 'nodejs18.x';
    this.lifecycle = {
      ignoreChanges: ['source_code_hash'],
    };

    const code = new NodejsFunctionAsset(this, id+'-code', { path: props.sourceCodePath });
    this.filename = code.asset.path;
    this.sourceCodeHash = code.asset.assetHash;
    this.role = new IamRole(scope, id+'-role', {
      assumeRolePolicy: new DataAwsIamPolicyDocument(scope, id+'-rolePolicy', {
        statement: [
          {
            sid: 'allowAssume',
            actions: ['sts:AssumeRole'],
            effect: 'Allow',
            principals: [{ type: 'AWS', identifiers: ['lambda.amazonaws.com'] }],
          },
        ],
      }).json,
      name: props.role,
    }).arn;
  }
}