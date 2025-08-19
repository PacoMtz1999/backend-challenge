# Currency Converter API

Una API completa de conversión de monedas construida con FeathersJS, MongoDB, RabbitMQ y generación de PDFs. Soporta tanto monedas FIAT (USD, EUR, MXN) como criptomonedas (BTC, ETH, USDT).

## 🚀 Características

- **Conversión de Monedas**: Soporte para FIAT y criptomonedas
- **APIs Externas**: Integración con CoinGecko y OpenExchangeRates
- **Base de Datos**: MongoDB con Mongoose para almacenamiento persistente
- **Cola de Mensajes**: RabbitMQ para procesamiento asíncrono
- **Reportes PDF**: Generación automática de reportes diarios
- **Validaciones**: Validación robusta con Joi
- **WebSockets**: Actualizaciones en tiempo real (opcional)
- **Cron Jobs**: Actualización automática de tasas cada hora
- **Pruebas**: Suite completa de pruebas con Jest

## 🛠️ Stack Tecnológico

- **Backend**: Node.js, FeathersJS
- **Base de Datos**: MongoDB, Mongoose
- **Cola de Mensajes**: RabbitMQ (amqplib)
- **Validación**: Joi
- **PDF**: PDFMake, Puppeteer, html-pdf-node
- **Pruebas**: Jest, Supertest
- **Logging**: Winston
- **Cron**: node-cron

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- RabbitMQ (local o servicio en la nube)
- Yarn o npm

## 🔧 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd currency-converter-api
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
yarn install
# o
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
# Crear archivo .env
MONGODB_URL=mongodb://localhost:27017/currency_converter
RABBITMQ_URL=amqp://localhost
OPENEXCHANGE_API_KEY=your_api_key_here
LOG_LEVEL=info
PORT=3030
\`\`\`

4. **Iniciar servicios requeridos**
\`\`\`bash
# MongoDB (si es local)
mongod

# RabbitMQ (si es local)
rabbitmq-server
\`\`\`

5. **Ejecutar la aplicación**
\`\`\`bash
# Desarrollo
yarn dev

# Producción
yarn start
\`\`\`

## 📚 API Endpoints

### 🔄 Rates Service (`/rates`)

**GET /rates**
- Obtiene todas las tasas de conversión actuales
- Actualiza automáticamente desde APIs externas si es necesario

**POST /rates**
- Actualiza manualmente una tasa específica
\`\`\`json
{
  "from": "USD",
  "to": "EUR",
  "rate": 0.85
}
\`\`\`

### 💱 Convert Service (`/convert`)

**POST /convert**
- Convierte un monto entre dos monedas
- Almacena el registro en la base de datos
- Envía mensaje a RabbitMQ
\`\`\`json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100
}
\`\`\`

**GET /convert**
- Obtiene historial de conversiones

### 📊 Report Service (`/report`)

**GET /report**
- Genera reporte PDF del día actual

**GET /report?date=2024-01-15**
- Genera reporte PDF para fecha específica

## 🗄️ Modelos de Base de Datos

### Rate Model
\`\`\`javascript
{
  from: String,        // Moneda origen (ej: "USD")
  to: String,          // Moneda destino (ej: "EUR")
  rate: Number,        // Tasa de conversión
  source: String,      // Fuente: "coingecko", "openexchangerates", "manual"
  lastUpdated: Date    // Última actualización
}
\`\`\`

### Conversion Model
\`\`\`javascript
{
  from: String,           // Moneda origen
  to: String,             // Moneda destino
  amount: Number,         // Cantidad original
  convertedAmount: Number, // Cantidad convertida
  rate: Number,           // Tasa utilizada
  timestamp: Date,        // Momento de la conversión
  ip: String,             // IP del cliente
  userAgent: String       // User agent del cliente
}
\`\`\`

## 🧪 Pruebas

\`\`\`bash
# Ejecutar todas las pruebas
yarn test

# Ejecutar pruebas en modo watch
yarn test:watch

# Generar reporte de cobertura
yarn test:coverage
\`\`\`

## 🔄 Cron Jobs

- **Actualización de Tasas**: Cada hora (0 * * * *)
  - Obtiene tasas actualizadas de CoinGecko y OpenExchangeRates
  - Actualiza la base de datos automáticamente

## 📨 RabbitMQ Integration

Cada conversión exitosa envía un mensaje a la cola `currency_conversions`:

\`\`\`json
{
  "conversionId": "ObjectId",
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "convertedAmount": 85,
  "rate": 0.85,
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

## 🌐 WebSocket Support

La aplicación soporta WebSockets para actualizaciones en tiempo real:

\`\`\`javascript
// Cliente
const socket = io('http://localhost:3030');
socket.on('convert created', (data) => {
  console.log('Nueva conversión:', data);
});
\`\`\`

## 📄 Generación de PDFs

Los reportes incluyen:
- Estadísticas del día
- Top pares de monedas
- Distribución por horas
- Historial de conversiones recientes

## 🔒 Validaciones

Todas las entradas son validadas usando Joi:

- **Rates**: Códigos de moneda de 3 caracteres, tasas positivas
- **Convert**: Monedas válidas, montos positivos, monedas diferentes
- **Report**: Fechas en formato ISO válido

## 🚀 Deployment

### Docker (Opcional)
\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3030
CMD ["npm", "start"]
\`\`\`

### Variables de Entorno para Producción
\`\`\`bash
NODE_ENV=production
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/currency_converter
RABBITMQ_URL=amqps://user:pass@rabbitmq-server.com/vhost
OPENEXCHANGE_API_KEY=your_production_api_key
LOG_LEVEL=warn
PORT=3030
\`\`\`

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🎯 Roadmap

- [ ] Autenticación y autorización
- [ ] Rate limiting
- [ ] Caché con Redis
- [ ] Métricas y monitoreo
- [ ] API versioning
- [ ] Documentación con Swagger
- [ ] Soporte para más criptomonedas
- [ ] Alertas por email/SMS
