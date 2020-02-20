const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice"); // Permite agregar estilos líneales al email
const htmlToText = require("html-to-text"); // Crea una versión del html a puro texto
const util = require("util"); // Permite q una función q no soporte async await lo haga
const emailConfig = require("../config/email");

let transport = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user, // generated ethereal user
    pass: emailConfig.pass // generated ethereal password
  }
});

// generar html
const generarHTML = (archivo, opciones = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
  return juice(html);
};

exports.enviar = async opciones => {
  const html = generarHTML(opciones.archivo, opciones);
  const text = htmlToText.fromString(html);
  let opcionesEmail = {
    from: "Anjrot Tasks <no-reply@anjrot.cl>",
    to: opciones.usuario.email,
    subject: opciones.subject,
    text,
    html
  };
  const enviarEmail = util.promisify(transport.sendMail, transport);
  return enviarEmail.call(transport, opcionesEmail);
};
