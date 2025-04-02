# Correo Microservicios POC

Este proyecto es una prueba de concepto (POC) de una aplicación de correo basada en microservicios, diseñada para ser desplegada en AWS Free Tier.

## Arquitectura

La aplicación está compuesta por los siguientes microservicios:

- **User Service**: Gestión de usuarios y envío de mensajes a SQS
- **Shipping Service**: Procesamiento de envíos desde SQS
- **PostgreSQL**: Base de datos
- **AWS SQS**: Cola de mensajes para comunicación entre servicios

## Requisitos Previos

- Java 17
- Maven
- Docker
- AWS CLI
- Node.js 18+
- AWS CDK CLI

## Desarrollo Local

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd correo-microservicios-poc
```

2. Configurar variables de entorno:
```bash
# Para cada servicio
cp user-service/.env.example user-service/.env
cp shipping-service/.env.example shipping-service/.env
# Editar los archivos .env con tus configuraciones
```

3. Construir y ejecutar con Docker Compose:
```bash
docker-compose up --build
```

## Estructura del Proyecto

```
.
├── shipping-service/     # Servicio de envíos (Node.js + TypeScript)
├── user-service/        # Servicio de usuarios (Spring Boot)
├── infrastructure/      # AWS CDK Infrastructure
├── docker-compose.yml   # Docker Compose para desarrollo local
└── .env                 # Variables de entorno globales
```

## Endpoints

- User Service: http://localhost:8081
- Shipping Service: http://localhost:8082

## Monitoreo

- Health Checks:
  - User Service: http://localhost:8081/actuator/health
  - Shipping Service: http://localhost:8082/health

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

### SQS
- 1,000,000 llamadas API/mes
- 1,000,000 mensajes/mes
- 1,000,000 GB-día de transferencia de datos

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
            "Service": ["Amazon RDS", "Amazon ECS", "Amazon SQS"]
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

# SQS
aws cloudwatch get-metric-statistics \
    --namespace AWS/SQS \
    --metric-name ApproximateNumberOfMessagesVisible \
    --dimensions Name=QueueName,Value=<tu-cola> \
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
5. Los servicios Fargate se escalan automáticamente según la demanda
6. SQS tiene un límite de 120,000 mensajes en cola
7. Los mensajes en SQS se retienen por 4 días por defecto
