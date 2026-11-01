
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request));
});

self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'PUSH_LOCAL') {
        let mensaje = `Faltan ${event.data.dias} días para la entrega.`;
        if (event.data.dias === 0) mensaje = '¡Atención! La evaluación se entrega hoy.';
        if (event.data.dias === 1) mensaje = 'La evaluación es mañana.';

        self.registration.showNotification(`Alerta Escolar: ${event.data.materia}`, {
            body: mensaje,
            vibrate:200,
            tag: `alerta-${event.data.materia}`,
            requireInteraction: true
        });
    }

    if (event.data.type === 'PUSH_CAMBIO') {
        self.registration.showNotification(event.data.titulo, {
            body: event.data.cuerpo,
            vibrate:200,
            tag: 'cambio-cronograma',
            requireInteraction: true
        });
    }
});
