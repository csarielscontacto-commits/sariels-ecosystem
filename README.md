<!-- README en Español -->
# 📊 Sariel's Ecosystem - Sistema Centralizado de Gestión de Ventas

## 🎯 Descripción General

Sistema de gestión de ventas en tiempo real con **sincronización centralizada**. Todas las ventas de todos los vendedores se reflejan automáticamente en un dashboard central único, permitiendo monitoreo en tiempo real.

## 🌟 Características Principales

### ✨ Sistema Centralizado
- **Una única fuente de verdad**: Todas las ventas convergen en un dashboard central
- **Sincronización automática cada 5 segundos**
- **Sin dependencias de vendedores individuales**: El dashboard funciona independientemente
- **Sincronización bidireccional**: Los datos se actualizan en todos los dispositivos

### 📈 Dashboard Central (`dashboard-central.html`)
- 📊 Gráficas de ventas en tiempo real
- 📅 Análisis de últimos 7 días
- ⏰ Distribución por horas
- 💰 Ingresos totales y por vendedor
- 🎯 Progreso de meta diaria
- 👥 Análisis de vendedores
- 📋 Tabla de últimas 10 ventas
- 🔄 Auto-actualización cada 3 segundos
- 💾 Exportación de datos a JSON

### 📝 Registro de Ventas (`registro-ventas-centralizado.html`)
- ✍️ Formulario optimizado para cada vendedor
- 📱 Interfaz responsive para dispositivos móviles
- 🔄 Cambio dinámico de vendedor
- 📊 Estadísticas individuales del vendedor
- ✅ Sincronización automática con dashboard central
- 🌀 Indicador visual de estado de sincronización
- 💾 Almacenamiento local con respaldo
- 🔢 Contador simple de transacciones por cliente (sin niveles)
- 🪙 Activación automática de "Emitir NFT" al llegar a 12 transacciones por cliente
- ✅ Estado de NFT de utilidad con soporte de canje (`canjeado`)

### ⚙️ Sistema de Sincronización
- **Base de datos centralizada**: GitHub Gist como servidor
- **LocalStorage como cache**: Funciona sin conexión
- **Sincronización automática**: Cada 5 segundos
- **Fallback inteligente**: Usa cache si el servidor no está disponible
- **Eventos en tiempo real**: Comunicación entre ventanas

## 🚀 Acceso Rápido

### 📌 URLs Principales
- **Dashboard Central**: `dashboard-central.html`
- **Registrar Venta**: `registro-ventas-centralizado.html`

### 🌐 Acceso Online
- **Dashboard**: https://csarielscontacto-commits.github.io/sariels-ecosystem/dashboard-central.html
- **Registro**: https://csarielscontacto-commits.github.io/sariels-ecosystem/registro-ventas-centralizado.html

## 💰 Configuración de Precios

El precio está **centralizado en `config.js`**:

```javascript
const CONFIG = {
    PRECIO_UNITARIO: 75,    // Pesos mexicanos
    MONEDA: 'MXN',
    METAS: {
        DIARIA: 10000,      // Meta diaria
        SEMANAL: 70000,     // Meta semanal
        MENSUAL: 300000     // Meta mensual
    }
};
```

### ✅ Ventajas del sistema centralizado:
- ✏️ Cambiar precio una sola vez
- 🔄 Se actualiza automáticamente en todo el sistema
- 📊 El dashboard refleja los cambios al instante

## 📁 Archivos del Sistema

### Archivos HTML (Interfaz)
| Archivo | Descripción |
|---------|-------------|
| `dashboard-central.html` | Dashboard principal con gráficas |
| `registro-ventas-centralizado.html` | Formulario para registrar ventas |
| `index.html` | Página de inicio (heredada) |

### Archivos JavaScript (Lógica)
| Archivo | Descripción |
|---------|-------------|
| `config.js` | Configuración centralizada |
| `base-datos-centralizada.js` | Sistema de sincronización y BD |

## 🔧 Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│   VENDEDOR 1         VENDEDOR 2         │
│  (Registro Ventas)  (Registro Ventas)   │
│   Local Storage      Local Storage      │
└──────────┬──────────────────┬───────────┘
           │                  │
           └──────────┬───────┘
                      │ (Sincronización cada 5s)
                      ↓
        ┌─────────────────────────────┐
        │  BASE DE DATOS CENTRALIZADA │
        │    (GitHub Gist JSON)       │
        │   - Todas las ventas        │
        │   - Estado actual           │
        │   - Estadísticas            │
        └─────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │   DASHBOARD CENTRAL         │
        │  (Auto-actualización cada   │
        │       3 segundos)           │
        │   - Gráficas en tiempo real │
        │   - Estadísticas            │
        │   - Monitoreo de meta       │
        └─────────────────────────────┘
