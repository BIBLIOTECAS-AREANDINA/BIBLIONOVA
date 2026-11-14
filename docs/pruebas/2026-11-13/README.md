# Pruebas funcionales: índice H, BibliometriX y Digitk

Fecha: 13 de noviembre de 2026, America/Bogota.

## Resultado comprobado

27 casos ejecutados sobre el código original: **20 PASS y 7 FAIL**. No se modificó código de aplicación. Las pruebas se ejecutaron en Node VM, con servicios Google simulados y datos ficticios. No son una certificación funcional completa ni una prueba de integración real de Apps Script.

| Producto / variante | PASS | FAIL |
| --- | --- | --- |
| Índice H | 6 | 1 |
| BibliometriX | 6 | 2 |
| Digitk plantilla | 7 | 3 |
| Digitk v2 | 1 | 1 |

## Datos y oráculo de comprobación

Las dos fixtures CSV contienen seis filas: cinco obras con citas 9, 6, 5, 3 y 1, más un duplicado con ocho citas de la primera obra. Después de deduplicar y conservar el mayor conteo: cinco obras, 24 citas, h=3, g=4 e i10=0. Los títulos, autores, instituciones y DOI son ficticios; no representan publicaciones reales.

Para índice H se añadieron columnas Scopus, Dimensions, Scholar y Altmetric=999, comprobando que se usa el máximo de las fuentes de citas y se excluye Altmetric. BibliometriX se probó también con WoS TSV, CSV entrecomillado y multilínea, y filtro 2023–2025: tres publicaciones, nueve citas, h=2.

## Defectos reproducidos; sin corregir en esta gestión

| Caso | Esperado | Obtenido | Pendiente |
| --- | --- | --- | --- |
| H07 | Citas textuales negativas rechazadas o normalizadas a 0 | `HI.num('-5')` devuelve 5 | Validar signo antes de extraer dígitos y añadir regresión. |
| B07 | `Open Access=No` significa cerrado | Se interpreta como `true` | Interpretar valores de OA explícitamente y documentar vocabularios soportados. |
| B08 | Citas negativas rechazadas o normalizadas a 0 | Se conserva -7 | Validar valores antes de agregar métricas. |
| D06 | Objetos de adjuntos vacíos rechazados sin fila | `ok:true` y una fila con enlaces vacíos | Validar bytes, tipo y datos requeridos antes de crear recursos. |
| D07 | Fallo de carga no debe declarar éxito | Tres fallos simulados de almacenamiento terminan en `ok:true` y fila registrada | Propagar fallos y definir recuperación/limpieza de cargas parciales. |
| D10 | Una solicitud cargada no debe retroceder por enlace antiguo | `Cargado en Digitk` pasa a `Aprobado - pendiente Digitk` | Validar transiciones e idempotencia. |
| V02 | Evento sin metadatos obligatorios no debe registrarse | v2 crea una fila con solo correo | Validar campos obligatorios antes de crear carpeta, fila o notificaciones. |

Los casos H07/B07/B08 verifican entradas límite de importación, no invalidan los resultados del conjunto normal que sí pasó. Los defectos de Digitk impiden dar por aprobado el manejo de errores y la integridad del flujo. No se desplegó ni se cambió producción.

## Alcance y límites

