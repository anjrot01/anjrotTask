import Swal from "sweetalert2";
import axios from "axios";

const btnEliminar = document.querySelector("#eliminar-proyecto");

if (btnEliminar) {
  btnEliminar.addEventListener("click", e => {
    const urlProyecto = e.target.dataset.proyectoUrl;

    Swal.fire({
      title: "Deseas Borrar este proyecto?",
      text: "Un proyecto eliminiado no se puede recuperar",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Borrar",
      cancelButtonText: "No, Cancelar"
    }).then(result => {
      // enviar petición a axios

      const url = `${location.origin}/proyectos/${urlProyecto}`;

      axios
        .delete(url, { params: { urlProyecto } })
        .then(function(respuesta) {
          console.log(respuesta);

          // return;
          if (result.value) {
            Swal.fire("Proyecto Eliminado!", respuesta.data, "success");
          }
          setTimeout(() => {
            window.location.href = "/";
          }, 5000);
        })
        .catch(() => {
          Swal.fire({
            type: "error",
            title: "Hubo un error",
            text: "No se pudo eliminar el proyecto"
          });
        });

      // redireccionar al inicio
    });
  });
}

export default btnEliminar;
