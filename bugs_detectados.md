1. Botón cancelar funciona pero no desplega nigún mensaje ni para confirmar si se quiere cancelar el documento, ni para avisar que el documento fue cancelado. :checked 
2. Se detectó un bug al grabar. Se añadió una factura, con un xml y un pdf con un peso de 300 kb, se dio clic en grabar y aunque apareció el mensaje de Grabado con exito, la factura no se grabó. :checked
3. Botón subir PDF abre el modal de subir PDF pero no detecta que el PDF fue añadido cuando pesa más de 100 kb. Marca el siguiente error:
Uncaught (in promise) RangeError: Maximum call stack size exceeded
    at reader.onload (TableGastos.js:435:42) :checked
4. Se permite grabar notas cuyo total es 0, no se está validando que el total sea mayor a 0. :checked
5. Se grabó un reembolso con xml sin pdf, y el campo pdf muestra el botón de descargar pdf. (Aparece el ID_GASTO_DETALLE con la extensión .pfd):checked


6. Solución al generar reporte :checked
Cuando funcione borras convertapi ejecutando:
```bash
meteor npm uninstall convertapi
```

# Guía de Instalación de LibreOffice

Esta guía detalla el proceso de instalación de LibreOffice en diferentes sistemas operativos para habilitar la conversión de documentos DOCX a PDF.

## Windows

1. Descargar LibreOffice:
   - Visitar [https://www.libreoffice.org/download/download/](https://www.libreoffice.org/download/download/)
   - Seleccionar "Download LibreOffice" para Windows
   - Elegir la versión de 64-bit o 32-bit según tu sistema

2. Instalar:
   - Ejecutar el archivo descargado como administrador
   - Seguir el asistente de instalación
   - Seleccionar instalación "Típica"
   - Marcar "Crear una asociación con los tipos de archivo de Microsoft Office"

3. Configuración adicional:
   - Agregar la ruta de LibreOffice a las variables de entorno:
     1. Buscar "Variables de entorno" en Windows
     2. Editar la variable PATH
     3. Agregar: `C:\Program Files\LibreOffice\program\`

## Linux

### Ubuntu/Debian
```bash
# Actualizar repositorios
sudo apt update

# Instalar LibreOffice
sudo apt install libreoffice

# Verificar la instalación
libreoffice --version
```

## macOS

1. Descargar LibreOffice:
   - Visitar [https://www.libreoffice.org/download/download/](https://www.libreoffice.org/download/download/)
   - Seleccionar la versión para macOS
   - Descargar el archivo DMG

2. Instalar:
   - Abrir el archivo DMG descargado
   - Arrastrar LibreOffice a la carpeta Applications
   - Primera vez: Click derecho y seleccionar "Abrir"
   - Ingresar credenciales de administrador si se solicitan

3. Configuración adicional:
   ```bash
   # Agregar al PATH (opcional)
   echo 'export PATH="/Applications/LibreOffice.app/Contents/MacOS:$PATH"' >> ~/.zshrc
   # O si usas bash:
   echo 'export PATH="/Applications/LibreOffice.app/Contents/MacOS:$PATH"' >> ~/.bash_profile
   ```

## Verificación de la Instalación

Para verificar que LibreOffice está correctamente instalado:

1. Abrir una terminal o línea de comandos
2. Ejecutar:
   ```bash
   libreoffice --version
   ```

3. Debería mostrar la versión instalada de LibreOffice

## Notas Importantes

- Instalar la última versión estable de LibreOffice
- En producción checa de que el usuario que ejecuta Node.js tiene permisos para ejecutar LibreOffice
- Para servidores sin interfaz gráfica, la instalación base es suficiente