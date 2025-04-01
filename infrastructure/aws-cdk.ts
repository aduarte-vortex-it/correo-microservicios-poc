import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class CorreoMicroserviciosStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'CorreoVPC', {
      maxAzs: 1,
      natGateways: 1,
    });

    // Cluster ECS
    const cluster = new ecs.Cluster(this, 'CorreoCluster', {
      vpc,
    });

    // RDS Instance
    const database = new rds.DatabaseInstance(this, 'CorreoDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13 }),
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      databaseName: 'correodb',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      // Configuración optimizada para Free Tier
      backupRetention: cdk.Duration.days(7),
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'Mon:04:00-Mon:05:00',
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      // Configuración de rendimiento
      performanceInsightRetention: rds.PerformanceInsightRetention.DEFAULT,
      monitoringInterval: cdk.Duration.seconds(60),
      enablePerformanceInsight: true,
      // Configuración de seguridad
      securityGroups: [],
      vpcSecurityGroups: [],
      publiclyAccessible: false,
    });

    // Secrets
    const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 16,
      },
      // Configuración optimizada para Free Tier
      description: 'Credenciales de la base de datos',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Fargate Services
    const userService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'UserService', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../user-service'),
        environment: {
          SPRING_DATASOURCE_URL: `jdbc:postgresql://${database.instanceEndpoint.hostname}:5432/correodb`,
          SPRING_DATASOURCE_USERNAME: 'postgres',
          SERVER_PORT: '8080',
        },
        secrets: {
          SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret),
        },
      },
      // Configuración optimizada para Free Tier
      desiredCount: 1,
      publicLoadBalancer: true,
    });

    const shippingService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'ShippingService', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../shipping-service'),
        environment: {
          SPRING_DATASOURCE_URL: `jdbc:postgresql://${database.instanceEndpoint.hostname}:5432/correodb`,
          SPRING_DATASOURCE_USERNAME: 'postgres',
          SERVER_PORT: '8080',
        },
        secrets: {
          SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret),
        },
      },
      // Configuración optimizada para Free Tier
      desiredCount: 1,
      publicLoadBalancer: true,
    });

    const apiGateway = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'ApiGateway', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../api-gateway'),
        environment: {
          SERVER_PORT: '8080',
        },
      },
      // Configuración optimizada para Free Tier
      desiredCount: 1,
      publicLoadBalancer: true,
    });

    // Security Groups
    database.connections.allowFrom(userService.service, ec2.Port.tcp(5432));
    database.connections.allowFrom(shippingService.service, ec2.Port.tcp(5432));

    // Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: apiGateway.loadBalancer.loadBalancerDnsName,
      description: 'URL del API Gateway',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'Endpoint de la base de datos',
    });
  }
} 