- Digitk: flujo normal de la plantilla con configuración sintética, tres cargas ficticias, fila de 18 columnas y dos notificaciones **simuladas**; dominio ajeno, metadatos obligatorios, adjunto ausente, aprobación e ID/acción inválidos. En v2, evento completo con fila de 26 columnas y dos notificaciones simuladas.
- Google Drive, Sheets, Gmail, carpetas y archivos fueron mocks en memoria. No se enviaron correos, no se crearon hojas/carpetas en Google y no se ejecutaron `setupInicial`, triggers ni endpoints institucionales.
- No se verificó PDF real: se usaron bytes ficticios con cabecera PDF para probar el flujo de carga. Persisten las pruebas de PDF válido, MIME/tamaño, autorizaciones, cuotas, concurrencia, recuperación y entrega de correos en un entorno de ensayo autorizado.
- La configuración pública de digitk-cargue-repositorio bloqueó correctamente el uso sin reemplazar placeholders. La variante v2 contiene configuración de entorno: no se usó para conectarse ni se copiaron sus identificadores a estas evidencias.
- Se descargaron las versiones publicadas de `utils.js`, `analyze.js` e `index.html` de BibliometriX: coinciden con los archivos probados al normalizar UTF-8 y saltos de línea CRLF/LF. Los hashes originales y la comparación se conservan en el JSON adjunto.
- Prueba completa en navegador (carga, filtros visuales, exportación y revisión de archivo descargado): pendiente de confirmar. El intento de carga CSV de índice H no produjo un resultado visual confirmado durante la interferencia de otra sesión de control. No se registra como PASS de navegador.

## Versiones revisadas

- [Generador-ndice-H @ 5fc6726ef132](https://github.com/BIBLIOTECAS-AREANDINA/Generador-ndice-H/commit/5fc6726ef132d3faa0d24ae50baa302c036f4f55)
- [BibliometriX @ 971e46f7a3c7](https://github.com/BIBLIOTECAS-AREANDINA/BibliometriX/commit/971e46f7a3c7374b515b9ce1645d9fe644d36dbd)
- [digitk-cargue-repositorio @ ea8f43f9940b](https://github.com/BIBLIOTECAS-AREANDINA/digitk-cargue-repositorio/commit/ea8f43f9940b6c5711a2dcfee945fd2a8f745cbb)
- [Digitek_sistema_repositorio @ 220473d41970](https://github.com/BIBLIOTECAS-AREANDINA/Digitek_sistema_repositorio/commit/220473d41970b0b1c5841626de1e44c393359b57)

## Reproducción

Clonar los cuatro repositorios fuente con sus nombres originales en una carpeta común y hacer checkout de los commits anteriores. Descargar esta carpeta de evidencias, conservando `fixtures/` junto al ejecutor. Ejecutar:

```text
node run-tests.mjs RUTA_A_LA_CARPETA_CON_LOS_CUATRO_REPOS
```

El ejecutor carga las funciones originales mediante Node VM y escribe `results.json`. Es necesario revisar los resultados FAIL: no se consideran una excepción inesperada ni un cierre aprobado. El script no inicia navegador ni conecta servicios de Google. Las sustituciones de configuración se aplican únicamente a una copia en memoria de la plantilla, manteniendo intacto el código fuente del repositorio.

## Archivos de evidencia

- [Resultados completos esperados/obtenidos](results.json)
- [Versiones fuente](versions.json)
- [Coincidencia con código publicado en Pages](deployed-source-check.json)
- [Ejecutor reproducible](run-tests.mjs)
- [CSV índice H](fixtures/indice-h-sintetico.csv)
- [CSV BibliometriX Scopus](fixtures/bibliometrix-scopus-sintetico.csv)

## Cierre y responsabilidades

Al registrar esta ronda, la validación funcional debe pasar a **En curso**, sin marcarla completada. Andrea conserva la validación funcional; Cristian participa en la revisión técnica y corrección de defectos; Manuela conserva evidencias y Miguel da seguimiento al cierre. No se inventaron fechas comprometidas. Antes de cerrar: corregir/reprobar los siete defectos, completar navegador/exportación y realizar integración Digitk solo en entorno aislado acordado. No tocar Koha de producción.


## Estado del registro en Planner

Las evidencias de esta ronda están publicadas en GitHub. **Todavía no se guardaron estos resultados nuevos en Planner**: otra sesión de control estaba cambiando las ventanas. Se solicitó pausar esa sesión antes de continuar. La tarea existente de validación es `gxbCMrY7NkGNQ37tcFhlg2QAIRby`; la de seguimiento técnico es `GF_l2jjPcEi2VzOUMKdQ2mQAMKi9`. No se crearon tareas duplicadas ni se declara completado el registro.
