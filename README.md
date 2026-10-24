# egresos_web

## Instrucciones de uso

### Prerequisitos

1. Instalar NVM (Node Version Manager) para Windows:

   - Descargar el instalador desde: https://github.com/coreybutler/nvm-windows
   - Ejecutar el instalador como administrador
   - Reiniciar la terminal después de la instalación

2. Instalar la versión correcta de Node.js:

   ```bash
   nvm install 22.23.4
   nvm use 22.23.4

   ```

3. Usar Meteor 3.4 (versión fijada en `.meteor/release`):
   ```bash
   meteor --release 3.4 --version
   meteor node --version
   ```
   - Se requiere tener instalada la herramienta Meteor. El segundo comando debe mostrar Node 22, que Meteor administra por separado de NVM.
4. Instalar las dependencias:

   ```bash
   meteor npm ci
   ```

   - El archivo `.npmrc` contiene `legacy-peer-deps=true`, que indica a npm que no bloquee la instalación por conflictos de `peerDependencies` entre los paquetes actuales, incluidos algunos relacionados con React. Esta configuración también se utiliza al construir la imagen Docker; permite instalar las dependencias, pero no garantiza su compatibilidad.

5. Instalar MongoDB Community Server:

   - Descargar el instalador desde: https://www.mongodb.com/try/download/community
   - Durante la instalación, seleccionar Install MongoDB Compass
   - Ejecutar el instalador como administrador

6. Instalar MongoDB Compass:

   - Descargar el instalador desde: https://www.mongodb.com/try/download/compass
   - Crear conexión a MongoDB desde Compass con localhost:27017

7. Ejecutar la aplicación:
   ```bash
   npm run rob
   ```
   - En PowerShell, si se bloquea `npm.ps1`, utilizar `npm.cmd run rob`.
   - Este comando se conecta a `comisiones` en `localhost:27019`.

Para generar reportes PDF en desarrollo también es necesario instalar LibreOffice.

### Despliegue en el servidor

La imagen utiliza Meteor 3.4 y Node 22 e incluye LibreOffice. MongoDB se ejecuta por separado.

1. Construir y publicar la imagen desde la raíz del proyecto, con acceso a la cuenta de Docker Hub correspondiente:

   ```bash
   docker build --pull -t eljeque/portalcomisiones:latest .
   docker push eljeque/portalcomisiones:latest
   ```

2. En el servidor Linux con Docker y Docker Compose, ubicar los archivos Compose y comprobar que exista la red externa `appnet`. Crear la red solo si todavía no existe:

   ```bash
   docker network create appnet
   ```

3. Si MongoDB se administra con `docker-compose-mongo.yml`, iniciarlo conservando la ruta del volumen de datos existente en el servidor:

   ```bash
   docker compose -f docker-compose-mongo.yml up -d mongo-service
   ```

   La aplicación está configurada para conectarse a `mongodb://mongo-service:27017/comisiones` por la red `appnet`. Si el servidor utiliza otra conexión, ajustar `MONGO_URL` en `docker-compose-prod.yml`.

4. Configurar la dirección pública real de la aplicación, descargar la imagen y actualizar el contenedor:

   ```bash
   export APP_ROOT_URL="https://tu-dominio"
   docker compose -f docker-compose-prod.yml pull portalcomisiones-service
   docker compose -f docker-compose-prod.yml up -d --no-build portalcomisiones-service
   ```

   El contenedor publica la aplicación en el puerto `3011` del servidor.

5. Revisar el arranque:

   ```bash
   docker compose -f docker-compose-prod.yml logs -f --tail=100 portalcomisiones-service
   ```

### Migración desde Meteor 2.15

Se conserva la misma base de NSR: Meteor 3.4 y Node 22. Las operaciones de MongoDB y Accounts en el servidor utilizan async/await. Los paquetes aldeed:collection2 y sakulstra:aggregate se retiraron porque no se utilizan.

Dockerfile_old y README_OLD.md conservan las versiones anteriores. docker-compose-prod.yml mantiene la imagen, los puertos, la red y la conexión existentes. La migración no modifica ni restaura la base de datos. Antes del primer despliegue, realizar un respaldo y probar inicio de sesión, permisos, reportes y conversiones PDF con una copia de la base.

### Validación de la migración

Se verificaron la instalación con `meteor npm ci`, la compilación de producción en Windows y la construcción de la imagen Linux. En un contenedor conectado a MongoDB 6 temporal se probaron HTTP, inicio de sesión, creación y consulta de páginas, módulos, roles y usuarios, permisos, cambio de contraseña, idioma, estatus y bitácoras. LibreOffice generó un PDF dentro del contenedor ejecutándose como el usuario `node`.

Estas pruebas no incluyen las operaciones de negocio que dependen de la API de PASSA y SQL Server. La instalación todavía reporta vulnerabilidades en las dependencias actuales; su actualización requiere una revisión adicional de compatibilidad.
