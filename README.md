▪ El propósito de esta actividad es evaluar los siguientes Indicadores de Logro:
o 1.1. Analiza patrones de arquitectura y sus combinaciones, identificando aquellos que mejor se ajustan a los requerimientos del
cliente, demostrando su capacidad para aplicar soluciones adaptadas a contextos específicos.
Subdirección de Diseño Instruccional
Interna
Pasos a seguir en la actividad:
• Análisis de Requerimientos: A partir del caso práctico, como una aplicación de e-commerce con requerimientos específicos, los equipos
deberán analizarlos y justificar el uso de una arquitectura de microservicios frente a una monolítica.
• Diseño del Microservicio: Cada equipo diseñará un microservicio que resuelva uno de los requerimientos asignados. Deberán definir el
dominio del servicio, las entradas y salidas esperadas, y un modelo de datos simple.
• Implementación Práctica: Usando Java (Spring Boot) o Django (Django Rest Framework), los equipos crearán un prototipo funcional del
microservicio. El servicio debe incluir al menos dos endpoints básicos, como:
o GET /productos: Retorna una lista de productos en formato JSON.
o POST /productos: Permite agregar un nuevo producto (simulación).
• Pruebas y Validación: Los equipos probarán su microservicio utilizando herramientas como Postman o navegadores web, verificando que los
endpoints funcionen correctamente y cumplan con los requerimientos definidos

Contexto del Cliente:

 

ShopSmart es una plataforma de comercio electrónico que ha ganado popularidad rápidamente debido a su enfoque en ofrecer productos diversos y accesibles. Sin embargo, este crecimiento acelerado ha revelado limitaciones críticas en su arquitectura tecnológica actual, que se basa en un sistema monolítico. Estas limitaciones han comenzado a impactar negativamente la experiencia del cliente y la eficiencia operativa, generando un llamado urgente a modernizar su infraestructura.


Problemas Clave Identificados:

    Gestión de Inventario
    El sistema actual carece de sincronización eficiente entre múltiples almacenes, lo que genera desajustes en los niveles de stock.
    Es común que productos marcados como disponibles en el catálogo en línea no lo estén en el inventario real, lo que lleva a cancelaciones y frustración del cliente.
    Necesitan una solución que permita actualizaciones en tiempo real y que sea capaz de escalar con el crecimiento de nuevos almacenes.
    Procesamiento de Pedidos
    Durante eventos de alto tráfico, como promociones y festivales de compras, el sistema monolítico enfrenta latencias elevadas y caídas frecuentes.
    El flujo de procesamiento de pagos y la gestión de envíos necesitan una optimización para reducir tiempos de respuesta y evitar cuellos de botella.
    Requieren dividir responsabilidades en servicios especializados para garantizar la fiabilidad durante picos de demanda.
    Servicio a Usuarios
    La plataforma actual no puede ofrecer personalización avanzada, como recomendaciones basadas en el historial de compras o un soporte proactivo.
    Buscan un módulo dedicado que permita un mejor manejo de la información del cliente, soporte rápido y personalizado, y un incremento en la fidelización.

Objetivo de la Modernización:

    Con esta solución, espera:

    Mejorar la escalabilidad y el rendimiento.
    Incrementar la disponibilidad de servicios críticos.
    Introducir flexibilidad para desarrollar e implementar nuevas funcionalidades de manera independiente.