import express from 'express';
import { login, verificarToken, logout } from '../controllers/usuarioController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rota de login (não requer autenticação)
router.post('/login', login);

// Rota para verificar se o token é válido (requer autenticação)
router.get('/verify', authenticateToken, verificarToken);

// Rota de logout (requer autenticação)
router.post('/logout', authenticateToken, logout);

export default router;
