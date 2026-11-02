const evaluaciones = [
  {
    id: "mat_1",
    fecha: "2026-11-03",
    materia: "Castellano",
    tipo: "Exposicion",
    descripcion: "Expocision, grupo de la tesis sobre el Cap 1.",
    criterio: "Lamina nada mas.",
  },
  {
    id: "fis_1",
    fecha: "2026-11-04",
    materia: "Orientacion",
    tipo: "Expocision",
    descripcion: "Exposicion sobre los metodos anticonceptivos.",
    criterio: "Lamina con IA.",
  },
  {
    id: "his_1",
    fecha: "2026-11-03",
    materia: "CRP",
    tipo: "Formato Cajetin",
    descripcion: "Circulos",
    criterio: "Los circulos a cudaerno cerrado, en el cual son todos los circulos vistos en clase.",
  },
  {
    id: "his_2",
    fecha: "2026-11-05",
    materia: "CS de la Tierra",
    tipo: "Mapa Mental",
    descripcion: "Placas Tectonicas",
    criterio: "Mapa mental en clase sobre todo lo visto referente al tema, en el cual se traen todos los materiales, se incia en el salon y termina en el (no acepta fuera del salon).",
  },
];

// 1. Registro corregido hacia el Service Worker de Firebase
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("firebase-messaging-sw.js").then((reg) => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  });
}

function obtenerFechaLocal() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
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
        registration.showNotification(tituloNotif, {
          body: cuerpoNotif,
          icon: "/favicon.ico"
        });
      });
    }
  }
  localStorage.setItem("cronograma_cache", stringActual);
}

function renderTimeline() {
    sincronizarConNubeSegura();
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

      // 2. Control de Notificación de 2 días (Para no repetirla mil veces)
      const claveNotif = `notificado_2dias_${ev.id}_${ev.fecha}`;
      const yaNotificado = localStorage.getItem(claveNotif);

      if (
        diasRestantes === 2 && 
        !yaNotificado &&
        "serviceWorker" in navigator &&
        Notification.permission === "granted"
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(`⚠️ Evaluación en 2 días: ${ev.materia}`, {
            body: `Recuerda: ${ev.tipo} (${ev.descripcion}). Criterio: ${ev.criterio}`,
            icon: "/favicon.ico"
          });
          // Guardamos marca en la memoria local para enviarla una sola vez por evaluación
          localStorage.setItem(claveNotif, "true");
        });
      }
    }

    const partesFecha = ev.fecha.split("-");
    const fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;

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

// Función segura para sincronizar con la nube sin romper la página
function sincronizarConNubeSegura() {
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      evaluaciones.forEach((ev) => {
        db.collection("evaluaciones").doc(ev.id).set(ev, { merge: true })
          .catch((error) => {
            console.log("Aviso de sincronización offline:", error);
          });
      });
    }
  } catch (e) {
    console.log("Firestore no está inicializado todavía, usando modo local.");
  }
}

