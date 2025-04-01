# Correo Microservicios POC

Este proyecto es una prueba de concepto (POC) de una aplicación de correo basada en microservicios, diseñada para ser desplegada en AWS Free Tier.

## Arquitectura

La aplicación está compuesta por los siguientes microservicios:

- **API Gateway**: Punto de entrada único para todas las peticiones
- **User Service**: Gestión de usuarios
- **Shipping Service**: Gestión de envíos
- **PostgreSQL**: Base de datos

## Requisitos Previos

- Java 11
- Maven
- Docker
- AWS CLI
- Node.js 16+
- AWS CDK CLI

## Desarrollo Local

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd correo-microservicios-poc
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. Construir y ejecutar con Docker Compose:
```bash
docker-compose up --build
```

## Despliegue en AWS

1. Configurar credenciales de AWS:
```bash
aws configure
```

2. Instalar dependencias de CDK:
```bash
cd infrastructure
npm install
```

3. Compilar el proyecto CDK:
```bash
npm run build
```

4. Desplegar la infraestructura:
```bash
cdk deploy
```

## Estructura del Proyecto

```
.
├── api-gateway/          # API Gateway Service
├── shipping-service/     # Shipping Service
├── user-service/        # User Service
├── infrastructure/      # AWS CDK Infrastructure
├── docker-compose.yml   # Docker Compose para desarrollo local
└── .env                 # Variables de entorno
```

## Endpoints

- API Gateway: http://localhost:8080
- User Service: http://localhost:8081
- Shipping Service: http://localhost:8082

## Monitoreo

- Health Checks: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

## Límites de AWS Free Tier

### RDS (PostgreSQL)
- 750 horas/mes de t3.micro
- 20GB de almacenamiento
- 7 días de backup
- Ventana de mantenimiento: Lunes 04:00-05:00 UTC
- Ventana de backup: 03:00-04:00 UTC

### ECS Fargate
- 2,000,000 segundos/mes
- 256 CPU units
- 512MB RAM por servicio
- 1 instancia por servicio

### Secrets Manager
- 10,000 secretos/mes
- 30,000 llamadas API/mes

### VPC
- 1 NAT Gateway (750 horas/mes)
- 1 Availability Zone
- 1 Elastic IP

## Monitoreo de Costos

1. Configurar alertas de facturación:
```bash
aws budgets create-budget \
    --account-id <tu-account-id> \
    --budget '{
        "BudgetName": "FreeTierAlert",
        "BudgetLimit": {
            "Amount": "0",
            "Unit": "USD"
        },
        "CostFilters": {
            "Service": ["Amazon RDS", "Amazon ECS", "AWS Secrets Manager"]
        },
        "TimeUnit": "MONTHLY",
        "BudgetType": "COST"
    }' \
    --notifications-with-subscribers '[
        {
            "Notification": {
                "NotificationType": "ACTUAL",
                "ComparisonOperator": "GREATER_THAN",
                "Threshold": 80,
                "ThresholdType": "PERCENTAGE"
            },
            "Subscribers": [
                {
                    "SubscriptionType": "EMAIL",
                    "Address": "tu-email@ejemplo.com"
                }
            ]
        }
    ]'
```

2. Monitorear uso de recursos:
```bash
# RDS
aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name CPUUtilization \
    --dimensions Name=DBInstanceIdentifier,Value=<tu-instancia> \
    --start-time $(date -u +"%Y-%m-%dT%H:%M:%S" -d "1 hour ago") \
    --end-time $(date -u +"%Y-%m-%dT%H:%M:%S") \
    --period 300 \
    --statistics Average

# ECS
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=<tu-cluster> \
    --start-time $(date -u +"%Y-%m-%dT%H:%M:%S" -d "1 hour ago") \
    --end-time $(date -u +"%Y-%m-%dT%H:%M:%S") \
    --period 300 \
    --statistics Average
```

## Limpieza

Para eliminar todos los recursos de AWS:

```bash
cd infrastructure
cdk destroy
```

## Notas Importantes

1. La instancia RDS t3.micro es la más pequeña disponible y puede tener limitaciones de rendimiento
2. El NAT Gateway incurre en costos, considere usar NAT Instance para Free Tier
3. Monitoree el uso de recursos para evitar exceder los límites de Free Tier
4. Los backups automáticos se eliminan al destruir la instancia RDS
5. Los secretos se eliminan automáticamente al destruir el stack
6. Los servicios Fargate se escalan automáticamente según la demanda
7. El API Gateway está configurado para ser accesible públicamente
