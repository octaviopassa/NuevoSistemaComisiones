1. Botón cancelar funciona pero no desplega nigún mensaje ni para confirmar si se quiere cancelar el documento, ni para avisar que el documento fue cancelado.
2. Se detectó un bug al grabar. Primero se añadió una nota con un PDF y se grabó correctamente, el usuario dio clic en nuevo, reconsultó el reembolso que se había grabado y añadió una factura con su XML y PDF. Apareció el mensaje de grabado con éxito pero al consultar el reembolso la factura había desaparecido.
3. Botón subir PDF abre el modal de subir PDF pero no detecta que el PDF fue añadido cuando pesa más de 100 kb. Marca el siguiente error:
Uncaught (in promise) RangeError: Maximum call stack size exceeded
    at reader.onload (TableGastos.js:435:42)
4. Se permite grabar notas cuyo total es 0, no se está validando que el total sea mayor a 0.
5. Se grabó un reembolso con xml sin pdf, y el campo pdf muestra el botón de descargar pdf. (Aparece el ID_GASTO_DETALLE con la extensión .pfd)