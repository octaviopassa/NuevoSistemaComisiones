# Versión principal de Node compartida por las tres etapas.
# Meteor 3.4 requiere Node 22. La versión menor la proporciona la etiqueta de Node.
ARG NODE_VERSION=22

# 1. Etapa de construcción (builder).
# Debian Bookworm con Node y herramientas para instalar dependencias y compilar Meteor.
FROM node:${NODE_VERSION}-bookworm AS builder
# Estos argumentos permiten seleccionar Meteor y la configuración de la aplicación.
ARG METEOR_VERSION=3.4
ARG NODE_ENV=production

# curl descarga el instalador oficial; los certificados permiten conexiones HTTPS.
# Python, make y g++ permiten compilar dependencias nativas de Node.
# Se eliminan los índices de apt para reducir el espacio de esta capa.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
# La instalación de Meteor y la compilación se ejecutan con el usuario node.
USER node
WORKDIR /home/node
# Instala la versión indicada de Meteor dentro del directorio personal del usuario.
RUN curl -fsSL "https://install.meteor.com/?release=${METEOR_VERSION}" -o /tmp/install-meteor.sh \
    && sh /tmp/install-meteor.sh \
    && rm /tmp/install-meteor.sh
# Hace que el comando meteor esté disponible durante la construcción.
ENV PATH="/home/node/.meteor:${PATH}"
WORKDIR /home/node/source
# Copia el código con permisos del usuario node. .dockerignore excluye, entre otros,
# node_modules, los datos locales y las compilaciones anteriores de Meteor.
COPY --chown=node:node . .
# Comprueba que la versión del proyecto coincida con la instalada.
# tr elimina los finales de línea de Windows antes de comparar .meteor/release.
# En producción se utiliza config.prod.js como configuración de la aplicación.
# npm ci instala las versiones del package-lock.json y utiliza también .npmrc.
# meteor build genera el bundle desplegable; --server-only omite aplicaciones
# móviles, pero conserva el cliente web que sirve esta aplicación.
RUN test "$(tr -d '\r\n' < .meteor/release)" = "METEOR@${METEOR_VERSION}" \
    && if [ "$NODE_ENV" = "production" ]; then cp imports/utils/config.prod.js imports/utils/config.js; fi \
    && meteor npm ci \
    && meteor build --directory /home/node/build --server-only

# 2. Etapa de dependencias del servidor (server-dependencies).
# Usa la misma versión principal de Node y distribución Linux que las otras etapas
# para instalar las dependencias del bundle, incluidas las que requieren compilación.
FROM node:${NODE_VERSION}-bookworm AS server-dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/programs/server
COPY --from=builder /home/node/build/bundle/programs/server/ ./
# Instala las dependencias de ejecución del servidor generado por Meteor.
# Las herramientas de compilación de esta etapa no se copian a la imagen final.
RUN npm install --omit=dev

# 3. Etapa de ejecución (runtime).
# La variante slim reduce la imagen base. El bundle funciona con Node directamente,
# por lo que esta etapa no necesita instalar la herramienta de desarrollo Meteor.
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
# LibreOffice dispone de un directorio personal escribible para su perfil.
ENV NODE_ENV=production PORT=3000 HOME=/home/node
# LibreOffice convierte los reportes a PDF; las fuentes se usan al renderizarlos.
# --no-install-recommends evita paquetes recomendados adicionales y la limpieza
# de los índices de apt reduce el espacio ocupado por la capa.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice fonts-dejavu-core ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Copia el bundle y después incorpora las dependencias preparadas del servidor.
# Los archivos pertenecen al usuario node, que ejecutará la aplicación.
COPY --from=builder --chown=node:node /home/node/build/bundle/ ./
COPY --from=server-dependencies --chown=node:node /app/programs/server/ ./programs/server/
USER node
# Documenta el puerto interno. Docker Compose publica este puerto en el servidor.
EXPOSE 3000
# Arranca el bundle sin depender de un script de inicio de una imagen de terceros.
CMD ["node", "main.js"]

# Explicación detallada del despliegue:
# 1. builder instala Meteor 3.4, selecciona la configuración de producción y
#    transforma el código fuente en un bundle con servidor y cliente web.
# 2. server-dependencies prepara las dependencias de ejecución con Node 22.
# 3. runtime contiene Node 22, el bundle y LibreOffice. Las herramientas de
#    construcción y la instalación de Meteor permanecen en etapas anteriores.
# 4. MongoDB no se instala en esta imagen: se ejecuta en un contenedor o servidor
#    separado. MONGO_URL indica a la aplicación dónde está su base de datos.
# 5. ROOT_URL debe contener la dirección pública de la aplicación. Estas variables
#    se proporcionan al iniciar el contenedor mediante Docker Compose.
# 6. La aplicación escucha en el puerto interno 3000; docker-compose-prod.yml lo
#    publica en el puerto 3011 del servidor y conecta los servicios por appnet.
# 7. El usuario node ejecuta la aplicación sin privilegios de root. LibreOffice
#    utiliza su perfil de usuario y los directorios temporales para las conversiones.
#
# La construcción en varias etapas evita incluir herramientas de desarrollo en la
# imagen final. LibreOffice y las dependencias de la aplicación también contribuyen
# al tamaño final, aunque se utilice una imagen base slim.
