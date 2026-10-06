# 📦 MiniPOS - Sistema de Control para Negocios

Sistema de punto de venta (POS) y control de inventario diseñado para pequeños negocios y minimarkets. Funciona completamente desde el navegador web del celular con capacidades offline.

## ✨ Características Principales

### 📱 Escaneo de Códigos de Barras
- Escaneo en tiempo real usando la cámara del celular
- Soporte para códigos de barras estándar (EAN, UPC, etc.)
- Búsqueda manual de productos
- Agregar productos nuevos directamente desde el escaneo

### 🛒 Sistema de Ventas
- Agregar productos por escaneo o búsqueda manual
- Ajustar cantidades de productos en la venta
- Cálculo automático de totales
- Completar ventas con actualización automática de stock
- Historial completo de ventas

### 📋 Gestión de Inventario
- Agregar, editar y eliminar productos
- Seguimiento de stock en tiempo real
- Organización por categorías
- Valor total del inventario
- Búsqueda y filtrado de productos

### ⚠️ Alertas Inteligentes
- Notificaciones de stock bajo
- Alertas visuales en productos con poco inventario
- Stock mínimo configurable
- Banner de advertencia en tiempo real

### 📊 Reportes
- Ventas del día
- Total de ingresos
- Promedio de venta
- Historial detallado de transacciones

### 💾 Persistencia de Datos
- Almacenamiento local en el dispositivo
- Funciona completamente offline
- Exportación e importación de datos en formato JSON
- Backup y restauración completa

### 📲 Progressive Web App (PWA)
- Instalable en el celular como aplicación nativa
- Funciona sin conexión a internet
- Actualizaciones automáticas
- Icono en la pantalla de inicio

## 🚀 Inicio Rápido

### 1. Acceder a la Aplicación
Simplemente abre `index.html` en el navegador de tu celular. Para la mejor experiencia:

```bash
# Si tienes Python instalado, puedes servir la aplicación localmente:
python -m http.server 8000

# O con Node.js:
npx http-server
```

Luego accede desde tu celular a `http://[tu-ip]:8000`

### 2. Instalar como PWA
1. Abre la aplicación en el navegador de tu celular
2. En el menú del navegador, selecciona "Agregar a la pantalla de inicio"
3. La aplicación se instalará como una app nativa

### 3. Cargar Datos de Ejemplo
1. Ve a la pestaña "Config" (⚙️)
2. Presiona "Cargar Productos de Ejemplo"
3. Se agregarán 10 productos de muestra para probar

### 4. Comenzar a Vender
1. Ve a la pestaña "Venta" (🛒)
2. Presiona "Iniciar Escaneo" y permite el acceso a la cámara
3. Escanea códigos de barras o busca productos manualmente
4. Ajusta cantidades si es necesario
5. Presiona "Completar Venta" cuando termines

## 📱 Uso de la Aplicación

### Pestaña: Venta 🛒
- **Iniciar Escaneo**: Activa la cámara para escanear códigos
- **Búsqueda Manual**: Escribe para buscar productos por nombre o código
- **Ajustar Cantidades**: Usa los botones + y - para modificar cantidades
- **Limpiar**: Elimina todos los productos de la venta actual
- **Completar Venta**: Finaliza la transacción y actualiza el stock

### Pestaña: Inventario 📋
- **Agregar Producto**: Crea un nuevo producto con código, nombre, precio y stock
- **Buscar**: Filtra productos por nombre, código o categoría
- **Editar**: Modifica información de productos existentes
- **Eliminar**: Quita productos del inventario
- **Ver Stock**: Observa alertas de stock bajo en tiempo real

### Pestaña: Reportes 📊
- **Estadísticas del Día**: Ventas totales, ingresos y promedio
- **Historial**: Lista completa de todas las ventas realizadas
- **Limpiar Historial**: Elimina el registro de ventas (precaución)

### Pestaña: Config ⚙️
- **Stock Mínimo**: Define el nivel de alerta para stock bajo
- **Exportar Datos**: Descarga un backup en formato JSON
- **Importar Datos**: Restaura datos desde un archivo de backup
- **Productos de Ejemplo**: Carga datos de prueba
- **Resetear Todo**: Elimina todos los datos (usa con precaución)

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsivo con variables CSS y animaciones
- **JavaScript**: Lógica de aplicación sin frameworks
- **html5-qrcode**: Librería para escaneo de códigos de barras
- **LocalStorage**: Persistencia de datos en el navegador
- **Service Workers**: Funcionalidad offline (PWA)
- **Manifest.json**: Configuración de PWA

## 💡 Características Técnicas

- ✅ Sin dependencias de frameworks pesados
- ✅ Funciona 100% offline
- ✅ Responsive design (móvil first)
- ✅ Almacenamiento local persistente
- ✅ PWA instalable
- ✅ Interfaz intuitiva y moderna
- ✅ Feedback visual y vibraciones
- ✅ Soporte para múltiples formatos de códigos
- ✅ Exportación/importación de datos

## 📝 Estructura del Proyecto

```
minipos/
├── index.html          # Página principal con toda la UI
├── styles.css          # Estilos completos de la aplicación
├── app.js              # Lógica principal (clase MiniPOS)
├── manifest.json       # Configuración PWA
├── service-worker.js   # Worker para funcionalidad offline
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Este archivo
```

## 🔒 Privacidad y Datos

- **Todos los datos se almacenan localmente** en tu dispositivo
- **No hay servidor backend**: Todo funciona en el navegador
- **No se envía información** a ningún servidor externo
- **Tú controlas tus datos**: Exporta e importa cuando quieras

## 🐛 Solución de Problemas

### La cámara no funciona
- Asegúrate de dar permisos de cámara al navegador
- Usa HTTPS o localhost (la API de cámara requiere contexto seguro)
- Verifica que tu dispositivo tenga cámara funcional

### Los datos se pierden
- No borres los datos del navegador
- Haz backups regulares con la función "Exportar Datos"
- Asegúrate de no usar modo incógnito

### La aplicación no se instala
- Verifica que tu navegador soporte PWA (Chrome, Edge, Safari recientes)
- Asegúrate de estar usando HTTPS
- Revisa que el manifest.json esté accesible

## 🚀 Próximas Mejoras Posibles

- [ ] Múltiples métodos de pago
- [ ] Descuentos y promociones
- [ ] Impresión de tickets
- [ ] Sincronización en la nube (opcional)
- [ ] Múltiples usuarios/cajeros
- [ ] Gráficos de ventas
- [ ] Integración con impresora de códigos de barras
- [ ] Modo oscuro
- [ ] Soporte multiidioma

## 📄 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y distribuirlo.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia, abre un issue o envía un pull request.

---

**Desarrollado con ❤️ para pequeños negocios**

Para soporte o preguntas, abre un issue en este repositorio.
