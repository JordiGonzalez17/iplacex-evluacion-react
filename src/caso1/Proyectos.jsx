import { useEffect, useRef, useState, Fragment } from "react";
import axios from "axios";
import SimpleReactValidator from "simple-react-validator";

import { collection, getDocs, addDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [, forzarActualizacion] = useState(0);

  // Validaciones del formulario
  const validator = useRef(
    new SimpleReactValidator({
      messages: {
        required: "Este campo es obligatorio.",
        min: "La descripción debe tener al menos 10 caracteres."
      },
      autoForceUpdate: {
        forceUpdate: () => forzarActualizacion((valor) => valor + 1)
      }
    })
  );

  // Cargar proyectos desde Firestore
  useEffect(() => {
    async function cargarProyectos() {
      try {
        const resultado = await getDocs(collection(db, "proyectos"));

        const lista = resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data()
        }));

        setProyectos(lista);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    }

    cargarProyectos();
  }, []);

  // Guardar un proyecto utilizando Axios y Firestore
  async function guardarProyecto(evento) {
    evento.preventDefault();

    if (!validator.current.allValid()) {
      validator.current.showMessages();
      forzarActualizacion((valor) => valor + 1);
      return;
    }

    try {
      setCargando(true);

      // Obtener datos adicionales mediante Axios
      const respuesta = await axios.get(
        "https://jsonplaceholder.typicode.com/posts/1"
      );

      const nuevoProyecto = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        datosAxios: respuesta.data
      };

      // Guardar en Firestore
      const documento = await addDoc(
        collection(db, "proyectos"),
        nuevoProyecto
      );

      // Actualizar la lista
      setProyectos((lista) => [
        ...lista,
        {
          id: documento.id,
          ...nuevoProyecto
        }
      ]);

      // Limpiar formulario
      setNombre("");
      setDescripcion("");
      validator.current.hideMessages();
      setMostrarFormulario(false);

      alert("Proyecto guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      alert("No se pudo guardar el proyecto. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  }

  // Eliminar un proyecto utilizando Firebase Functions
  async function eliminarProyecto(id) {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este proyecto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const funcionEliminar = httpsCallable(
        functions,
        "eliminarProyecto"
      );

      await funcionEliminar({ proyectoId: id });

      // Quitar el proyecto de la lista
      setProyectos((lista) =>
        lista.filter((proyecto) => proyecto.id !== id)
      );

      alert("Proyecto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      alert("No se pudo eliminar el proyecto. Revisa la consola.");
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
      <h1>Gestión de Proyectos</h1>

      {/* Mostrar u ocultar formulario */}
      <button
        onClick={() =>
          setMostrarFormulario(!mostrarFormulario)
        }
      >
        {mostrarFormulario ? "Cancelar" : "Agregar Proyecto"}
      </button>

      {/* Formulario de proyectos */}
      {mostrarFormulario && (
        <form onSubmit={guardarProyecto}>
          <h2>Nuevo proyecto</h2>

          <div style={{ marginBottom: "15px" }}>
            <label>Nombre del proyecto:</label>
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
            <label>Descripción:</label>
            <br />

            <textarea
              value={descripcion}
              onChange={(evento) =>
                setDescripcion(evento.target.value)
              }
            />

            {validator.current.message(
              "descripcion",
              descripcion,
              "required|min:10"
            )}
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar Proyecto"}
          </button>
        </form>
      )}

      {/* Lista de proyectos */}
      <h2>Lista de proyectos</h2>

      {proyectos.length === 0 ? (
        <p>No hay proyectos</p>
      ) : (
        proyectos.map((proyecto) => (
          <Fragment key={proyecto.id}>
            <div
              style={{
                border: "1px solid #999",
                padding: "15px",
                marginBottom: "10px"
              }}
            >
              <h3>{proyecto.nombre}</h3>

              <p>{proyecto.descripcion}</p>

              <h4>Datos obtenidos mediante Axios</h4>

              <p>{proyecto.datosAxios?.title}</p>
              <p>{proyecto.datosAxios?.body}</p>

              <button
                onClick={() =>
                  eliminarProyecto(proyecto.id)
                }
              >
                Eliminar Proyecto
              </button>
            </div>
          </Fragment>
        ))
      )}
    </div>
  );
}

export default App;