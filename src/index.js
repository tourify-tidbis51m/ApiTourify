const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//Rutas controladores
const userRoute = require("./routes/users");
const locationRoute = require("./routes/locations");

//middleware
app.use(express.urlencoded({ extender: false }));
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/locations", locationRoute);

app.get("/", async (req, res) => {
  try {
    res.send("API FUNCIONANDO APARENTEMENTE");
  } catch (err) {
    res.status();
  }
});

//mongodb connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("---CONEXION A MONGODB SATISFACTORIA---"))
  .catch((error) => console.error(error));

app.listen(port, () =>
  console.log("--- SERVER MONTADO CORRECTAMENTE EN EL PUERTO", port, "---")
);
