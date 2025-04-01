# Infraestructura AWS para Correo Microservicios

Este directorio contiene la configuración de infraestructura para desplegar la aplicación en AWS Free Tier.

## Requisitos Previos

1. AWS CLI instalado y configurado
2. Node.js 16 o superior
3. AWS CDK CLI instalado (`npm install -g aws-cdk`)
4. Cuenta AWS con acceso a Free Tier

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Compilar el proyecto:
```bash
npm run build
```

3. Desplegar la infraestructura:
```bash
cdk deploy
```

## Estructura de la Infraestructura

La infraestructura incluye:

- VPC con una AZ y un NAT Gateway
- Cluster ECS Fargate
- Instancia RDS PostgreSQL (t3.micro)
- Servicios Fargate para:
  - User Service
  - Shipping Service
  - API Gateway
- Secrets Manager para credenciales
- Security Groups configurados

## Costos Estimados (Free Tier)

- RDS: 750 horas/mes de t3.micro
- ECS Fargate: 2,000,000 segundos/mes
- Secrets Manager: 10,000 secretos/mes
- VPC: NAT Gateway (limitado a 750 horas/mes)

## Limpieza

Para eliminar todos los recursos:

```bash
cdk destroy
```

## Notas Importantes

1. La instancia RDS t3.micro es la más pequeña disponible y puede tener limitaciones de rendimiento
2. El NAT Gateway incurre en costos, considere usar NAT Instance para Free Tier
3. Monitoree el uso de recursos para evitar exceder los límites de Free Tier 