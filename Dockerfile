#1.Etapa de construcción (builder):
# Build stage
# Usa una imagen base especializada para construir aplicaciones Meteor (versión 2.15)
FROM zcloudws/meteor-build:2.15 as builder

# Cambia temporalmente a usuario root para crear directorios y establecer permisos
USER root

RUN mkdir -p /build/source && chown zcloud:zcloud -R /build

# Luego vuelve al usuario no privilegiado 'zcloud' para seguridad
USER zcloud

# Copia todo el código fuente al contenedor, manteniendo los permisos del usuario zcloud
COPY --chown=zcloud:zcloud . /build/source

# Instala dependencias NPM y construye la aplicación Meteor en el directorio /build/app-build
RUN cd /build/source && \
    meteor npm install && \
    meteor build --directory ../app-build

#2.Etapa de ejecución:
# Clean image with builded app
# Usa una imagen más ligera que incluye Node.js, MongoDB y el runtime necesario para Meteor
FROM zcloudws/meteor-node-mongodb-runtime:2.15

# Install LibreOffice
#3.Instalación de dependencias del sistema:
# Instala LibreOffice (probablemente necesario para generar reportes/documentos)
# Limpia la caché de paquetes para reducir el tamaño de la imagen
USER root
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

#4.Preparación de la aplicación:
USER zcloud

# Copia la aplicación construida desde la etapa builder
COPY --from=builder /build/app-build/bundle /home/zcloud/app

# Instala las dependencias del servidor
RUN cd /home/zcloud/app/programs/server && npm install

#5.Configuración final:
# Establece el directorio de trabajo
# Usa un script de inicio proporcionado por la imagen base    
WORKDIR /home/zcloud/app

# Entrypoint from image
ENTRYPOINT ["/scripts/startup.sh"]

#                                   Explicación detallada
# 1. Etapa de construcción (builder):
# Usa una imagen base especializada para construir aplicaciones Meteor (versión 2.15)
# Crea directorios y establece permisos como root, luego vuelve al usuario 'zcloud'
# Copia el código fuente y mantiene los permisos
# Instala dependencias NPM y construye la aplicación Meteor

# 2. Etapa de ejecución:
# Usa una imagen más ligera con Node.js, MongoDB y runtime para Meteor
# Instala LibreOffice (probablemente para generar reportes/documentos)
# Limpia la caché de paquetes para reducir el tamaño de la imagen

# 3. Preparación de la aplicación:
# Copia la aplicación construida desde la etapa builder
# Instala las dependencias del servidor
# Establece el directorio de trabajo y script de inicio

# Este Dockerfile sigue mejores prácticas como:
# Uso de multi-stage builds para reducir tamaño final
# Uso de usuario no root cuando es posible
# Limpieza de caché de paquetes
# Separación clara entre etapa de construcción y ejecución

# El Dockerfile está configurado para una aplicación Meteor que probablemente genera documentos/reportes usando LibreOffice. 
# La estructura sigue un flujo estándar para aplicaciones Meteor con Node.js y MongoDB.