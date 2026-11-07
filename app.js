const evaluaciones = [
  {
    id: "01",
    fecha: "2026-11-09",
    materia: "Matematicas",
    tipo: "Examen",
    descripcion: "Determinante de 2do Grado",
    criterio: "Examen sobre en todo lo visto en clase, formulas abajo.",
  },
    {
    id: "02",
    fecha: "2026-11-09",
    materia: "Quimica",
    tipo: "Taller",
    descripcion: "El Carbono",
    criterio: "Taller sobre todo lo que tiene q ver con el carbono.",
  },
    {
    id: "03",
    fecha: "2026-11-11",
    materia: "Fisica",
    tipo: "Examen",
    descripcion: "Campo Electrico",
    criterio: "Examen en pareja, todo lo visto sobre el campo electrico.",
  },
    {
    id: "05",
    fecha: "2026-11-13",
    materia: "Musica",
    tipo: "Taller Grupal",
    descripcion: "El Pentagrama",
    criterio: "Taller en grupo de 5 o 6 integrantes, en el cual se debe traer: papel bond, regla y marcadores.",
  },
  {
    id: "04",
    fecha: "2026-11-12",
    materia: "CS de la Tierra",
    tipo: "Mapa Mental",
    descripcion: "Placas Tectónicas",
    criterio: "Mapa mental en clase sobre todo lo visto referente al tema. De 3 o 4 personas.",
  },
];

function obtenerFechaLocal() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CUENTA REGRESIVA FIN DE AÑO ---
  const fechaFinCurso = new Date("2026-12-05T23:59:59").getTime();
  
  function actualizarContador() {
    const ahora = new Date().getTime();
    const distancia = fechaFinCurso - ahora;
    const contadorDiv = document.getElementById("countdown-timer");

    if (distancia > 0) {
      const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

      document.getElementById("days").textContent = String(dias).padStart(2, '0');
      document.getElementById("hours").textContent = String(horas).padStart(2, '0');
      document.getElementById("minutes").textContent = String(minutos).padStart(2, '0');
      document.getElementById("seconds").textContent = String(segundos).padStart(2, '0');
    } else {
      contadorDiv.innerHTML = `
        <div style="grid-column: span 4; background: linear-gradient(135deg, #06b6d4, #d946ef); padding: 20px; border-radius: 12px; color: white; text-align: center; box-shadow: 0 0 20px rgba(217, 70, 239, 0.5);">
          <h3 style="font-size: 1.4rem; margin-bottom: 8px;">🎓 ¡MISIÓN CUMPLIDA! 🎓</h3>
          <p style="font-size: 0.9rem; margin-bottom: 12px; line-height: 1.4;">
            ¡Al fin libres de tareas, carpetas y profes! Sobrevivimos a las desveladas y exámenes de 5to año. ¡A dormir por fin!
          </p>
          <button id="btn-certificado" class="secondary-btn" style="background: #ffffff; color: #0f111a; font-weight: bold;">
            Ver Certificado de Supervivencia 📜
          </button>
        </div>
      `;
      const btnCertificado = document.getElementById("btn-certificado");
      if (btnCertificado) {
        btnCertificado.addEventListener("click", () => {
          alert("📜 CERTIFICADO OFICIAL: Se certifica que este estudiante aguantó todo el 5to año con éxito absoluto. ¡Disfruta tus merecidas vacaciones!");
        });
      }
    }
  }
  
  setInterval(actualizarContador, 1000);
  actualizarContador();

  // --- 2. FRASES SARCÁSTICAS ESTUDIANTILES ---
  const frases = [
    "“Deja para mañana lo que puedas hacer hoy. att:Vitico”",
    "“Si el director dice que eres el futuro del pais, procupate por el pais. att:Leandro”",
    "“El que estudia duda de sus conocimientos. att:Noel.”",
  ];
  const quoteText = document.getElementById("quote-text");
  document.getElementById("new-quote-btn").addEventListener("click", () => {
    const aleatoria = frases[Math.floor(Math.random() * frases.length)];
    quoteText.textContent = aleatoria;
  });

