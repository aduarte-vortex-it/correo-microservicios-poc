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

# Obtener un usuario específico por ID (path param)
curl http://localhost:8081/api/users/{id}

# Obtener un usuario específico por ID (query param)
curl http://localhost:8081/api/users?id={id}

# Actualizar un usuario (path param)
curl -X PUT http://localhost:8081/api/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "email": "juan.actualizado@ejemplo.com",
    "phone": "9876543210"
  }'

# Actualizar un usuario (query param)
curl -X PUT http://localhost:8081/api/users?id={id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "email": "juan.actualizado@ejemplo.com",
    "phone": "9876543210"
  }'

# Eliminar un usuario (path param)
curl -X DELETE http://localhost:8081/api/users/{id}

# Eliminar un usuario (query param)
curl -X DELETE http://localhost:8081/api/users?id={id}

# Eliminar todos los usuarios
curl -X DELETE http://localhost:8081/api/users
```

### 4. Formato de Respuesta

El formato de fecha en las respuestas ha sido configurado para usar un formato estandarizado:

```json
{
  "id": "12345678-1234-1234-1234-123456789abc",
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "phone": "1234567890",
  "status": "ACTIVE",
  "createdAt": "03-04-2025 12:34:56",
  "updatedAt": "03-04-2025 12:34:56"
}
```

### 5. Pruebas del Servicio de Envíos

Primero, obtén un token de autenticación usando el endpoint de autenticación. Luego, usa el token en todas las peticiones:

```bash
# Obtener todos los envíos (requiere token)
curl http://localhost:8082/api/shipments \
  -H "Authorization: Bearer <tu-token>"

# Crear un nuevo envío (requiere token)
curl -X POST http://localhost:8082/api/shipments \
  -H "Authorization: Bearer <tu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "12345678-1234-1234-1234-123456789abc",
    "origin": {
      "street": "Calle Origen 123",
      "city": "Ciudad Origen",
      "state": "Estado Origen",
      "country": "País Origen",
      "postalCode": "12345"
    },
    "destination": {
      "street": "Calle Destino 456",
      "city": "Ciudad Destino",
      "state": "Estado Destino",
      "country": "País Destino",
      "postalCode": "67890"
    },
    "weight": 5.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    }
  }'

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

### 6. Pruebas de Error

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

### 7. Depuración con Logs

El servicio de envíos (shipping-service) incluye logs detallados para facilitar la depuración. Puedes ver estos logs en la consola mientras el servicio está en ejecución.

```bash
# Ver logs en tiempo real del servicio de envíos
docker-compose logs -f shipping-service

# Ver solo los últimos 100 logs
docker-compose logs --tail=100 shipping-service
```

Los logs incluyen información detallada sobre:
- Autenticación y validación de tokens
- Creación, actualización y eliminación de envíos
- Comunicación con SQS
- Errores y excepciones

Ejemplo de log durante la creación de un envío:
```
shipping-service_1   | [AuthController] Login successful for user: test@ejemplo.com
shipping-service_1   | [AuthController] JWT token generated
shipping-service_1   | [Auth Middleware] Verifying authentication token for path: /
shipping-service_1   | [Auth Middleware] Authorization header: Present
shipping-service_1   | [Auth Middleware] Verifying token
shipping-service_1   | [Auth Middleware] Token valid for user: test@ejemplo.com
shipping-service_1   | [ShipmentController] Creating shipment with data: {"userId":"12345678-1234-1234-1234-123456789abc"...}
shipping-service_1   | [ShipmentService] Creating new shipment with data: {"userId":"12345678-1234-1234-1234-123456789abc"...}
shipping-service_1   | [ShipmentService] Generated new shipment with ID: a1b2c3d4-e5f6-g7h8-i9j0
shipping-service_1   | [ShipmentRepository] Saving shipment with ID: a1b2c3d4-e5f6-g7h8-i9j0
shipping-service_1   | [ShipmentRepository] Sending message to SQS queue: https://sqs.us-east-1.amazonaws.com/123456789012/envios
shipping-service_1   | [ShipmentRepository] Successfully sent message to SQS
shipping-service_1   | [ShipmentController] Shipment created successfully: {"id":"a1b2c3d4-e5f6-g7h8-i9j0"...}
```

### 8. Monitoreo

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

### 9. Notas sobre la cola SQS

La aplicación soporta tanto colas SQS estándar como colas FIFO (First-In-First-Out). Para colas FIFO (identificadas por el sufijo `.fifo` en la URL), se añaden automáticamente los siguientes parámetros requeridos:

- `MessageGroupId`: Se utiliza el ID del usuario o 'default' si no está disponible
- `MessageDeduplicationId`: Se utiliza el ID del envío para garantizar la unicidad

Ejemplo de configuración en el archivo .env para una cola FIFO:

```
AWS_SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account-id/queue-name.fifo
```

Si se utiliza una cola estándar (sin el sufijo `.fifo`), estos parámetros no se añaden.

### 10. Notificaciones con SNS

El servicio también utiliza Amazon SNS (Simple Notification Service) para enviar notificaciones sobre los eventos de envío. La aplicación soporta tanto temas SNS estándar como temas FIFO. Para temas FIFO (identificados por el sufijo `.fifo` en el ARN), se añaden automáticamente los siguientes parámetros requeridos:

