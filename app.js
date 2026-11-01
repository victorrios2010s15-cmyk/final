window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
        appId: "839c031a-c293-45f1-ab97-3e03e752c901",
        safari_web_id: "",
        notifyButton: {
            enable: false,
        },
    });
});

const evaluaciones = [
  {
    id: "mat_1",
    fecha: "2026-11-03",
    materia: "Castellano",
    tipo: "Exposicion",
    descripcion:
      "Expociosion grupo de la tesis sobre el Cap 1.",
    criterio:
      "Lamina nada mas.",
  },
  {
    id: "fis_1",
    fecha: "2026-11-03",
    materia: "Orientacion",
    tipo: "Expocision",
    descripcion: "Exposicion sobre los metodos anticonceptivos.",
    criterio: "Lamina con IA.",
  },
  {
    id: "his_1",
    fecha: "2026-11-12",
    materia: "CRP",
    tipo: "Examen",
    descripcion: "Los circulos",
    criterio:
      "A cuaderno cerrado.",
  },
];

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((reg) => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  });
}

function obtenerFechaLocal() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - offset * 60 * 1000).toISOString().split("T");
}

function verificarCambiosLocales() {
  const stringActual = JSON.stringify(evaluaciones);
  const stringAnterior = localStorage.getItem("cronograma_cache");

  if (stringAnterior && stringAnterior !== stringActual) {
    const listaAnterior = JSON.parse(stringAnterior);
    let tituloNotif = "";
    let cuerpoNotif = "";

    if (evaluaciones.length > listaAnterior.length) {
      const nueva = evaluaciones.find(
        (e) => !listaAnterior.some((a) => a.id === e.id),
      );
      if (nueva) {
        tituloNotif = "🆕 Nueva Evaluación Añadida";
        cuerpoNotif = `${nueva.materia}: ${nueva.tipo} el ${nueva.fecha}`;
      }
    } else if (evaluaciones.length < listaAnterior.length) {
      const eliminada = listaAnterior.find(
        (a) => !evaluaciones.some((e) => e.id === a.id),
      );
      if (eliminada) {
        tituloNotif = "🗑️ Evaluación Cancelada";
        cuerpoNotif = `Se eliminó la prueba de ${eliminada.materia}`;
      }
    } else {
      evaluaciones.forEach((ev) => {
        const ant = listaAnterior.find((a) => a.id === ev.id);
        if (ant && JSON.stringify(ant) !== JSON.stringify(ev)) {
          tituloNotif = "🔄 Modificado";
          cuerpoNotif = `Cambios en ${ev.materia} (${ev.fecha})`;
        }
      });
    }

    if (
      tituloNotif &&
      "serviceWorker" in navigator &&
      Notification.permission === "granted"
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active.postMessage({
          type: "PUSH_CAMBIO",
          titulo: tituloNotif,
          cuerpo: cuerpoNotif,
        });
      });
    }
  }
  localStorage.setItem("cronograma_cache", stringActual);
}

function renderTimeline() {
  const container = document.getElementById("timeline");
  const alertBanner = document.getElementById("global-alert");
  const alertText = document.getElementById("global-alert-text");

  const hoyStr = obtenerFechaLocal();
  const hoy = new Date(hoyStr);

  let evaluacionesUrgentes = [];

  verificarCambiosLocales();

  evaluaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  container.innerHTML = "";

  evaluaciones.forEach((ev) => {
    const fechaEv = new Date(ev.fecha);
    const diferenciaTiempo = fechaEv - hoy;
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return;

    const esUrgente = diasRestantes <= 2;
    if (esUrgente) {
      evaluacionesUrgentes.push(
        `${ev.materia} (${diasRestantes === 0 ? "Hoy" : diasRestantes === 1 ? "Mañana" : "En 2 días"})`,
      );

      if (
        "serviceWorker" in navigator &&
        Notification.permission === "granted"
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.active.postMessage({
            type: "PUSH_LOCAL",
            materia: ev.materia,
            dias: diasRestantes,
          });
        });
      }
    }

    const partesFecha = ev.fecha.split("-");
    const fechaFormateada = `${partesFecha}/${partesFecha}/${partesFecha}`;

    let textoDias = `Faltan ${diasRestantes} días`;
    if (diasRestantes === 0) textoDias = "¡Es Hoy!";
    if (diasRestantes === 1) textoDias = "Es Mañana";

    const card = document.createElement("div");
    card.className = `card ${esUrgente ? "urgent" : ""}`;
    card.innerHTML = `
            <div class="card-header">
                <div class="meta-info">
                    <span class="date-badge">${fechaFormateada}</span>
                    <h2 class="subject-title">${ev.materia}</h2>
                </div>
                <span class="type-tag">${ev.tipo}</span>
            </div>
            <div class="countdown-text">${textoDias}</div>
            <div class="card-details">
                <div class="detail-block">
                    <div class="detail-label">¿De qué trata?</div>
                    <div class="detail-value">${ev.descripcion}</div>
                </div>
                <div class="detail-block">
                    <div class="detail-label">¿Cómo es la evaluación?</div>
                    <div class="detail-value">${ev.criterio}</div>
                </div>
            </div>
        `;

    card.addEventListener("click", () => {
      card.classList.toggle("active");
    });

    container.appendChild(card);
  });

  if (evaluacionesUrgentes.length > 0) {
    alertText.innerHTML = `<strong>ALERTA DE EVALUACIÓN:</strong> Tienes entregas críticas pronto: ${evaluacionesUrgentes.join(", ")}. Revisa los temarios de inmediato.`;
    alertBanner.style.display = "flex";
  } else {
    alertBanner.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", renderTimeline);
