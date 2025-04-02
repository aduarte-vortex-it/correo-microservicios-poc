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

### 2. Autenticación

El servicio de envíos requiere autenticación mediante un token JWT. Para obtener un token de prueba:

```bash
# Obtener token de prueba
curl -X POST http://localhost:8082/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "test123"
  }'
```

La respuesta será un objeto JSON con el token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Pruebas del Servicio de Usuarios

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

# Obtener un usuario específico por ID
curl http://localhost:8081/api/users/{id}

# Actualizar un usuario
curl -X PUT http://localhost:8081/api/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "email": "juan.actualizado@ejemplo.com",
    "phone": "9876543210"
  }'

# Eliminar un usuario
curl -X DELETE http://localhost:8081/api/users/{id}
```

### 4. Pruebas del Servicio de Envíos

Primero, obtén un token de autenticación usando el endpoint de autenticación. Luego, usa el token en todas las peticiones:

```bash
# Obtener todos los envíos (requiere token)
curl http://localhost:8082/api/shipments \
  -H "Authorization: Bearer <tu-token>"

# Obtener un envío específico (requiere token)
curl http://localhost:8082/api/shipments/{id} \
  -H "Authorization: Bearer <tu-token>"

# Obtener envíos de un usuario (requiere token)
curl http://localhost:8082/api/shipments/user/{userId} \
  -H "Authorization: Bearer <tu-token>"

# Actualizar estado de un envío (requiere token)
curl -X PATCH http://localhost:8082/api/shipments/{id}/status \
  -H "Authorization: Bearer <tu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'

# Eliminar un envío (requiere token)
curl -X DELETE http://localhost:8082/api/shipments/{id} \
  -H "Authorization: Bearer <tu-token>"
```

### 5. Pruebas de Error

```bash
# Intentar acceder sin token
curl http://localhost:8082/api/shipments

# Intentar acceder con token inválido
curl http://localhost:8082/api/shipments \
  -H "Authorization: Bearer token-invalido"

# Intentar crear un usuario con email duplicado
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Duplicado",
    "email": "juan@ejemplo.com",
    "phone": "1234567890"
  }'

# Intentar obtener un usuario que no existe
curl http://localhost:8081/api/users/{id-inexistente}

# Intentar actualizar un envío que no existe
curl -X PATCH http://localhost:8082/api/shipments/{id-inexistente}/status \
  -H "Authorization: Bearer <tu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'
```

### 6. Monitoreo

```bash
# Verificar los logs del servicio de envíos
docker-compose logs -f shipping-service

# Verificar los logs del servicio de usuarios
docker-compose logs -f user-service

# Verificar la cola SQS
aws sqs get-queue-attributes \
  --queue-url <tu-URL-de-SQS> \
  --attribute-names ApproximateNumberOfMessages

# Recibir mensajes de la cola (útil para debugging)
aws sqs receive-message \
  --queue-url <tu-URL-de-SQS> \
  --max-number-of-messages 10
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

## Autenticación

El servicio de envíos requiere autenticación mediante un token JWT. Para probar los endpoints, necesitas incluir el header de autorización:

```bash
# Ejemplo de header de autorización
Authorization: Bearer <tu-token>
```

### Obtener el Bearer Token

Para desarrollo local, puedes obtener un token de prueba usando el siguiente endpoint:

```bash
# Obtener token de prueba
curl -X POST http://localhost:8082/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "test123"
  }'
```

La respuesta será un objeto JSON con el token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Para usar el token en las peticiones, copia el valor del token y úsalo en el header de autorización:

```bash
# Ejemplo de uso del token
curl http://localhost:8082/api/shipments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Nota: Este es un token de prueba para desarrollo local. En producción, deberías obtener el token a través de tu sistema de autenticación.
