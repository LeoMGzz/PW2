const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require("mysql2");


app.use(cors());
app.use(express.json({ limit: '100mb' }));



app.listen(3001, () => {
    console.log("Escuchando el servidor en el puerto 3001");
});

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos MySQL");
});

///////////////////Creacion Usuario////////////////////////////////////
app.post("/register", (req, res) => {
    const { email, username, password, birthdate, image } = req.body;

    console.log("Verificando si el correo o nombre de usuario ya están en uso...");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial." });
    }

    const today = new Date().toISOString().split("T")[0];
    if (birthdate > today) {
        return res.status(400).json({ message: "La fecha de nacimiento no puede ser mayor al día de hoy." });
    }

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");


db.query("CALL SP_UsuarioRegistro(?, ?, ?, ?, ?, @p_message, @p_status);", 
    [email, username, password, birthdate, imageBuffer], 
    (err) => {
        if (err) {
            console.error("Error ejecutando el procedimiento:", err);
            return res.status(500).json({ message: "Error en el servidor al registrar usuario" });
        }

        db.query("SELECT @p_message AS message, @p_status AS status;", (err, results) => {
            if (err) {
                console.error("Error obteniendo los valores de salida:", err);
                return res.status(500).json({ message: "Error al obtener el mensaje de salida del procedimiento" });
            }

            const output = results[0]; 
            res.status(output.status).json({ message: output.message });
        });
    }
);

});

////////////////Login Usuario////////////////////////
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT IdUsuario, Username, Email, Fecha_Nacimiento, Foto_Perfil, Rol, Estatus FROM usuarios WHERE Email = ? AND Contraseña = ?";
    db.query(sql, [email, password], (err, data) => {
        if (err) {
            console.error("Error en la consulta de login:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }

        if (data.length > 0) {
            const user = data[0];

            if (user.Estatus.trim().toLowerCase() !== "activo") {
                console.log(`Usuario deshabilitado: ${user.Username} - Estado: ${user.Estatus}`);
                return res.status(400).json({
                    message: "El usuario ha sido deshabilitado por un administrador o eliminado."
                });
            }

            res.json({
                message: "Encontrado",
                idUsuario: user.IdUsuario,
                username: user.Username,
                email: user.Email,
                fechaNacimiento: user.Fecha_Nacimiento,
                fotoPerfil: user.Foto_Perfil ? user.Foto_Perfil.toString("base64") : null, 
                rol: user.Rol,
                estatus: user.Estatus
            });
        } else {
            res.json({
                message: "No encontrado"
            });
        }
    });
});

/////////////////// Plataforma Registroo ////////////////////////
app.post("/plataformas/crear", (req, res) => {
    const { nombre, año_lanzamiento } = req.body;

    if (!nombre || !año_lanzamiento) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (!/^\d{4}$/.test(año_lanzamiento)) {
        return res.status(400).json({ message: "El año de lanzamiento debe ser un número de 4 dígitos" });
    }
    
    const año = parseInt(año_lanzamiento);
    if (año < 1901 || año > 2155) {
        return res.status(400).json({ message: "El año debe estar entre 1901 y 2155" });
    }

    const callProcedure = "CALL SP_PlataformaRegistro(?, ?)";

    db.query(callProcedure, [nombre, año_lanzamiento], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
        }

        res.status(200).json({ message: "Plataforma registrada con éxito" });
    });
});

/////////Plataformas Activas/////////////
app.get("/plataformas/activas", (req, res) => {
    const query = "SELECT IdPlataforma, Nombre, Año_Lanzamiento FROM plataformas WHERE Estatus = 'Activo'";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener plataformas activas:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }

        res.status(200).json(results);
    });
});

