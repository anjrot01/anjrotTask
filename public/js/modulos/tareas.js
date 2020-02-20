import Swal from "sweetalert2";
import axios from "axios";
import { actualizarAvance } from "../funciones/avance";

const tareas = document.querySelector(".listado-pendientes");

if (tareas) {
  tareas.addEventListener("click", e => {
    if (e.target.classList.contains("fa-check-circle")) {
      const icono = e.target;
      const idTarea = icono.parentElement.parentElement.dataset.tarea;

      // request hacia /tareas/:id
      const url = `${location.origin}/tareas/${idTarea}`;

      // Actualizo el icono de la tarea si fue compleatada
      axios.patch(url, { idTarea }).then(function(respuesta) {
        if (respuesta.status == 200) {
          icono.classList.toggle("completo");
          actualizarAvance();
        }
      });
    }

    // borro la tarea
    if (e.target.classList.contains("fa-trash")) {
      const tareaHTML = e.target.parentElement.parentElement,
        idTarea = tareaHTML.dataset.tarea;

      Swal.fire({
        title: "Deseas Borrar este tarea?",
        text: "Una tarea eliminiada no se puede recuperar",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, Borrar",
        cancelButtonText: "No, Cancelar"
      }).then(result => {
        if (result.value) {
          // Enviar el delete por medio de Axios
          const url = `${location.origin}/tareas/${idTarea}`;

          // el metodo delete de axios requiere params para pasar los datos
          axios.delete(url, { params: { idTarea } }).then(function(respuesta) {
            if (respuesta.status === 200) {
              // eliminar el nodo
              tareaHTML.parentElement.removeChild(tareaHTML);

              Swal.fire("Tarea Eliminada", respuesta.data, "success");
            }

            actualizarAvance();
          });
        }
      });
    }
  });
}

export default tareas;