// Registrar el token del dispositivo en Firestore para las notificaciones en la nube
if (typeof messaging !== 'undefined' && typeof db !== 'undefined') {
  messaging.getToken({ vapidKey: 'BK-dzHKqZUPt0Mgc1eyqzhrbF6ib78_gfLTvDGGz6QjYwVgtAV7qXUFcfaFKN-yyNDfNklvja7TOP5VeHbZz_rs' })
    .then((currentToken) => {
      if (currentToken) {
        // Guardar o actualizar el token en la colección "tokens" de Firestore
        db.collection("tokens").doc(currentToken).set({
          token: currentToken,
          dispositivo: "Tecno Spark 10C",
          actualizado: new Date()
        })
        .then(() => {
          console.log("¡Token del dispositivo registrado en la nube con éxito!");
        })
        .catch((error) => {
          console.error("Error al guardar el token en Firestore:", error);
        });
      } else {
        console.log("No se encontró un token de registro disponible.");
      }
    })
    .catch((err) => {
      console.log("Error al obtener el token de mensajería: ", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  let fechaActual = new Date();
  let mesActual = fechaActual.getMonth();
  let anioActual = fechaActual.getFullYear();

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  function renderizarCalendario() {
    const contenedorDias = document.getElementById("calendar-days");
    const textoMesAnio = document.getElementById("calendar-month-year");
    if (!contenedorDias || !textoMesAnio) return;

    contenedorDias.innerHTML = "";
    textoMesAnio.textContent = `${meses[mesActual]} ${anioActual}`;

    // Primer día del mes y total de días
    const primerDiaIndex = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();

    // Espacios vacíos previos al primer día de la semana
    for (let i = 0; i < primerDiaIndex; i++) {
      const divVacio = document.createElement("div");
      divVacio.style.background = "transparent";
      divVacio.style.cursor = "default";
      contenedorDias.appendChild(divVacio);
    }

    // Dibujar los días del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const divDia = document.createElement("div");
      divDia.textContent = dia;
      
      // Opcional: Resaltar el día actual
      const hoy = new Date();
      if (dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()) {
        divDia.style.border = "2px solid #00d2ff";
      }

      contenedorDias.appendChild(divDia);
    }
  }

  // Botones para cambiar de mes
  const btnPrev = document.getElementById("prev-month");
  const btnNext = document.getElementById("next-month");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      mesActual--;
      if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
      }
      renderizarCalendario();
    });

    btnNext.addEventListener("click", () => {
      mesActual++;
      if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
      }
      renderizarCalendario();
    });
  }

  // Inicializar calendario al cargar
  renderizarCalendario();
});

document.addEventListener("DOMContentLoaded", () => {
  let fechaActual = new Date();
  let mesActual = fechaActual.getMonth();
  let anioActual = fechaActual.getFullYear();
  let fechasEvaluaciones = [];

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Inicializar Firestore (asumiendo que 'db' ya está disponible o lo inicializas aquí)
  const db = firebase.firestore();

  // Escuchar las evaluaciones en tiempo real desde Firestore
  db.collection("evaluaciones").onSnapshot((snapshot) => {
    fechasEvaluaciones = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fecha) {
        fechasEvaluaciones.push(data.fecha); 
      }
    });
    renderizarCalendario();
  });

  function renderizarCalendario() {
    const contenedorDias = document.getElementById("calendar-days");
    const textoMesAnio = document.getElementById("calendar-month-year");
    if (!contenedorDias || !textoMesAnio) return;

    contenedorDias.innerHTML = "";
    textoMesAnio.textContent = `${meses[mesActual]} ${anioActual}`;

    const primerDiaIndex = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();

    // Espacios vacíos para alinear el primer día de la semana
    for (let i = 0; i < primerDiaIndex; i++) {
      const divVacio = document.createElement("div");
      divVacio.style.background = "transparent";
      divVacio.style.cursor = "default";
      contenedorDias.appendChild(divVacio);
    }

    // Dibujar los días del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const divDia = document.createElement("div");
      divDia.textContent = dia;

      const mesFormateado = String(mesActual + 1).padStart(2, '0');
      const diaFormateado = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesFormateado}-${diaFormateado}`;

      // Si la fecha coincide con una evaluación, se pinta de fucsia
      if (fechasEvaluaciones.includes(fechaClave)) {
          divDia.classList.add("tiene-evaluacion");
      }

      // Resaltar el día actual con un borde azul
      const hoy = new Date();
      if (dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()) {
        divDia.style.border = "2px solid #00d2ff";
      }

      contenedorDias.appendChild(divDia);
    }
  }

  // Botones para cambiar de mes
  const btnPrev = document.getElementById("prev-month");
  const btnNext = document.getElementById("next-month");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      mesActual--;
      if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
      }
      renderizarCalendario();
    });

    btnNext.addEventListener("click", () => {
      mesActual++;
      if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
      }
      renderizarCalendario();
    });
  }

  // Inicializar calendario al cargar
  renderizarCalendario();
});