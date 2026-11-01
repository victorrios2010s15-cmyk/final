const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Se ejecuta automáticamente todos los días a las 8:00 AM
exports.revisarEvaluacionesAutomaticas = functions.pubsub
  .schedule("0 8 * * *")
  .timeZone("America/Caracas") // Tu zona horaria local
  .onRun(async (context) => {
    const db = admin.firestore();
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split("T")[0];

    try {
      // 1. Obtener las evaluaciones de Firestore
      const snapshot = await db.collection("evaluaciones").get();
      if (snapshot.empty) {
        console.log("No hay evaluaciones registradas.");
        return null;
      }

      // 2. Obtener los tokens de los dispositivos registrados
      const tokensSnapshot = await db.collection("tokens").get();
      const tokens = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push(doc.data().token);
      });

      if (tokens.length === 0) {
        console.log("No hay tokens de dispositivos registrados.");
        return null;
      }

      let mensajesEnviados = 0;

      // 3. Revisar cada evaluación
      snapshot.forEach(async (doc) => {
        const ev = doc.data();
        const fechaEval = new Date(ev.fecha);
        const fechaHoy = new Date(hoyStr);

        const diferenciaMs = fechaEval - fechaHoy;
        const diasRestantes = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));

        // Si faltan exactamente 2 días para la evaluación
        if (diasRestantes === 2) {
          const payload = {
            notification: {
              title: `⚠️ Evaluación en 2 días: ${ev.materia}`,
              body: `Recuerda: ${ev.tipo} - ${ev.descripcion}`,
            },
          };

          // Enviar la notificación nativa a los tokens registrados
          await admin.messaging().sendToDevice(tokens, payload);
          mensajesEnviados++;
        }
      });

      console.log(`Se enviaron alertas para ${mensajesEnviados} evaluaciones.`);
      return null;
    } catch (error) {
      console.error("Error al procesar las evaluaciones automáticas:", error);
      return null;
    }
  });

