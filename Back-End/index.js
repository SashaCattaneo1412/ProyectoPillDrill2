const aioKey = ""; 
const url = 'https://io.adafruit.com/api/v2/LaraGenovese/feeds/servo1/data';
const formData = new FormData();
const { google } = require('googleapis');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const util = require('util');
const credentials = require('./credential.json'); 
const axios = require ('axios');
const { Console } = require('console');
//const session = require('express-session');




/*
const calendar = google.calendar({
  version: "v3", 
  auth: process.env.API_KEY,
})
*/
const connection = mysql.createConnection(process.env.DATABASE_URL='mysql://8995shipxhiehlwqtccm:pscale_pw_JrGZwAiidWauDlExQRAPXgx7ya3WT6qojnSBKFCPuik@aws.connect.psdb.cloud/proyecto?ssl={"rejectUnauthorized":true}');
connection.connect((err) => {
  if (err) {
    console.error('Error al conectarse a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos.');
});



const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));


/*
app.use(session({
  secret: "funca",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Si estás usando HTTPS, cambia esto a true
}));
//sETUP

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL,
  process.env.API_KEY

)
const scopes =[
  'https://www.googleapis.com/auth/calendar'
];

app.get('/google', (req, res) =>{
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", 
    scope : scopes
  })

  res.redirect(url);
});

//revisar aca la url no me lleva a ningun lado 
app.get('/auth/google/callback', async (req, res)=>{
  const code = req.query.code;
  try {
    console.log(code);
    const { tokens } = await oauth2Client.getToken(code);
    console.log("a")
    oauth2Client.setCredentials(tokens);
    console.log("b")
    req.session.tokens = tokens;
    console.log("c")
    // Redirigir a la página después de iniciar sesión correctamente
    res.redirect('http://localhost:3000/Compartimento');
    console.log("d")
  } catch (error) {
    console.error('Error al obtener los tokens:', error);   
    res.status(500).send('Error al obtener los tokens');
  }
});

app.get('/Compartimento', (req, res) => {
  if (req.session.tokens) {
    console.log("holaaaa ")
     
    res.send('¡Usuario autenticado!');
  } else {
    // El usuario no está autenticado, redirige a la página de inicio de sesión o muestra un mensaje
    res.redirect('/login');
  }
});
*/
//Cambiar con las variables de la bas de datp
app.get('/schedule_event', async (req, res)=>{

  /* lo que saque de los documentos de google

var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2015-05-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2015-05-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

calendar.events.insert({
  auth: auth,
  calendarId: 'primary',
  resource: event,
}, function(err, event) {
  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }
  console.log('Event created: %s', event.htmlLink);
});
*/
})


app.get("/status", (req, res) => {
  connection.query('SELECT * FROM boton_prendiendo LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({
        error: err
      })
    }
    res.json(results[0].name);
  });
});

app.post("/registrarse", (req, res) => {
  const { nombre, mail, password } = req.body;
  console.log(req.body);
  const updateQuery = `INSERT INTO usuario SET nombre = ?, mail = ?, contrasenia = ?`;
  const values = [nombre, mail, password];
  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      // Manejar el error
    } else {
      console.log('Actualización exitosa. Filas afectadas:', results.affectedRows);
      res.status(200).send('Registro exitoso');
      // Hacer algo con los resultados
    }
  })
  console.log("se corrio el insert")
});


//usuario 
app.get("/usuario/:email", (req, res) => {
  const userEmail = req.params.email;
  const selectQuery = `SELECT * FROM usuario WHERE mail = ?`;

  connection.query(selectQuery, userEmail, (error, results) => {
    if (error) {
      console.error('Error al obtener la información del usuario:', error);
      res.status(500).json({ error: 'Error al obtener la información del usuario' });
    } else {
      if (results.length > 0) {
        const userData = results[0]; // Suponiendo que el resultado es un solo usuario
        res.status(200).json(userData);
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    }
  });
});


app.post("/InicioSesion", (req, res) => {
  const { mailfront, passwordfront } = req.body;
  const sql = 'SELECT * FROM usuario WHERE mail = ? AND contrasenia = ?';
  console.log(mailfront, passwordfront);
  connection.query(sql, [mailfront, passwordfront], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      // Manejar el error
    } else {
      if (results.length > 0) {
        console.log("los resultados coinciden");
        res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
      }
      else {
        console.log("los resultados no coinciden");
        res.status(401).json({ success: false, message: 'Inicio de sesión fallido' });
      }
    }
  })
  console.log("se corrio el insert")
});


