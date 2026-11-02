const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { token, titulo, mensaje } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Falta el token de registro del dispositivo.' });
    }

    const payload = {
      notification: {
        title: titulo || "Nueva Evaluación",
        body: mensaje || "Tienes una tarea o evaluación pendiente."
      }
    };

    await admin.messaging().sendToDevice(token, payload);
    
    return res.status(200).json({ success: true, message: "Notificación push enviada correctamente." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};