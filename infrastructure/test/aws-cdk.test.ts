import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as CorreoMicroservicios from '../lib/aws-cdk';

describe('CorreoMicroserviciosStack', () => {
  let stack: CorreoMicroservicios.CorreoMicroserviciosStack;
  let app: cdk.App;

  beforeEach(() => {
    app = new cdk.App();
    stack = new CorreoMicroservicios.CorreoMicroserviciosStack(app, 'TestStack');
  });

  it('should create VPC', () => {
    const template = Template.fromStack(stack);
    template.hasResource('AWS::EC2::VPC', {});
  });

  it('should create ECS Cluster', () => {
    const template = Template.fromStack(stack);
    template.hasResource('AWS::ECS::Cluster', {});
  });

  it('should create RDS Instance', () => {
    const template = Template.fromStack(stack);
    template.hasResource('AWS::RDS::DBInstance', {
      Properties: {
        Engine: 'postgres',
        DBInstanceClass: 'db.t3.micro',
      },
    });
  });

  it('should create Fargate Services', () => {
    const template = Template.fromStack(stack);
    template.hasResource('AWS::ECS::Service', {
      Properties: {
        LaunchType: 'FARGATE',
      },
    });
  });

  it('should create Security Groups', () => {
    const template = Template.fromStack(stack);
    template.hasResource('AWS::EC2::SecurityGroup', {});
  });
}); 