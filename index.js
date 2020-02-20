const express = require("express");
const routes = require("./routes");
const path = require("path");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

// helpers
const helpers = require("./helpers");

// crear la conexión a la bd
const db = require("./config/db");
require("./models/Proyectos");
require("./models/Tareas");
require("./models/Usuarios");

// db.authenticate() Solo autentica la conexión
db.sync()
  .then(() => console.log("conectado al servidor"))
  .catch(error => console.log(error));

// crear un app en express
const app = express();

// Donde cargar los archivos estáticos
app.use(express.static("public"));

// habilitar pug (las vistas)
app.set("view engine", "pug");

// Habilitar Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

// Agregamos express Validator a toda la aplicacion
app.use(expressValidator());

// Añadir la carpeta de las vistas
app.set("views", path.join(__dirname, "./views"));

// Agregar flash messages
app.use(flash());

app.use(cookieParser());

// Sesiones nos perminten navegar entre distintas páginas sin volver a autenticarnos
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// pasar el vardump a toda la aplicación
app.use((req, res, next) => {
  res.locals.vardump = helpers.vardump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = { ...req.user } || null;
  next();
});

// Aprendiendo middleware
app.use((req, res, next) => {
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  next();
});

app.use("/", routes());

app.listen(3000, () => console.log("Escuchando en el puerto 3000"));
