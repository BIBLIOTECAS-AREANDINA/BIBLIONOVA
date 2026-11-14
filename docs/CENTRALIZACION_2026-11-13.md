# Centralización de Bibliotecas Areandina

Fecha: 13 de noviembre de 2026, America/Bogota.

## Hechos ejecutados

La sesión autenticada REKOL08 confirmó administración de la organización. Se trasladaron los once repositorios de la tabla mediante la API de transferencia de GitHub, sin recrearlos. Se comprobó el propietario nuevo, la visibilidad pública y la conservación de las referencias Git previas, antes de los commits de documentación. Para AnalisisCuant se comparó la rama principal con el clon previo.

La organización ya contenía koha-laboratorio privado antes de esta intervención. No se trasladó de nuevo, no se editó y no se intervino ninguna VM ni producción.

| Repositorio | Visibilidad | Alcance y pendientes |
| --- | --- | --- |
| [BIBLIONOVA](https://github.com/BIBLIOTECAS-AREANDINA/BIBLIONOVA) | Público | Tablero de 12 proyectos y vínculo documental con CIBIC 2026; no identifica una VM CIBIC. |
| [Generador-ndice-H](https://github.com/BIBLIOTECAS-AREANDINA/Generador-ndice-H) | Público | HTML/JS; Excel/CSV, índice h/g/i10; SheetJS y Chart.js por CDN. Validación con datos ficticios pendiente. |
| [BibliometriX](https://github.com/BIBLIOTECAS-AREANDINA/BibliometriX) | Público | HTML/JS; Scopus/WoS y Chart.js; workflow Jekyll existente. Validación de indicadores pendiente. |
| [digitk-cargue-repositorio](https://github.com/BIBLIOTECAS-AREANDINA/digitk-cargue-repositorio) | Público | Plantilla Apps Script con formulario y procesador; configuración productiva externa. |
| [Digitek_sistema_repositorio](https://github.com/BIBLIOTECAS-AREANDINA/Digitek_sistema_repositorio) | Público | Variantes v1/v2 Apps Script de Digitk; comparar con digitk-cargue-repositorio antes de consolidar. |
| [reunir-ill-system](https://github.com/BIBLIOTECAS-AREANDINA/reunir-ill-system) | Público | Apps Script para préstamo interbibliotecario y presentación web; producción declarada en README, no probada aquí. |
| [Ruta-informacional-](https://github.com/BIBLIOTECAS-AREANDINA/Ruta-informacional-) | Público | Guía de ciencia abierta; HTML/JS, QRCode.js y recursos externos. |
| [aulas-inteligentes-gems](https://github.com/BIBLIOTECAS-AREANDINA/aulas-inteligentes-gems) | Público | Instrucciones de 8 Gems y taller Areandina; no acredita creación o acceso a esos Gems. |
| [chatbot](https://github.com/BIBLIOTECAS-AREANDINA/chatbot) | Público | Librín: Express, Groq y n8n local; Pages no ejecuta el backend. Pruebas de servicio pendientes. |
| [Seleciones-con-sentido](https://github.com/BIBLIOTECAS-AREANDINA/Seleciones-con-sentido) | Público | Apps Script y panel bibliográfico sanitizados; falta vista Index según README. No desplegable completo todavía. |
| [AnalisisCuant](https://github.com/BIBLIOTECAS-AREANDINA/AnalisisCuant) | Público | HTML/JS; estadísticas y Chart.js. Revisar aproximaciones antes de uso académico formal. |

## Dependencias y alcance de la verificación

Se revisaron README, árboles y archivos de código actuales; webhooks registrados: ninguno en los once repositorios revisados. Se revisó configuración Pages: sin dominio personalizado. BibliometriX conserva un workflow Jekyll. Las referencias detectadas a Pages y repositorios trasladados se actualizaron sin alterar atribuciones personales.

La exploración de patrones comunes de credenciales en los archivos actuales revisados no produjo coincidencias. No es una auditoría exhaustiva del historial ni certifica ausencia de secretos. No se cargaron imágenes de VM, bases, respaldos ni archivos de configuración privados.

GitHub redirige las direcciones de repositorios transferidos, pero no las páginas de GitHub Pages. Es necesario actualizar el QR histórico de CIBIC, enlaces impresos, marcadores e integraciones externas. No se recrearon repositorios en REKOL08 con los nombres antiguos porque anularía las redirecciones Git.

## Agentes y servicios

- BiblioNova documenta Suite Intellectus: Astra_Biblio, MentorMind, LexBot Constitucional, Asesor de Ciencia Abierta y ATLAS. El tablero contiene enlaces externos; su existencia en el tablero no comprueba acceso, configuración ni funcionamiento actual.
- aulas-inteligentes-gems documenta ocho asistentes de un taller; validar propietarios, conocimientos cargados, permisos y casos de prueba en Gemini.
- Librín utiliza en el código actual Groq (`GROQ_API_KEY`, modelo configurado `llama-3.3-70b-versatile`) y n8n en localhost:5678. Su README histórico mencionaba Anthropic. El traslado no publica su backend ni configura claves.
- Digitk tiene dos repositorios de variantes relacionadas. Mantenerlos diferenciados hasta revisar versión vigente, funcionalidades y despliegue institucional.

## Organización y accesos

Se observaron tres miembros: REKOL08, andreapuma y MiguelRomeroSaavedra. No había equipos en la organización. Había dos invitaciones pendientes; los detalles y comprobaciones de identidad se conservan en el anexo local de gestión, sin publicar correos personales. No se cambiaron miembros, roles ni invitaciones.

## Koha, CIBIC e infraestructura

La VM o recurso llamado CIBIC sigue sin identificar. BiblioNova acredita relación documental con CIBIC 2026, no equivalencia con la VM Koha. Las rutas de oficina del mensaje de continuidad no existen en este equipo. La carpeta local histórica de Koha conserva antecedentes más antiguos y no sustituye al checkpoint de GitHub.

El último commit observado de Koha fue `9369e7ba0ff2ae7b27b8961f6f7883fe76ab18b7`, del diagnóstico T25. No se verificó el estado vivo del laboratorio ni se confirmó aquí el avance del chat de recuperación del PC de oficina.

La continuidad recibida propone 6 vCPU / 32 GB / 500 GB SSD, sin GPU inicial. El README privado de Koha también cita una ficha posterior con 12 vCPU / 64 GB / 1 TB y GPU opcional, además de alternativa piloto de 32 GB. Son versiones por conciliar con TI y las partes interesadas; no acreditan aprobación, entrega o capacidad validada. HTTPS, respaldo restaurable, monitoreo y responsabilidades operativas siguen pendientes de acuerdo y comprobación.

## Perfil institucional creado

Se creó el repositorio público [.github](https://github.com/BIBLIOTECAS-AREANDINA/.github) y se publicó [profile/README.md](https://github.com/BIBLIOTECAS-AREANDINA/.github/blob/main/profile/README.md), con directorio de proyectos y guía inicial de colaboración. Commit: `44d7b0758a261020651524982cfcd8ba7816bc06`. La revisión editorial institucional sigue abierta.

## Verificación de Pages

Los nueve sitios que ya tenían Pages respondieron HTTP 200 en su dominio institucional después del traslado. Esta verificación no acredita una prueba funcional completa ni ejecutó backend, solicitudes, correos ni cambios en servicios productivos.

| Sitio | Resultado observado |
| --- | --- |
| [BIBLIONOVA](https://bibliotecas-areandina.github.io/BIBLIONOVA/) | HTTP 200 |
| [Generador-ndice-H](https://bibliotecas-areandina.github.io/Generador-ndice-H/) | HTTP 200 |
| [BibliometriX](https://bibliotecas-areandina.github.io/BibliometriX/) | HTTP 200 |
| [Digitek_sistema_repositorio](https://bibliotecas-areandina.github.io/Digitek_sistema_repositorio/) | HTTP 200 |
| [reunir-ill-system](https://bibliotecas-areandina.github.io/reunir-ill-system/) | HTTP 200 |
| [Ruta-informacional-](https://bibliotecas-areandina.github.io/Ruta-informacional-/) | HTTP 200 |
| [aulas-inteligentes-gems](https://bibliotecas-areandina.github.io/aulas-inteligentes-gems/) | HTTP 200 |
| [chatbot](https://bibliotecas-areandina.github.io/chatbot/) | HTTP 200 |
| [AnalisisCuant](https://bibliotecas-areandina.github.io/AnalisisCuant/) | HTTP 200 |

Los repositorios digitk-cargue-repositorio y Seleciones-con-sentido no tenían Pages: no se les creó un despliegue. Digitek_sistema_repositorio publica documentación; eso no ejecuta sus scripts. Pages de Librín tampoco ejecuta Express/n8n.

## Planner y cierre

Después de que el usuario completó el inicio de sesión, se localizó el plan exacto **Innovación**, depósito **BIBLIONOVA**. Se revisaron sus 19 tareas previas, incluidas cinco completadas, antes de crear nuevas. Se conservaron las tareas existentes de transferencia, documentación Koha, VM CIBIC, perfil de organización y accesos. Se añadieron seis frentes faltantes: inventario general, documentación BiblioNova/CIBIC y QR, agentes/dependencias, conciliación TI, validación funcional y cierre conjunto.

Los cuatro correos institucionales del usuario se comprobaron individualmente en el selector de asignaciones de Planner. Se asignaron inventario y cierre a Miguel; documentación BiblioNova/CIBIC a Manuela; agentes e infraestructura a Cristian; validación a Andrea. Se conservaron responsables existentes en las demás tareas. Son responsabilidades operativas y no acreditan cargos. Las notas distinguen objetivo, colaboradores, estado real, dependencias, lista de comprobación, aceptación y enlaces de evidencia. Los enlaces concretos y la correspondencia de correos se conservan en el anexo local para evitar publicar información de gestión interna.

La tarea de transferencia quedó En curso. No se marcó como completada ninguna tarea: las revisiones humanas y pruebas funcionales siguen pendientes. No se inventaron fechas acordadas. No se cambiaron miembros, invitaciones ni roles de GitHub; el segundo owner está pendiente de decisión e identidad confirmada.

## Pendientes reales y exclusiones

- Resolver correspondencia entre cuentas GitHub y correos institucionales; aceptar las dos invitaciones pendientes. En Planner sí se verificaron las cuatro identidades.
- Actualizar QR y enlaces externos históricos; validar casos funcionales y entornos de despliegue. Las nuevas URLs web responden, pero eso no acredita operación completa.
- Comparar variantes Digitk; completar Index faltante de Seleciones-con-sentido antes de declararlo completo; probar Librín y sus dependencias autorizadas.
- Identificar recurso CIBIC; conciliar versiones de la solicitud TI y coordinar recuperación de Koha con el trabajo del PC de oficina. El estado vivo de la VM no se comprobó aquí.
- Revisar otros privados de colecciones y respaldos institucionales sin trasladar datos en bloque. No se trasladaron respaldos personales ni generales, discos o bases.
- puesto-prestamo-voz se excluyó: su README vigente del 13-nov lo redefine como asistente personal. reformateador-normas, dashboard-gen y estadincho-gen-v5 permanecen en la cuenta personal hasta confirmar pertenencia al ecosistema. No se trasladó toda la cuenta.
- Revisión y aceptación de la documentación por las cuatro partes interesadas.


## Seguimiento de pruebas funcionales

Se ejecutaron 27 casos sobre las versiones fuente identificadas de índice H, BibliometriX y las dos variantes de Digitk: 20 PASS y 7 FAIL. Ver [informe, defectos, resultados esperados/obtenidos y ejecutor](pruebas/2026-11-13/README.md). Los servicios de Google fueron simulados en memoria; no se actuó sobre producción. Las pruebas de interfaz/exportación y la integración aislada de Digitk siguen pendientes. Este avance no completa la validación funcional.