//////Plataforma Modificar////////////
app.put("/plataformas/editar/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, año_lanzamiento } = req.body;

    if (!nombre || !año_lanzamiento) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (!/^\d{4}$/.test(año_lanzamiento)) {
        return res.status(400).json({ message: "El año debe ser un número de 4 dígitos" });
    }

    const año = parseInt(año_lanzamiento);
    if (año < 1901 || año > 2155) {
        return res.status(400).json({ message: "El año debe estar entre 1901 y 2155" });
    }

    const sql = "CALL SP_PlataformaActualizar(?, ?, ?)";
    db.query(sql, [id, nombre, año], (err) => {
        if (err) {
            console.error("Error al actualizar la plataforma:", err);
            return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
        }
        res.status(200).json({ message: "Plataforma actualizada con éxito" });
    });
});

////////////Plataforma Eliminar/////////////
app.put("/plataformas/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const query = "CALL SP_PlataformaEliminar(?)";

    db.query(query, [id], (err) => {
        if (err) {
            console.error("Error al desactivar plataforma:", err);
            return res.status(500).json({ message: "Error al desactivar la plataforma" });
        }
        res.json({ message: "Plataforma desactivada con éxito" });
    });
});

/////Compañias Registrar///////////
app.post("/companias/crear", (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const callProcedure = "CALL SP_CompaniaRegistro(?)";
    db.query(callProcedure, [nombre], (err) => {
        if (err) {
            console.error("Error al registrar compañía:", err);
            return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
        }
        res.status(200).json({ message: "Compañía registrada con éxito" });
    });
});

////////Compañias Acticas////////
app.get("/companias/activas", (req, res) => {
    const query = "SELECT IdCompañia, Nombre FROM Compañias WHERE Estatus = 'Activo'";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener compañías activas:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }
        res.status(200).json(results);
    });
});

//////Compañias Modificar////////////////
app.put("/companias/editar/:id", (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const sql = "CALL SP_CompaniaActualizar(?, ?)";
    db.query(sql, [id, nombre], (err) => {
        if (err) {
            console.error("Error al editar compañía:", err);
            return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
        }
        res.status(200).json({ message: "Compañía editada con éxito" });
    });
});

/////Compañias Eliminar////////////
app.put("/companias/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const sql = "CALL SP_CompaniaEliminar(?)";

    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error al desactivar compañía:", err);
            return res.status(500).json({ message: "Error al desactivar la compañía" });
        }
        res.status(200).json({ message: "Compañía desactivada con éxito" });
    });
});

///////Categoria Registrar////////////
app.post("/categorias/crear", (req, res) => {
    const { nombre, descripcion } = req.body;
  
    if (!nombre || !descripcion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
  
    const query = "CALL SP_CategoriaRegistro(?, ?)";
    db.query(query, [nombre, descripcion], (err) => {
      if (err) {
        console.error("Error al registrar categoría:", err);
        return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
      }
      res.status(200).json({ message: "Categoría registrada con éxito" });
    });
  });
  
//////////Categorias Activas/////////////
app.get("/categorias/activas", (req, res) => {
    const query = "SELECT IdCategoria, Nombre, Descripcion FROM Categorias WHERE Estatus = 'Activo'";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener categorías:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      res.status(200).json(results);
    });
  });
  
