import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CartServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartLambda = new NodejsFunction(this, 'cartLambda', {
      functionName: 'cartLambdaFn',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../dist/main.lambda.js'),
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: [
          '@aws-sdk/*',
          'aws-sdk',
          'class-transformer',
          'class-validator',
        ],
        target: 'node20',
        nodeModules: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/platform-express',
          'reflect-metadata',
        ],
      },
      environment: {
        DB_HOST: process.env.DB_HOST!,
        DB_PORT: process.env.DB_PORT!,
        DB_USERNAME: process.env.DB_USERNAME!,
        DB_PASSWORD: process.env.DB_PASSWORD!,
        DB_DATABASE: process.env.DB_DATABASE!,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const { url } = cartLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [
          lambda.HttpMethod.GET,
          lambda.HttpMethod.DELETE,
          lambda.HttpMethod.PUT,
        ],
        allowedHeaders: ['*'],
      },
    });

    cartLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds-db:connect'],
        resources: ['*'],
      }),
    );

    new cdk.CfnOutput(this, 'Url', { value: url });
  }
}
