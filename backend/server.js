import express from 'express';
import cors from 'cors';
import coursesRouter from './routes/courses.js';
import contactRouter from './routes/contacts.js';
import appointmentRouter from './routes/appointments.js';
import materialsRouter from './routes/materials.js';
const app = express();

app.use(cors());
app.use(express.json());

// Routen korrekt registrieren
app.use('/api/courses', coursesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/materials', materialsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ API läuft auf http://localhost:${PORT}`);
});