- `MessageGroupId`: Se utiliza 'shipment-notifications' como grupo para todos los mensajes relacionados con envíos
- `MessageDeduplicationId`: Se genera un UUID único para cada mensaje para evitar duplicados

Ejemplo de configuración en el archivo .env para un tema FIFO:

```
AWS_SNS_TOPIC_ARN=arn:aws:sns:region:account-id:topic-name.fifo
```

Si se utiliza un tema estándar (sin el sufijo `.fifo`), estos parámetros no se añaden.

Para configurar correctamente SNS:

```bash
# Crear un tema SNS
aws sns create-topic --name shipment-notifications

# Para un tema FIFO, añade los atributos necesarios
aws sns create-topic \
  --name shipment-notifications.fifo \
  --attributes FifoTopic=true,ContentBasedDeduplication=false
```

### 11. Prueba de Eventos de Shipping

El servicio de envíos utiliza Amazon SQS para comunicarse con otros servicios. A continuación se describe cómo probar este flujo de eventos:

#### 11.1 Preparación

1. Primero, obtén un token de autenticación:
```bash
# Obtener token de prueba
curl -X POST http://localhost:8082/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "test123"
  }'
```

2. Guarda el token recibido:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 11.2 Crear un Envío (Produce un evento en SQS)

```bash
# Crear un nuevo envío
curl -X POST http://localhost:8082/api/shipments \
  -H "Authorization: Bearer TU_TOKEN_AQUÍ" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "12345678-1234-1234-1234-123456789abc",
    "origin": {
      "street": "Calle Origen 123",
      "city": "Ciudad Origen",
      "state": "Estado Origen",
      "country": "País Origen",
      "postalCode": "12345"
    },
    "destination": {
      "street": "Calle Destino 456",
      "city": "Ciudad Destino",
      "state": "Estado Destino",
      "country": "País Destino",
      "postalCode": "67890"
    },
    "weight": 5.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    }
  }'
```

3. Guarda el ID del envío creado de la respuesta:
```json
{
  "id": "a1b2c3d4-e5f6-g7h8-i9j0",
  "userId": "12345678-1234-1234-1234-123456789abc",
  "status": "CREATED",
  ...
}
```

#### 11.3 Actualizar Estado del Envío (Produce evento en SQS)

```bash
# Actualizar estado de un envío
curl -X PATCH http://localhost:8082/api/shipments/ID_DEL_ENVÍO/status \
  -H "Authorization: Bearer TU_TOKEN_AQUÍ" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'
```

#### 11.4 Verificar Mensajes en SQS

Para verificar los mensajes en la cola SQS, puedes usar AWS CLI:

```bash
# Obtener el número de mensajes en la cola
aws sqs get-queue-attributes \
  --queue-url URL_DE_TU_COLA_SQS \
  --attribute-names ApproximateNumberOfMessages \
  --region REGION

# Recibir y ver mensajes de la cola
aws sqs receive-message \
  --queue-url URL_DE_TU_COLA_SQS \
  --max-number-of-messages 10 \
  --region REGION
```

Si estás usando una cola FIFO, necesitas especificar el grupo de mensajes:

```bash
aws sqs receive-message \
  --queue-url URL_DE_TU_COLA_SQS \
  --max-number-of-messages 10 \
  --attribute-names All \
  --message-attribute-names All \
  --region REGION
```

#### 11.5 Verificar Logs para Seguimiento de Eventos

Para ver cómo se procesan los eventos, puedes seguir los logs:

```bash
# Ver logs en tiempo real
docker-compose logs -f shipping-service
```

Busca logs como:
```
[ShipmentRepository] Sending message to SQS queue: https://sqs.region.amazonaws.com/account-id/queue-name
[ShipmentRepository] Successfully sent message to SQS
```

#### 11.6 Flujo Completo de un Evento

1. **Crear un envío** → Genera un mensaje en SQS con `action: 'CREATE'`
2. **Actualizar estado** → Genera un mensaje en SQS con `action: 'UPDATE_STATUS'`
3. **Eliminar envío** → Genera un mensaje en SQS con `action: 'DELETE'`

Cada uno de estos eventos puede ser consumido por otros servicios para realizar acciones como:
- Notificar a los usuarios
- Actualizar métricas
- Sincronizar datos entre servicios

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

## Características Técnicas

### UUID v7

Este proyecto utiliza UUID v7 para todos los identificadores, en lugar de UUID v4. UUID v7 ofrece las siguientes ventajas:

- **Ordenación temporal**: Los UUID v7 incluyen un timestamp de alta precisión, lo que permite ordenarlos cronológicamente.
- **Rendimiento**: Mayor eficiencia en bases de datos debido a la secuencialidad.
- **Seguridad**: Mantiene la aleatoriedad necesaria para evitar conflictos y predecibilidad.

Implementación:
- En Node.js: Utilizamos la biblioteca estándar `uuid` con la función `v7`.
- En PostgreSQL: Hemos implementado una función personalizada `uuid_generate_v7()` que genera UUIDs compatibles con el estándar v7.

### Monitoreo

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
