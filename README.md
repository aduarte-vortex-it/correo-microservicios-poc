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

## Pruebas de los Servicios

### 1. Verificar que los servicios estén funcionando

```bash
# Verificar el estado del servicio de usuarios
curl http://localhost:8081/actuator/health

# Verificar el estado del servicio de envíos
curl http://localhost:8082/health
```

### 2. Probar el servicio de usuarios

```bash
# Crear un nuevo usuario
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "1234567890"
  }'

# Obtener todos los usuarios
curl http://localhost:8081/api/users

# Crear un envío
curl -X POST http://localhost:8081/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "origin": {
      "street": "Calle Principal 123",
      "city": "Ciudad Origen",
      "state": "Estado Origen",
      "country": "País Origen",
      "postalCode": "12345"
    },
    "destination": {
      "street": "Avenida Destino 456",
      "city": "Ciudad Destino",
      "state": "Estado Destino",
      "country": "País Destino",
      "postalCode": "67890"
    },
    "weight": 2.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    }
  }'
```

### 3. Probar el servicio de envíos

```bash
# Obtener todos los envíos
curl http://localhost:8082/api/shipments

# Obtener un envío específico
curl http://localhost:8082/api/shipments/1

# Obtener envíos de un usuario
curl http://localhost:8082/api/shipments/user/1

# Actualizar estado de un envío
curl -X PATCH http://localhost:8082/api/shipments/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'

# Eliminar un envío
curl -X DELETE http://localhost:8082/api/shipments/1
```

### 4. Monitorear el procesamiento de mensajes

```bash
# Verificar los logs del servicio de envíos
docker-compose logs -f shipping-service

# Verificar los logs del servicio de usuarios
docker-compose logs -f user-service
```

### 5. Verificar la cola SQS

```bash
# Obtener el número aproximado de mensajes en la cola
aws sqs get-queue-attributes \
  --queue-url <tu-URL-de-SQS> \
  --attribute-names ApproximateNumberOfMessages

# Recibir mensajes de la cola (útil para debugging)
aws sqs receive-message \
  --queue-url <tu-URL-de-SQS> \
  --max-number-of-messages 10
```

### 6. Pruebas de integración

1. Crear un usuario y un envío
2. Verificar que el envío aparece en la cola SQS
3. Verificar que el servicio de envíos procesa el mensaje
4. Verificar que el estado del envío se actualiza
5. Verificar que se envía una notificación

### 7. Pruebas de error

```bash
# Intentar crear un envío con datos inválidos
curl -X POST http://localhost:8081/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "999",  # Usuario que no existe
    "origin": {
      "street": "Calle Principal 123"
    }
  }'

# Intentar actualizar un envío que no existe
curl -X PATCH http://localhost:8082/api/shipments/999/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'
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
