# Explicación del Proyecto: Simulación de Semáforos con Redes de Petri

## Estructura del Proyecto

### 1. Archivo app.py (Flask Backend)
Este es el archivo principal que maneja toda la lógica del servidor utilizando Flask. Contiene:
- Clase PetriNet: Implementa la lógica de la red de Petri y los estados de los semáforos
- Rutas API: Endpoints para manejar estados, transiciones y guardar/cargar simulaciones
- Estados del semáforo:
  * Estado 1: Semáforos 1 y 2 (horizontales) en verde, Semáforo 3 (vertical) en rojo
  * Estado 2: Semáforos 1 y 2 en amarillo, Semáforo 3 en rojo
  * Estado 3: Semáforos 1 y 2 en rojo, Semáforo 3 en verde
  * Estado 4: Semáforos 1 y 2 en rojo, Semáforo 3 en amarillo

### 2. Archivos JavaScript (D3.js Frontend)
El archivo main.js contiene:
- Visualización de la red de Petri usando D3.js
- Animación de tokens y transiciones
- Manejo de eventos de usuario (inicio, pausa, reinicio)
- Actualización en tiempo real del estado de los semáforos

### 3. Archivos HTML/CSS
- index.html: Estructura de la página y elementos de la interfaz
- style.css: Estilos para los semáforos, red de Petri y controles

## Tecnologías Utilizadas

### Flask (Backend)
- Implementado en app.py
- Maneja las rutas API y la lógica del servidor
- Gestiona el estado de la red de Petri
- Procesa las peticiones del cliente
- Implementa el guardado y carga de simulaciones

### D3.js (Frontend)
- Implementado en main.js
- Dibuja la red de Petri interactiva
- Maneja las animaciones de tokens
- Actualiza la visualización en tiempo real
- Permite la interacción del usuario con la simulación

### Pillow (Procesamiento de Imágenes)
- Pendiente de implementar para:
  * Generar capturas de la simulación
  * Guardar estados de la red de Petri
  * Exportar visualizaciones

## Partes más Complejas del Proyecto

1. **Sincronización de Estados**
   - Mantener la coherencia entre el estado del backend y la visualización
   - Asegurar que las transiciones sean válidas según las reglas de la red de Petri
   - Coordinar los cambios de estado entre los tres semáforos

2. **Visualización con D3.js**
   - Implementar la lógica de dibujado de la red de Petri
   - Manejar las animaciones de tokens
   - Actualizar la interfaz en tiempo real

3. **Manejo de Estados**
   - Garantizar que los semáforos mantengan estados válidos
   - Implementar las transiciones correctamente
   - Manejar casos especiales y errores

## Funcionamiento de la Red de Petri

La red de Petri implementada representa:
- Plazas: Estados posibles de cada semáforo (rojo, amarillo, verde)
- Transiciones: Cambios válidos entre estados
- Tokens: Marcadores que indican el estado actual de cada semáforo

Las reglas de transición aseguran que:
1. Nunca haya estados contradictorios
2. Los semáforos pasen por amarillo antes de cambiar a rojo
3. Los semáforos horizontales (1 y 2) estén sincronizados
4. El semáforo vertical (3) esté en estado opuesto a los horizontales

## Mejoras Futuras Posibles

1. Implementar visualización de vehículos en movimiento
2. Agregar más estadísticas de la simulación
3. Implementar temporizadores configurables para los estados
4. Agregar más intersecciones y patrones de tráfico
5. Implementar la funcionalidad de Pillow para guardar imágenes

## Notas Técnicas

- El proyecto utiliza un patrón MVC (Modelo-Vista-Controlador)
- La comunicación cliente-servidor se realiza mediante API REST
- Los estados se mantienen en memoria y pueden ser persistidos en archivos JSON
- La visualización es responsive y se adapta a diferentes tamaños de pantalla