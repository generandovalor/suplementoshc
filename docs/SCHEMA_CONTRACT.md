# Schema Contract - Ganaclientes System / Suplementos HC

## Regla principal
El Sheet es la verdad del negocio. Se pueden cambiar precios, nombres, textos, imágenes, estados y orden sin tocar código, siempre que se mantengan los nombres de hojas y columnas estructurales.

## Hojas obligatorias
- config_sistema
- config_negocio
- categorias
- productos_core
- producto_detalle
- variantes_producto
- inventario_variantes
- combos_pro
- cross_selling
- hero_carrusel
- redes_sociales
- politicas o políticas

## Columnas estructurales mínimas
### config_sistema / config_negocio
- CLAVE
- VALOR

### categorias
- ID_CATEGORIAS
- CATEGORIA_GENERAL
- TIPO_OBJETIVO
- NOMBRE_CATEGORIA
- SLUG_CATEGORIA
- ESTADO

### productos_core
- ID_PRODUCTOS_CORE
- ID_CATEGORIAS
- ACTIVO
- SLUG
- NOMBRE
- MARCA
- DESCRIPCION_CORTA
- BENEFICIO_PRINCIPAL
- IMAGEN_PRINCIPAL_URL
- TIPO_CLIENTE
- USO
- PRECIO_BASE_COP

### producto_detalle
- ID_PRODUCTOS_CORE
- DESCRIPCION_LARGA

### variantes_producto
- ID_VARIANTES_PRODUCTO
- ID_PRODUCTOS_CORE
- TIPO_VARIACION
- VALOR_VARIACION
- PRECIO_COP_VARIANTE
- PRECIO_MAYORISTA_VARIANTE
- ACTIVO

### inventario_variantes
- ID_VARIANTES_PRODUCTO
- STOCK_ACTUAL

### combos_pro
- ID_COMBO
- SLUG
- NOMBRE_COMBO
- PRECIO_COMBO
- OBJETIVO_COMBO
- TIPO_CLIENTE
- ACTIVO

### cross_selling
- ID_PRODUCTOS_CORE
- PRODUCTO_SUGERIDO_ID
- ACTIVO

## Editables sin romper sistema
- precios
- nombres
- textos
- imágenes
- stocks
- combos
- cross selling
- banners
- datos del negocio
- políticas
