# Shipping Service

Servicio de envíos para el sistema de correo, implementado en Node.js con TypeScript. Este servicio procesa los envíos desde una cola SQS y maneja la lógica de negocio relacionada con los envíos.

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (opcional)
- AWS Account con acceso a SQS

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Variables de entorno requeridas:
- `AWS_REGION`: Región de AWS (ej: us-east-1)
- `AWS_ACCESS_KEY_ID`: ID de clave de acceso de AWS
- `AWS_SECRET_ACCESS_KEY`: Clave secreta de acceso de AWS
- `SQS_QUEUE_URL`: URL de la cola SQS
- `PORT`: Puerto del servicio (default: 8082)
- `NODE_ENV`: Ambiente de ejecución (development/production)

## Desarrollo

```bash
# Iniciar en modo desarrollo con hot-reload
npm run dev

# Construir el proyecto
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint

# Formatear código
npm run format
```

## Docker

```bash
# Construir imagen
docker build -t shipping-service .

# Ejecutar contenedor
docker run -p 8082:8082 --env-file .env shipping-service
```

## Endpoints

### Health Check
- `GET /health`: Verifica el estado del servicio
  ```json
  {
    "status": "healthy"
  }
  ```

## Logs

Los logs se guardan en:
- `error.log`: Errores y excepciones
- `combined.log`: Todos los logs (info, error, debug)

Formato de logs:
```json
{
  "timestamp": "2024-03-14T12:00:00.000Z",
  "level": "info",
  "message": "Mensaje del log",
  "metadata": {
    "shipmentId": "123",
    "status": "processing"
  }
}
```

## Tests

```bash
# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## Estructura del Proyecto

```
src/
├── index.ts           # Punto de entrada de la aplicación
├── config/           # Configuraciones
├── services/         # Servicios de negocio
├── models/           # Modelos de datos
├── utils/            # Utilidades
└── types/            # Definiciones de tipos TypeScript
```

## Seguridad

- Helmet para headers HTTP seguros
- CORS configurado
- Rate limiting implementado
- Variables de entorno para credenciales
- Logging seguro (sin datos sensibles)

## Monitoreo

- Health check endpoint
- Logs estructurados
- Métricas de procesamiento de mensajes
- Monitoreo de errores

## Integración con AWS

- SQS para procesamiento de mensajes
- CloudWatch para logs
- IAM para autenticación
- VPC para red segura

## Troubleshooting

1. Verificar logs:
```bash
tail -f error.log
tail -f combined.log
```

2. Verificar conexión a SQS:
```bash
aws sqs get-queue-attributes --queue-url <SQS_QUEUE_URL> --attribute-names All
```

3. Verificar health check:
```bash
curl http://localhost:8082/health
``` 