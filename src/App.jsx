import { useState } from "react";
import Proyectos from "./caso1/Proyectos";
import Tareas from "./caso2/Tareas.jsx";

function App() {
  const [casoActual, setCasoActual] = useState(1);

  return (
    <div>
      <nav style={{ padding: "20px", textAlign: "center" }}>
        <button onClick={() => setCasoActual(1)}>
          Caso 1: Proyectos
        </button>

        <button
          onClick={() => setCasoActual(2)}
          style={{ marginLeft: "10px" }}
        >
          Caso 2: Tareas
        </button>
      </nav>

      {casoActual === 1 ? (
        <Proyectos />
      ) : (
        <Tareas />
      )}
    </div>
  );
}

export default App;