app.get("/compartimento1", (req, res) => {
  const updateQuery = 'INSERT INTO pastilla SET envase = ?';
  const values = ['1'];
  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      res.status(403).send({error})
      // Manejar el error
    } else {
      console.log('Actualización exitosa. Filas afectadas:', results.affectedRows);
      // Hacer algo con los resultados
      res.status(200).send({ message: "Ok" })
    }
  })
});
app.get("/compartimento2", (req, res) => {
  const updateQuery = 'INSERT INTO pastilla SET envase = ?';
  const values = ['2'];
  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      res.status(403).send({error})
      // Manejar el error
    } else {
      console.log('Actualización exitosa. Filas afectadas:', results.affectedRows);
      // Hacer algo con los resultados
      res.status(200).send({ message: "Ok" })
    }
  })
});
app.get("/compartimento3", (req, res) => {
  const updateQuery = 'INSERT INTO pastilla SET envase = ?';
  const values = ['3'];
  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      res.status(403).send({error})
      // Manejar el error
    } else {
      console.log('Actualización exitosa. Filas afectadas:', results.affectedRows);
      // Hacer algo con los resultados
      res.status(200).send({ message: "Ok" })
    }
  })
});
app.get("/compartimento4", (req, res) => {
  const updateQuery = 'INSERT INTO pastilla SET envase = ?';
  const values = ['4'];
  connection.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta de actualización:', error);
      res.status(403).send({error})
      // Manejar el error
    } else {
      console.log('Actualización exitosa. Filas afectadas:', results.affectedRows);
      // Hacer algo con los resultados
      res.status(200).send({ message: "Ok" })
    }
  })
});
app.post("/compartimento1informacion", async (req, res) => {
  const { nombre, horario, fechainicio } = req.body;
  const partesFecha = fechainicio.split('/');
  const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
  const updateQuery = 'UPDATE pastilla SET nombre = ?, hora = ?, fecha = ? WHERE envase = 1';

  const query = util.promisify(connection.query).bind(connection);
  const result = await query(updateQuery, [nombre, horario, fechaFormateada]);
  
  console.log('Actualización exitosa. Filas afectadas:', result.affectedRows);
  try {
    console.log(oauth2Client.credentials.access_token);
  
    await calendar.events.insert({
    calendarId: "primary", 
    auth: oauth2Client,
    
  resource:{
    
    summary: nombre,
     description: "holaaa ", 
     start:{
      dateTime: fechainicio + 'T' + horario,
      timeZone: 'America/Argentina/Buenos_Aires',
     }, 
     end:{
      dateTime: fechainicio + 'T' + horario,
      timeZone: 'America/Argentina/Buenos_Aires',

     }
  }
 })

 res.send({
  msg: "listooo"
 })

    console.log('Creating Google Calendar event');
 
    console.log('Response from Google Calendar:', response); // Agregamos este log para imprimir la respuesta obtenida
    
    if (response && response.data) {
      console.log('Evento creado:', response.data);
      res.status(200).send({ message: 'Evento creado en Google Calendar' });
    } else {
      console.error('Error al crear el evento en Google Calendar');
      res.status(500).send({ error: 'Error al ejecutar la operación' });
    }
  } 
  catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Error al ejecutar la operación' });
  }
});
/*
const sql = 'SELECT * FROM pastilla WHERE envase = 1 AND fecha = ? AND hora = ?';
connection.query(sql,[fecha,hora], (error, results) => {
    if (error) {
    console.error('Error al ejecutar la consulta de actualización:', error);
    // Manejar el error
  } else {
    console.log("se agarraron los datos");
    if (fecha == fechaActual) {
      if ((horaActual === horaInicio && minutoActual >= minutoInicio)) {
        motor1 = 'ON';
      }
      else {
        motor1 = 'OFF';
      }
    }
  }
});

formData.append('value', motor1);

fetch(url, {
  method: 'POST',
  headers: {
    "X-AIO-Key": aioKey
  },
  body: formData
})
  .then(response => {
    if (!response.ok) {
      throw new Error("Request failed with status: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error("Error:", error);
  });

console.log('Se ejecuto SERVO 1');

////////////////////////////////////////////////////////
*/
app.listen(5000, () => {
  console.log("Example app listening on port 5000!");
});