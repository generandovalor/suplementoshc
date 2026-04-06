# Ganaclientes System - Suplementos HC

Refactor base listo para usar, listo para desplegar y listo para crecer.

## Qué contiene
- `frontend/`: Vite + Tailwind + JS modular
- `netlify/functions/`: proxy al backend GAS, autenticación mayorista y sync
- `gas/`: backend modular orientado a snapshots, cache y rebuild automático
- `docs/SCHEMA_CONTRACT.md`: contrato estructural del Sheet
- `public/`: robots y sitemap base
- `.env.example`: variables reales para Netlify
- `netlify.toml`: configuración de build y redirects

## Decisiones principales
1. El frontend ya no expone la URL de GAS ni la clave mayorista.
2. La carga del catálogo se hace contra Netlify Functions.
3. El backend GAS prioriza cache, luego snapshot persistido, luego rebuild.
4. Se deja soporte para rebuild automático por cambios y full rebuild diario.
5. Se documenta el contrato del Sheet para futuros cambios comerciales sin tocar código.

## Variables reales en Netlify
Configura estas variables en Netlify:
- `GAS_DEPLOY_URL`
- `GAS_ADMIN_TOKEN`
- `WHOLESALE_ACCESS_CODE`
- `PUBLIC_SITE_URL` (opcional)

> Recomendación: mantén `WHOLESALE_ACCESS_CODE` alineado con `LOGIN MAYORISTA` del Sheet, pero nunca lo expongas al frontend.

## Despliegue
### Frontend + Functions en Netlify
1. Sube el proyecto a GitHub.
2. En Netlify importa el repo.
3. Usa el `netlify.toml` incluido.
4. Añade las variables de entorno del archivo `.env.example`.
5. Publica.

### Backend GAS
1. Crea un proyecto de Apps Script unido al Sheet.
2. Copia los archivos de `gas/`.
3. Reemplaza `SPREADSHEET_ID` y `DRIVE_FOLDER_ID` en `gas/Config.gs`.
4. Ejecuta `setupAutomation()` una vez para crear triggers.
5. Publica como web app y copia la URL a `GAS_DEPLOY_URL` en Netlify.

## Qué queda preparado
- slugs compartibles
- login mayorista seguro
- snapshots `init`, `catalogo`, `extra`, `all`
- más catálogos a futuro
- crecimiento a SEO más fuerte
- automatización de rebuild

## Pendientes útiles para siguiente iteración
- mover la lógica de productos avanzados a una estrategia comercial/legal definida
- generar sitemap dinámico por producto/slug
- agregar breadcrumbs y canonical por detalle
- enriquecer panel admin y logs persistentes en hojas dedicadas