// --- 3. BLOC DE NOTAS RÁPIDAS Y MODAL ---
  const notesArea = document.getElementById("quick-notes");
  const notesContainer = document.getElementById("notes-container");
  const modalOverlay = document.getElementById("custom-modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  function mostrarModalAlerta() {
    if (modalOverlay) {
      modalOverlay.classList.add("active");
    }
  }

  function ocultarModalAlerta() {
    if (modalOverlay) {
      modalOverlay.classList.remove("active");
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", ocultarModalAlerta);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) ocultarModalAlerta();
    });
  }

  function cargarNotasGuardadas() {
    const notasGuardadas = JSON.parse(localStorage.getItem("mis_notas_tarjetas")) || [];
    notesContainer.innerHTML = "";

    notasGuardadas.forEach((textoNota, index) => {
      const tarjetaNota = document.createElement("div");
      tarjetaNota.className = "note-card-item";
      tarjetaNota.innerHTML = `
        <p>${textoNota}</p>
        <button class="delete-note-btn" data-index="${index}">Borrar</button>
      `;
      notesContainer.appendChild(tarjetaNota);
    });

    document.querySelectorAll(".delete-note-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        notasGuardadas.splice(idx, 1);
        localStorage.setItem("mis_notas_tarjetas", JSON.stringify(notasGuardadas));
        cargarNotasGuardadas();
      });
    });
  }

  const saveNotesBtn = document.getElementById("save-notes-btn");
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener("click", () => {
      const texto = notesArea.value.trim();
      if (texto === "") {
        mostrarModalAlerta();
        return;
      }

      const notasGuardadas = JSON.parse(localStorage.getItem("mis_notas_tarjetas")) || [];
      notasGuardadas.push(texto);
      localStorage.setItem("mis_notas_tarjetas", JSON.stringify(notasGuardadas));
      notesArea.value = "";
      cargarNotasGuardadas();
    });
  }

  cargarNotasGuardadas();

  // --- EVALUACIONES Y CRONOGRAMA ---
  const container = document.getElementById("timeline");
  const alertBanner = document.getElementById("global-alert");
  const alertText = document.getElementById("global-alert-text");

  const hoyStr = obtenerFechaLocal();
  const hoy = new Date(hoyStr);
  let evaluacionesUrgentes = [];

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
        `${ev.materia} (${diasRestantes === 0 ? "Hoy" : diasRestantes === 1 ? "Mañana" : "En 2 días"})`
      );
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

  // --- CALENDARIO ---
  let fechaActual = new Date();
  let mesActual = fechaActual.getMonth();
  let anioActual = fechaActual.getFullYear();
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechasEvaluaciones = evaluaciones.map(e => e.fecha);

  function renderizarCalendario() {
    const contenedorDias = document.getElementById("calendar-days");
    const textoMesAnio = document.getElementById("calendar-month-year");
    if (!contenedorDias || !textoMesAnio) return;

    contenedorDias.innerHTML = "";
    textoMesAnio.textContent = `${meses[mesActual]} ${anioActual}`;

    const primerDiaIndex = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();

    for (let i = 0; i < primerDiaIndex; i++) {
      const divVacio = document.createElement("div");
      divVacio.style.background = "transparent";
      divVacio.style.cursor = "default";
      contenedorDias.appendChild(divVacio);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const divDia = document.createElement("div");
      divDia.textContent = dia;

      const mesFormateado = String(mesActual + 1).padStart(2, '0');
      const diaFormateado = String(dia).padStart(2, '0');
      const fechaClave = `${anioActual}-${mesFormateado}-${diaFormateado}`;

      if (fechasEvaluaciones.includes(fechaClave)) {
          divDia.classList.add("tiene-evaluacion");
      }

      const hoyFecha = new Date();
      if (dia === hoyFecha.getDate() && mesActual === hoyFecha.getMonth() && anioActual === hoyFecha.getFullYear()) {
        divDia.style.border = "2px solid #00d2ff";
      }

      contenedorDias.appendChild(divDia);
    }
  }

  const btnPrev = document.getElementById("prev-month");
  const btnNext = document.getElementById("next-month");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      mesActual--;
      if (mesActual < 0) { mesActual = 11; anioActual--; }
      renderizarCalendario();
    });
    btnNext.addEventListener("click", () => {
      mesActual++;
      if (mesActual > 11) { mesActual = 0; anioActual++; }
      renderizarCalendario();
    });
  }

  renderizarCalendario();
});

// Registro de Service Worker para PWA Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registrado correctamente:', registration.scope);
      })
      .catch((error) => {
        console.log('Fallo al registrar el Service Worker:', error);
      });
  });
}