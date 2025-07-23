import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/competitions', competitionsRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 