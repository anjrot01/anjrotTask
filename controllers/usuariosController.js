const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../handlers/email");

exports.formCrearCuenta = async (req, res) => {
  res.render("crearCuenta", {
    nombrePagina: "Crear cuenta en Anjrot Tasks"
  });
};

exports.formIniciarSesion = async (req, res) => {
  const { error } = res.locals.mensajes;

  res.render("iniciarSesion", {
    nombrePagina: "Iniciar Sesión en Anjrot Tasks",
    error
  });
};

exports.crearCuenta = async (req, res) => {
  // Leer los datos
  const { email, password } = req.body;

  try {
    // Crear el usuario
    await Usuarios.create({
      email,
      password
    });

    // Crear una URL para confirmar
    const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

    // Crear el objeto Usuario
    const usuario = {
      email
    };

    // Enviar Email
    await enviarEmail.enviar({
      usuario,
      subject: "Confirma tu cuenta Anjrot Tasks",
      confirmarUrl,
      archivo: "confirmar-cuenta"
    });

    // redirigir al usuario
    req.flash("correcto", "Enviamos un correo, confirma tu cuenta");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash("error", error.errors.map(error => error.message));

    res.render("crearCuenta", {
      mensajes: req.flash(),
      nombrePagina: "Crear cuenta en Anjrot Tasks",
      email,
      password
    });
  }
};

exports.formRestablecerPassword = (req, res) => {
  res.render("reestablecer", {
    nombrePagina: "Reestablecer tu Contraseña"
  });
};

// Cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      email: req.params.correo
    }
  });

  // si no existe el usuario
  if (!usuario) {
    req.flash("error", "No valido");
    res.redirect("/crear-cuenta");
  }

  usuario.activo = 1;
  await usuario.save();

  req.flash("correcto", "Cuenta activada correctamente");
  res.redirect("/iniciar-sesion");
};
