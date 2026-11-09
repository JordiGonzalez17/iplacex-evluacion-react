import React, { useEffect, useRef, useState } from "react";
import SimpleReactValidator from "simple-react-validator";
import axios from "axios";

import {
  addDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";

function Tareas() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [tareas, setTareas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [, actualizar] = useState(0);

  const validator = useRef(
    new SimpleReactValidator({
      messages: {
        required: "Este campo es obligatorio.",
        regex: "Debes ingresar una fecha válida."
      }
    })
  );

  // Cargar tareas desde Firestore
  useEffect(() => {
    async function cargarTareas() {
      try {
        const resultado = await getDocs(
          collection(db, "tareas")
        );

        const tareasGuardadas = resultado.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data()
          })
        );

        setTareas(tareasGuardadas);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
        alert("No se pudieron cargar las tareas.");
      } finally {
        setCargando(false);
      }
    }

    cargarTareas();
  }, []);

  // Guardar tarea utilizando Axios y Firestore
  async function guardarTarea(evento) {
    evento.preventDefault();

    if (!validator.current.allValid()) {
      validator.current.showMessages();
      actualizar((valor) => valor + 1);
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await axios.get(
        "https://jsonplaceholder.typicode.com/todos/1"
      );

      const prioridadSugerida = respuesta.data.completed
        ? "Baja"
        : "Alta";

      const datosTarea = {
        nombre: nombre.trim(),
        fechaLimite: fechaLimite,
        prioridad: prioridadSugerida
      };

      const referencia = await addDoc(
        collection(db, "tareas"),
        datosTarea
      );

      const nuevaTarea = {
        id: referencia.id,
        ...datosTarea
      };

      setTareas((anteriores) => [
        ...anteriores,
        nuevaTarea
      ]);

      setNombre("");
      setFechaLimite("");
      setMostrarFormulario(false);
      validator.current.hideMessages();

      alert("Tarea guardada correctamente en Firestore.");
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert("No se pudo guardar la tarea.");
    } finally {
      setGuardando(false);
    }
  }

  // Eliminar tarea mediante Firebase Functions
  async function eliminarTarea(id) {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta tarea?"
    );

    if (!confirmar) {
      return;
    }

    setEliminandoId(id);

    try {
      const funcionEliminar = httpsCallable(
        functions,
        "eliminarTarea"
      );

      await funcionEliminar({
        tareaId: id
      });

      // Actualizar la lista después de eliminar
      setTareas((anteriores) =>
        anteriores.filter((tarea) => tarea.id !== id)
      );

      alert("Tarea eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea.");
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px"
      }}
    >
      <h1>Gestión de Tareas</h1>

      <button
        onClick={() =>
          setMostrarFormulario(!mostrarFormulario)
        }
      >
        {mostrarFormulario
          ? "Cancelar"
          : "Agregar Tarea"}
      </button>

      {mostrarFormulario && (
        <form onSubmit={guardarTarea} noValidate>
          <h2>Nueva tarea</h2>

          <div style={{ marginBottom: "15px" }}>
            <label>Nombre de la tarea:</label>
            <br />

            <input
              type="text"
              value={nombre}
              onChange={(evento) =>
                setNombre(evento.target.value)
              }
            />

            {validator.current.message(
              "nombre",
              nombre,
              "required"
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Fecha límite:</label>
            <br />

            <input
              type="date"
              value={fechaLimite}
              onChange={(evento) =>
                setFechaLimite(evento.target.value)
              }
            />

            {validator.current.message(
              "fechaLimite",
              fechaLimite,
              "required|regex:^\\d{4}-\\d{2}-\\d{2}$"
            )}
          </div>

          <button
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : "Guardar Tarea"}
          </button>
        </form>
      )}

      <h2>Lista de tareas</h2>

      {cargando ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p>No hay tareas pendientes</p>
      ) : (
        tareas.map((tarea) => (
          <React.Fragment key={tarea.id}>
            <div
              style={{
                padding: "15px",
                borderBottom: "1px solid #ccc"
              }}
            >
              <strong>{tarea.nombre}</strong>

              <p>
                Fecha límite: {tarea.fechaLimite}
              </p>

              <p>
                Prioridad sugerida: {tarea.prioridad}
              </p>

              <button
                onClick={() =>
                  eliminarTarea(tarea.id)
                }
                disabled={eliminandoId !== null}
              >
                {eliminandoId === tarea.id
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </React.Fragment>
        ))
      )}
    </div>
  );
}

export default Tareas;