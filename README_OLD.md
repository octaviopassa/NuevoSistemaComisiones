# egresos_web

## Instrucciones de uso

### Prerequisitos

1. Instalar NVM (Node Version Manager) para Windows:

   - Descargar el instalador desde: https://github.com/coreybutler/nvm-windows
   - Ejecutar el instalador como administrador
   - Reiniciar la terminal después de la instalación

2. Instalar la versión correcta de Node.js:

   ```bash
   nvm install 14.21.3
   nvm use 14.21.3

   ```

3. Instalar Meteor:
   ```bash
   nvm use 14.21.3
   meteor
   ```
4. Instalar las dependencias:

   ```bash
   meteor npm install
   ```

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

# Para levantar los compose :
1. Crear la red:
docker network create appnet
2. Levantar los servicios:

--El mongo no hay que levantarlo ya que se levantó en el proyecto del portalgastos
docker-compose -f .\docker-compose-mongo.yml up -d
docker-compose -f .\docker-compose-prod.yml up -d 

# Cuando ya se ejecuta la aplicación para que aparezca el menú de gastos

1. Entrar con el usuario=roberto contraseña=roberto
2. En Páginas crear una página nueva con Nombre=Gastos Ruta=/gastos Modulos=view Descripción=Gastos
3. En Roles Admin, click Gastos, check Gastos, quitar los checks del Módulo Usuarios , Guardar