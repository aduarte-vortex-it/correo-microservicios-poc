# Correo Microservicios POC

Este proyecto es una prueba de concepto (POC) de una aplicación de correo basada en microservicios, diseñada para ser desplegada en AWS Free Tier.

## Índice
1. [Arquitectura](#arquitectura)
2. [Requisitos Previos](#requisitos-previos)
3. [Desarrollo Local](#desarrollo-local)
4. [Autenticación](#autenticación)
5. [Pruebas de los Servicios](#pruebas-de-los-servicios)
   - [Usuario](#pruebas-del-servicio-de-usuarios)
   - [Envíos](#pruebas-del-servicio-de-envíos)
   - [Errores](#pruebas-de-error)
6. [Mensajería y Notificaciones](#mensajería-y-notificaciones)
   - [Flujo de Eventos](#flujo-de-eventos)
   - [Procesamiento de Notificaciones](#procesamiento-de-notificaciones)
7. [Características Técnicas](#características-técnicas)
8. [Monitoreo](#monitoreo)
9. [Límites AWS Free Tier](#límites-de-aws-free-tier)
10. [Limpieza](#limpieza)

## Arquitectura

La aplicación está compuesta por los siguientes microservicios:

- **User Service**: Gestión de usuarios y envío de mensajes a SQS
- **Shipping Service**: Procesamiento de envíos desde SQS
- **PostgreSQL**: Base de datos
- **AWS SQS**: Cola de mensajes para comunicación entre servicios

## Estructura del Proyecto

```
.
├── shipping-service/     # Servicio de envíos (Node.js + TypeScript)
├── user-service/        # Servicio de usuarios (Spring Boot)
├── infrastructure/      # AWS CDK Infrastructure
├── docker-compose.yml   # Docker Compose para desarrollo local
└── .env                 # Variables de entorno globales
```

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

4. Verificar que los servicios estén funcionando:
```bash
# Verificar el estado del servicio de usuarios
curl http://localhost:8081/actuator/health

# Verificar el estado del servicio de envíos
curl http://localhost:8082/health
```

## Autenticación

El servicio de envíos requiere autenticación mediante un token JWT.

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

## Pruebas de los Servicios

### Formato de Respuesta

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

### Pruebas del Servicio de Usuarios

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

# Eliminar un usuario (path param)
curl -X DELETE http://localhost:8081/api/users/{id}
```

### Pruebas del Servicio de Envíos

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

### Pruebas de Error

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
```

### Depuración con Logs

El servicio de envíos (shipping-service) incluye logs detallados para facilitar la depuración.

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

## Mensajería y Notificaciones

### Notas sobre la cola SQS

La aplicación soporta tanto colas SQS estándar como colas FIFO (First-In-First-Out). Para colas FIFO (identificadas por el sufijo `.fifo` en la URL), se añaden automáticamente los siguientes parámetros requeridos:

- `MessageGroupId`: Se utiliza el ID del usuario o 'default' si no está disponible
- `MessageDeduplicationId`: Se utiliza el ID del envío para garantizar la unicidad

Ejemplo de configuración en el archivo .env para una cola FIFO:

```
AWS_SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account-id/queue-name.fifo
```

### Notificaciones con SNS

El servicio también utiliza Amazon SNS (Simple Notification Service) para enviar notificaciones sobre los eventos de envío. La aplicación soporta tanto temas SNS estándar como temas FIFO.

Para configurar correctamente SNS:

```bash
# Crear un tema SNS
aws sns create-topic --name shipment-notifications

# Para un tema FIFO, añade los atributos necesarios
aws sns create-topic \
  --name shipment-notifications.fifo \
  --attributes FifoTopic=true,ContentBasedDeduplication=false
```

### Flujo de Eventos

1. **Crear un envío** → Genera un mensaje en SQS con `action: 'CREATE'`
2. **Actualizar estado** → Genera un mensaje en SQS con `action: 'UPDATE_STATUS'`
3. **Eliminar envío** → Genera un mensaje en SQS con `action: 'DELETE'`

Cada uno de estos eventos puede ser consumido por otros servicios para realizar acciones como:
- Notificar a los usuarios
- Actualizar métricas
- Sincronizar datos entre servicios

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

### Procesamiento de Notificaciones

El servicio de envíos procesa automáticamente los mensajes de la cola SQS y genera notificaciones con SNS. Estas notificaciones varían según el tipo de acción:

| Acción | Asunto (Subject) | Mensaje |
|--------|-----------------|---------|
| `CREATE` / Por defecto | "Procesamiento de Envío" | "Envío procesado: {id}" |
| `UPDATE_STATUS` | "Actualización de Estado" | "Envío actualizado: {id}, nuevo estado: {status}" |
| `DELETE` | "Eliminación de Envío" | "Envío eliminado: {id}" |

#### Estados de un Envío

Los estados posibles para un envío son:
```
CREATED = 'CREATED',
PROCESSING = 'PROCESSING',
IN_TRANSIT = 'IN_TRANSIT',
DELIVERED = 'DELIVERED',
FAILED = 'FAILED'
```

#### Consumir Notificaciones

Para consumir estas notificaciones desde otro servicio, puedes:

1. **Suscribir un endpoint HTTP/HTTPS**:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:topic-name \
  --protocol https \
  --notification-endpoint https://tu-servicio.com/webhook
```

2. **Suscribir otro SQS**:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:topic-name \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:region:account-id:queue-name
```

3. **Suscribir una función Lambda**:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:topic-name \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:region:account-id:function:nombre-funcion
```

## Características Técnicas

### UUID

Este proyecto utiliza una combinación de tecnologías UUID:

- **En PostgreSQL**: Implementamos UUID v7 a través de una función personalizada `uuid_generate_v7()`. 
  UUID v7 ofrece las siguientes ventajas:
  - **Ordenación temporal**: Incluye un timestamp de alta precisión, permitiendo ordenar IDs cronológicamente.
  - **Rendimiento**: Mayor eficiencia en bases de datos debido a la secuencialidad.
  - **Seguridad**: Mantiene la aleatoriedad necesaria para evitar conflictos y predecibilidad.

- **En Node.js**: Utilizamos UUID v4 de la biblioteca estándar `uuid`, que proporciona identificadores completamente aleatorios.

Esta implementación híbrida permite aprovechar las ventajas de UUIDv7 en la base de datos, mientras se mantiene la compatibilidad con las bibliotecas estándar de Node.js.

### Endpoints

- User Service: http://localhost:8081
- Shipping Service: http://localhost:8082

## Monitoreo

### Health Checks

- User Service: http://localhost:8081/actuator/health
- Shipping Service: http://localhost:8082/health

### Monitoreo de Servicios

```bash
# Verificar los logs del servicio de envíos
docker-compose logs -f shipping-service

# Verificar los logs del servicio de usuarios
docker-compose logs -f user-service

# Verificar la cola SQS
aws sqs get-queue-attributes \
  --queue-url <tu-URL-de-SQS> \
  --attribute-names ApproximateNumberOfMessages
```

### Monitoreo de Costos

Configurar alertas de facturación:
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

Monitorear uso de recursos:
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
```

## Límites de AWS Free Tier

### RDS (PostgreSQL)
- 750 horas/mes de t3.micro
- 20GB de almacenamiento
- 7 días de backup

### ECS Fargate
- 2,000,000 segundos/mes
- 256 CPU units
- 512MB RAM por servicio

### SQS
- 1,000,000 llamadas API/mes
- 1,000,000 mensajes/mes
- 1,000,000 GB-día de transferencia de datos

### VPC
- 1 NAT Gateway (750 horas/mes)
- 1 Availability Zone
- 1 Elastic IP

## Notas Importantes

1. La instancia RDS t3.micro es la más pequeña disponible y puede tener limitaciones de rendimiento
2. El NAT Gateway incurre en costos, considere usar NAT Instance para Free Tier
3. Monitoree el uso de recursos para evitar exceder los límites de Free Tier
4. Los backups automáticos se eliminan al destruir la instancia RDS
5. Los servicios Fargate se escalan automáticamente según la demanda
6. SQS tiene un límite de 120,000 mensajes en cola
7. Los mensajes en SQS se retienen por 4 días por defecto

## Limpieza

Para eliminar todos los recursos de AWS:

```bash
cd infrastructure
cdk destroy
```
