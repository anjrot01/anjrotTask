const passport = require("passport");
const Usuarios = require("../models/Usuarios");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const crypto = require("crypto");
const bcrypt = require("bcrypt-nodejs");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios"
});

// Función para revisar si el usuario está logueado o no
exports.usuarioAutenticado = (req, res, next) => {
  // Si el usuario está autenticado pasa
  if (req.isAuthenticated()) {
    return next();
  }

  // Si no está autenticado no dejarlo pasar
  res.redirect("/iniciar-sesion");
};

// Función para cerrar sesión
exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};

// Genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
  // verificar q el usuario existe
  const { email } = req.body;
  const usuario = await Usuarios.findOne({ where: { email } });

  // Si no existe el usuario
  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("reestablecer");
  }

  // Si usuario existe
  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expiracion = Date.now() + 3600000;

  await usuario.save();

  // url reset
  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

  // Envia el correo con el token
  await enviarEmail.enviar({
    usuario,
    subject: "Password Reset",
    resetUrl,
    archivo: "reestablecer-password"
  });

  // terminar el proceso
  req.flash("correcto", "Se envió un mensaje a tu correo");
  res.redirect("/iniciar-sesion");
};

exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token
    }
  });

  // Si no existe el usuario
  if (!usuario) {
    req.flash("error", "No valido");
    res.redirect("/reestablecer");
  }

  // Formulario para generar el password
  res.render("resetPassword", {
    nombrePagina: "Restablecer Constraseña"
  });
};

// Cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
  // Verifica el token valido y la fecha de expiración
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
      expiracion: {
        [Op.gte]: Date.now()
      }
    }
  });

  // verificamos si el usuario existe
  if (!usuario) {
    req.flash("error", "No Valido");
    res.redirect("/reestablecer");
  }

  // hashear el password
  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  // guardamos el nuevo password
  await usuario.save();

  req.flash("correcto", "Tu password se ha modificado correctamente");
  res.redirect("/iniciar-sesion");
};