//////Categorias Modificar///////
app.put("/categorias/editar/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
  
    if (!nombre || !descripcion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
  
    const query = "CALL SP_CategoriaActualizar(?, ?, ?)";
    db.query(query, [id, nombre, descripcion], (err) => {
      if (err) {
        console.error("Error al editar categoría:", err);
        return res.status(500).json({ message: err.sqlMessage || "Error en el servidor" });
      }
      res.status(200).json({ message: "Categoría editada con éxito" });
    });
  });
  
  ////////Categorias Eliminar///////////
  app.put("/categorias/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const query = "CALL SP_CategoriaEliminar(?)";
  
    db.query(query, [id], (err) => {
      if (err) {
        console.error("Error al desactivar categoría:", err);
        return res.status(500).json({ message: "Error al desactivar la categoría" });
      }
      res.status(200).json({ message: "Categoría desactivada con éxito" });
    });
  });

  ///////Videojuego Registro////////////
  app.post("/videojuegos/crear", (req, res) => {
    const {
      nombre,
      imagen,
      año_lanzamiento,
      age_rating,
      descripcion,
      categoria,
      desarrolladora,
      publicadora,
      plataformas
    } = req.body;
  
    if (!nombre || !imagen || !año_lanzamiento || !age_rating || !descripcion || !categoria || !desarrolladora || !publicadora || !plataformas.length) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }
  
    if (!/^\d{4}$/.test(año_lanzamiento) || año_lanzamiento < 1901 || año_lanzamiento > 2155) {
      return res.status(400).json({ message: "El año debe estar entre 1901 y 2155." });
    }
  
    const imageBuffer = Buffer.from(imagen.split(",")[1], "base64");
  
    db.query("CALL SP_VideojuegoRegistro(?, ?, ?, ?, ?, ?, ?, ?, @id_juego);", 
      [nombre, imageBuffer, año_lanzamiento, age_rating, descripcion, categoria, desarrolladora, publicadora], 
      (err) => {
      if (err) {
        console.error("Error al registrar videojuego:", err);
        return res.status(500).json({ message: err.sqlMessage || "Error al registrar videojuego." });
      }
  
      db.query("SELECT @id_juego AS id;", (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error al obtener ID del juego" });
        }
  
        const idJuego = result[0].id;
  
        const inserts = plataformas.map(idPlat => 
          new Promise((resolve, reject) => {
            db.query("CALL SP_VideojuegoPlataformaRegistro(?, ?)", [idJuego, idPlat], (err) => {
              if (err) reject(err);
              else resolve();
            });
          })
        );
  
        Promise.all(inserts)
          .then(() => res.status(200).json({ message: "Videojuego registrado con éxito" }))
          .catch(err => {
            console.error("Error al insertar plataformas:", err);
            res.status(500).json({ message: "Error al insertar plataformas" });
          });
      });
    });
  });
  
  ////Videojuegos Activos/////////////
  app.get("/videojuegos/activos", (req, res) => {
    const query = `
      SELECT 
        V.IdJuego,
        V.Nombre,
        V.Imagen,
        V.Año_Lanzamiento,
        V.Age_Rating,
        V.Descripcion,
        V.Categoria AS IdCategoria,
        C.Nombre AS CategoriaNombre,
        V.Desarrolladora AS IdDesarrolladora,
        CD.Nombre AS DesarrolladoraNombre,
        V.Publicadora AS IdPublicadora,
        CP.Nombre AS PublicadoraNombre,
        V.Rating,
        (
          SELECT COUNT(*) 
          FROM Reseñas R 
          WHERE R.Juego = V.IdJuego AND R.Estatus = 'Activo'
        ) AS Resenas,
        GROUP_CONCAT(P.IdPlataforma) AS PlataformaIDs,
        GROUP_CONCAT(P.Nombre SEPARATOR ', ') AS Plataformas
      FROM Videojuegos V
      JOIN Categorias C ON V.Categoria = C.IdCategoria
      JOIN Compañias CD ON V.Desarrolladora = CD.IdCompañia
      JOIN Compañias CP ON V.Publicadora = CP.IdCompañia
      JOIN Videojuegos_Plataformas VP ON V.IdJuego = VP.IdJuego
      JOIN Plataformas P ON VP.IdPlataforma = P.IdPlataforma
      WHERE V.Estatus = 'Activo'
      GROUP BY V.IdJuego;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener videojuegos activos:", err);
        return res.status(500).json({ message: "Error al consultar videojuegos" });
      }
  
      const juegosProcesados = results.map(juego => ({
        ...juego,
        Imagen: juego.Imagen ? juego.Imagen.toString("base64") : null,
        PlataformaIDs: juego.PlataformaIDs
          ? juego.PlataformaIDs.split(",").map(id => parseInt(id))
          : []
      }));
  
      res.json(juegosProcesados);
    });
  });
/////Videojuego Actualizara/////////////
app.put("/videojuegos/editar/:id", (req, res) => {
    const idJuego = req.params.id;
    const {
      nombre,
      imagen,
      año_lanzamiento,
      age_rating,
      descripcion,
      categoria,
      desarrolladora,
      publicadora,
      plataformas
    } = req.body;
  
    if (!nombre || !año_lanzamiento || !age_rating || !descripcion || !categoria || !desarrolladora || !publicadora || !plataformas.length) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }
  
    if (!/^\d{4}$/.test(año_lanzamiento) || año_lanzamiento < 1901 || año_lanzamiento > 2155) {
      return res.status(400).json({ message: "El año debe estar entre 1901 y 2155." });
    }
  
    if (!/^[0-9]+$/.test(age_rating)) {
      return res.status(400).json({ message: "El age rating debe ser un número." });
    }
  
    const imagenBuffer = imagen
      ? Buffer.from(imagen.split(",")[1], "base64")
      : null;
  
    db.query(
      "CALL SP_VideojuegoActualizar(?, ?, ?, ?, ?, ?, ?, ?)",
      [idJuego, nombre, año_lanzamiento, age_rating, descripcion, categoria, desarrolladora, publicadora],
      (err) => {
        if (err) return res.status(400).json({ message: err.sqlMessage });
  
        const actualizarImagen = imagenBuffer
          ? new Promise((resolve, reject) =>
              db.query(
                "CALL SP_VideojuegoActualizarImagen(?, ?)",
                [idJuego, imagenBuffer],
                (errImg) => (errImg ? reject(errImg) : resolve())
              )
            )
          : Promise.resolve();
  
        const eliminarPlataformas = new Promise((resolve, reject) =>
          db.query("CALL SP_VideojuegoPlataformaEliminar(?)", [idJuego], (errDel) =>
            errDel ? reject(errDel) : resolve()
          )
        );
  
        const insertarPlataformas = plataformas.map((idPlat) => {
          return new Promise((resolve, reject) =>
            db.query("CALL SP_VideojuegoPlataformaRegistro(?, ?)", [idJuego, idPlat], (err) =>
              err ? reject(err) : resolve()
            )
          );
        });
  
        Promise.all([actualizarImagen, eliminarPlataformas, ...insertarPlataformas])
          .then(() => res.json({ message: "Videojuego editado exitosamente" }))
          .catch((err) => {
            console.error("Error:", err);
            res.status(500).json({ message: "Error al procesar edición." });
          });
      }
    );
  });
  
  
  ///////Videojuegos Eliminar////////
  app.put("/videojuegos/eliminar/:id", (req, res) => {
    const idJuego = req.params.id;
  
    db.query("CALL SP_VideojuegoEliminar(?)", [idJuego], (err) => {
      if (err) {
        console.error("Error al desactivar videojuego:", err);
        return res.status(500).json({ message: "Error al desactivar videojuego" });
      }
  
      return res.status(200).json({ message: "Videojuego desactivado correctamente" });
    });
  });
  
  /////////Reseñas Crear///////////
  app.post("/resenas/crear", (req, res) => {
    const { usuario, juego, calificacion, descripcion } = req.body;
  
    if (!usuario || !juego || !calificacion || !descripcion.trim()) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
  
    const fecha = new Date().toISOString().split("T")[0];
  
    const sql = `CALL SP_ResenaCrear(?, ?, ?, ?, ?)`;
  
    db.query(sql, [usuario, juego, calificacion, descripcion, fecha], (err) => {
      if (err) {
        console.error("Error al guardar reseña:", err);
        return res.status(500).json({ message: "Error al registrar la reseña" });
      }
      res.status(200).json({ message: "Reseña enviada con éxito" });
    });
  });
  

/////Consultar Juego por ID (para reseñas)////////
app.get("/videojuegos/rating/:id", (req, res) => {
  const idJuego = req.params.id;

  const query = `
    SELECT 
      Rating,
      (
        SELECT COUNT(*) 
        FROM Reseñas 
        WHERE Juego = ? AND Estatus = 'Activo'
      ) AS Reviews
    FROM Videojuegos 
    WHERE IdJuego = ?
  `;

  db.query(query, [idJuego, idJuego], (err, results) => {
    if (err) {
      console.error("Error al obtener rating del videojuego:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Videojuego no encontrado" });
    }

    const { Rating, Reviews } = results[0];
    res.status(200).json({ rating: Rating, reviews: Reviews });
  });
});

////////Reseñas Activas///////////
app.get("/resenas/activas/:id", (req, res) => {
  const idJuego = req.params.id;

  const query = `
    SELECT 
      R.IdReseña,
      R.Rating,
      R.Comentario,
      R.Fecha_Reseña,
       R.Reseñador,
      U.Username,
      U.Foto_Perfil
    FROM Reseñas R
    JOIN Usuarios U ON R.Reseñador = U.IdUsuario
    WHERE R.Juego = ? AND R.Estatus = 'Activo'
    ORDER BY R.Fecha_Reseña DESC
  `;

  db.query(query, [idJuego], (err, results) => {
    if (err) {
      console.error("Error al obtener reseñas:", err);
      return res.status(500).json({ message: "Error al obtener reseñas" });
    }

    const reseñas = results.map(r => ({
      idReseña: r.IdReseña,
      rating: r.Rating,
      comentario: r.Comentario,
      fecha: r.Fecha_Reseña,
      username: r.Username,
      fotoPerfil: r.Foto_Perfil ? r.Foto_Perfil.toString("base64") : null,
      autorId: r.Reseñador
    }));
    

    res.status(200).json(reseñas);
  });
});
////////////////Reseña Eliminar///////////////////
app.delete("/resenas/eliminar/:id", (req, res) => {
  const idResena = req.params.id;

  const query = `CALL SP_ResenaEliminar(?)`;

  db.query(query, [idResena], (err, result) => {
    if (err) {
      console.error("Error al eliminar reseña:", err);
      return res.status(500).json({ message: "Error al eliminar reseña" });
    }

    res.status(200).json({ message: "Reseña eliminada exitosamente" });
  });
});
/////////////Reseña Editar/////////////////////
app.put("/resenas/editar/:id", (req, res) => {
  const { id } = req.params;
  const { calificacion, comentario } = req.body;

  if (!calificacion || !comentario.trim()) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const sql = `CALL SP_ResenaActualizar(?, ?, ?)`;

  db.query(sql, [id, calificacion, comentario.trim()], (err) => {
    if (err) {
      console.error("Error al actualizar reseña:", err);
      return res.status(500).json({ message: "Error al actualizar la reseña" });
    }

    res.status(200).json({ message: "Reseña actualizada con éxito" });
  });
});

/////////Usuario Eliminar////////////
app.put("/usuarios/eliminar/:id", (req, res) => {
  const { id } = req.params;

  const query = "CALL SP_UsuarioEliminar(?)";

  db.query(query, [id], (err) => {
    if (err) {
      console.error("Error al desactivar usuario:", err);
      return res.status(500).json({ message: "Error al desactivar la cuenta" });
    }

    res.status(200).json({ message: "Cuenta desactivada con éxito" });
  });
});

////////////Usuario Actualizar//////////////////////////
app.put("/usuarios/editar/:id", (req, res) => {
  const { id } = req.params;
  const { username, fechaNacimiento, fotoPerfil } = req.body;

  if (!username || !fechaNacimiento || !fotoPerfil) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  const today = new Date().toISOString().split("T")[0];
  if (fechaNacimiento > today) {
    return res.status(400).json({ message: "La fecha de nacimiento no puede ser mayor al día de hoy." });
  }

  const imageBuffer = Buffer.from(fotoPerfil, "base64");

  db.query(
    "CALL SP_PerfilActualizar(?, ?, ?, ?, @p_message, @p_status);",
    [id, username, fechaNacimiento, imageBuffer],
    (err) => {
      if (err) {
        console.error("Error al ejecutar el SP_PerfilActualizar:", err);
        return res.status(500).json({ message: "Error interno al actualizar el perfil." });
      }

      db.query("SELECT @p_message AS message, @p_status AS status;", (err, results) => {
        if (err) {
          console.error("Error al obtener salida del SP:", err);
          return res.status(500).json({ message: "Error al obtener respuesta del procedimiento." });
        }

        const output = results[0];
        res.status(output.status).json({ message: output.message });
      });
    }
  );
});

//////////Nueva Contraseña/////////////
app.put("/usuarios/cambiar-contrasena/:id", (req, res) => {
  const { id } = req.params;
  const { actual, nueva } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(nueva)) {
    return res.status(400).json({
      message: "La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial."
    });
  }

  const query = "SELECT Contraseña FROM usuarios WHERE IdUsuario = ? AND Estatus = 'Activo'";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al verificar contraseña." });

    if (result.length === 0 || result[0].Contraseña !== actual) {
      return res.status(400).json({ message: "La contraseña actual no es correcta." });
    }

    const spQuery = "CALL SP_UsuarioActualizarContrasena(?, ?)";
    db.query(spQuery, [id, nueva], (err2) => {
      if (err2) return res.status(500).json({ message: "Error al cambiar la contraseña." });

      res.status(200).json({ message: "Contraseña actualizada con éxito." });
    });
  });
});


//////////Juegos reseñados///////////////
app.get("/resenas/juegos-por-usuario/:id", (req, res) => {
  const idUsuario = req.params.id;

  const query = `
    SELECT 
      V.IdJuego,
      V.Nombre,
      V.Imagen
    FROM Reseñas R
    JOIN Videojuegos V ON R.Juego = V.IdJuego
    WHERE R.Reseñador = ? AND R.Estatus = 'Activo'
    GROUP BY V.IdJuego
  `;

  db.query(query, [idUsuario], (err, results) => {
    if (err) {
      console.error("Error al obtener juegos reseñados:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    const juegos = results.map(j => ({
      id: j.IdJuego,
      nombre: j.Nombre,
      imagen: j.Imagen ? j.Imagen.toString("base64") : null
    }));

    res.status(200).json(juegos);
  });
});

///////Perfil Juegos detalles//////////
app.get("/videojuegos/detalles/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT 
      V.IdJuego,
      V.Nombre,
      V.Imagen,
      V.Año_Lanzamiento,
      V.Age_Rating,
      V.Descripcion,
      V.Categoria AS IdCategoria,
      C.Nombre AS CategoriaNombre,
      V.Desarrolladora AS IdDesarrolladora,
      CD.Nombre AS DesarrolladoraNombre,
      V.Publicadora AS IdPublicadora,
      CP.Nombre AS PublicadoraNombre,
      V.Rating,
      (
        SELECT COUNT(*) 
        FROM Reseñas R 
        WHERE R.Juego = V.IdJuego AND R.Estatus = 'Activo'
      ) AS Resenas,
      GROUP_CONCAT(P.IdPlataforma) AS PlataformaIDs,
      GROUP_CONCAT(P.Nombre SEPARATOR ', ') AS Plataformas
    FROM Videojuegos V
    JOIN Categorias C ON V.Categoria = C.IdCategoria
    JOIN Compañias CD ON V.Desarrolladora = CD.IdCompañia
    JOIN Compañias CP ON V.Publicadora = CP.IdCompañia
    JOIN Videojuegos_Plataformas VP ON V.IdJuego = VP.IdJuego
    JOIN Plataformas P ON VP.IdPlataforma = P.IdPlataforma
    WHERE V.Estatus = 'Activo' AND V.IdJuego = ?
    GROUP BY V.IdJuego;
  `;

  db.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    const juego = results[0];
    res.json({
      id: juego.IdJuego,
      image: juego.Imagen ? juego.Imagen.toString("base64") : null,
      title: juego.Nombre,
      platforms: juego.Plataformas,
      platformIDs: juego.PlataformaIDs ? juego.PlataformaIDs.split(",").map(n => parseInt(n)) : [],
      genre: juego.CategoriaNombre,
      reviews: juego.Resenas,
      rating: parseFloat(juego.Rating).toFixed(1),
      year: juego.Año_Lanzamiento,
      ageRating: juego.Age_Rating,
      description: juego.Descripcion,
      desarrolladora: juego.DesarrolladoraNombre,
      publicadora: juego.PublicadoraNombre,
      idCategoria: juego.IdCategoria,
      idDesarrolladora: juego.IdDesarrolladora,
      idPublicadora: juego.IdPublicadora
    });
  });
});