```

## 📊 Flujo de Datos

### 1. Registro de Venta
```javascript
Vendedor registra venta
    ↓
Se guarda en LocalStorage local
    ↓
Se registra en BD centralizada
    ↓
Se actualiza contador por cliente (sin niveles)
    ↓
Si cliente llega a transacción 12 se habilita "Emitir NFT"
    ↓
Se dispara evento 'ventaRegistrada'
    ↓
Dashboard se actualiza automáticamente
```

### 2. Sincronización
```javascript
Cada 5 segundos:
    1. Se obtienen ventas del servidor
    2. Se envían ventas nuevas del vendedor
    3. Se actualiza caché local
    4. Se dispara evento 'sincronizacionCompleta'
```

## 🎨 Interfaz del Dashboard

### Métricas Principales
- 💰 **Ingreso Hoy**: Total de ingresos del día actual
- 🎯 **Meta Diaria**: Progreso hacia la meta diaria
- 📈 **Total Ventas**: Número total de ventas registradas
- ⏰ **Última Sincronización**: Hora de última actualización

### Gráficas
- 📊 **Ventas por Hora**: Distribución horaria del día
- 👥 **Ventas por Vendedor**: Comparativa entre vendedores

### Tabla de Ventas
- Últimas 10 ventas registradas
- Información completa de cada venta
- Badges de vendedor y método de pago

## 🔐 Almacenamiento de Datos

### LocalStorage
```javascript
{
    "ventas_centralizadas": [...],     // Array de ventas
    "cache_dashboard": [...],          // Cache de servidor
    "vendedor_actual": "vendedor_1",   // Vendedor actual
    "ultimo_sincronismo": "2026-06-16T12:00:00.000Z"
}
```

### Servidor Central (GitHub Gist)
```json
{
    "ventas": [...],
    "ultimaActualizacion": "2026-06-16T12:00:00.000Z",
    "totalVentas": 42,
    "ingresoTotal": 315000
}
```

## ⚡ Características Técnicas

### Sincronización Inteligente
- ✅ Verifica disponibilidad del servidor
- ✅ Usa cache local si hay desconexión
- ✅ Reintentos automáticos
- ✅ Timeout de 10 segundos

### Eventos Globales
```javascript
// Sincronización completada
window.addEventListener('sincronizacionCompleta', () => {
    // Actualizar UI
});

// Nueva venta registrada
window.addEventListener('ventaRegistrada', () => {
    // Actualizar contadores
});

// Cambios desde otro tab
window.addEventListener('cambiosDesdeOtroTab', () => {
    // Actualizar datos
});
```

### Comunicación Multi-Tab
- Los datos se sincronizan automáticamente entre tabs
- El evento `storage` detecta cambios en otros tabs
- Ideal para monitoreo simultáneo

## 📱 Responsive Design
- ✅ Funciona en desktop
- ✅ Funciona en tablets
- ✅ Funciona en móviles
- ✅ Optimizado para conexiones lentas

## 🔄 Cómo Usar

### Para Vendedores
1. Ir a `registro-ventas-centralizado.html`
2. Sistema asigna un ID automático
3. Opcionalmente cambiar vendedor con botón "Cambiar Vendedor"
4. Llenar formulario de venta
5. ¡Presionar "Registrar Venta"!
6. La venta se sincroniza automáticamente

### Para Gerentes/Admin
1. Ir a `dashboard-central.html`
2. Ver todas las ventas en tiempo real
3. Monitorear metas diarias
4. Analizar tendencias por vendedor y hora
5. Exportar datos con botón "Descargar Datos"

## 🚀 Características Futuras

- 🔐 Autenticación de usuarios
- 📊 Reportes avanzados por período
- 💳 Integración con pasarelas de pago
- 📧 Notificaciones por email
- 📲 App móvil nativa
- 🗄️ Base de datos real (Firebase, MongoDB)
- 📈 Análisis predictivo

## 📞 Soporte

Para preguntas o problemas, revisa la consola del navegador (F12) para ver los logs detallados.

## 📝 Notas Técnicas

- Construido con **HTML5, CSS3, JavaScript moderno**
- Gráficas con **Chart.js**
- Sin dependencias externas (excepto Chart.js)
- Compatible con **navegadores modernos**
- Funciona **offline con fallback**

---

**Versión**: 1.0.0  
**Última actualización**: 2026-06-16  
**Autor**: Sariel's Ecosystem Team
