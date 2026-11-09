
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

exports.eliminarProyecto = onCall(
    {region: "us-central1"},
    async (request) => {
      const proyectoId = request.data?.proyectoId;

      if (typeof proyectoId !== "string" ||
          !/^[A-Za-z0-9]{20}$/.test(proyectoId)) {
        throw new HttpsError(
            "invalid-argument",
            "El identificador del proyecto no es válido.",
        );
      }

      await getFirestore()
          .collection("proyectos")
          .doc(proyectoId)
          .delete();

      return {mensaje: "Proyecto eliminado correctamente"};
    },
);

exports.eliminarTarea = onCall(
  {region: "us-central1"},
  async (request) => {
    const tareaId = request.data?.tareaId;

    if (
      typeof tareaId !== "string" ||
      !/^[A-Za-z0-9]{20}$/.test(tareaId)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "El identificador de la tarea no es válido."
      );
    }

    await getFirestore()
      .collection("tareas")
      .doc(tareaId)
      .delete();

    return {
      mensaje: "Tarea eliminada correctamente"
    };
  }
);
