/**
 * carrega variaveis do .env antes de qualquer outro modulo
 * tem q ser o primeiro import no server.js senao DB_* e cia nao aparece qndo o db.js carrega
 */
import dotenv from 'dotenv';
dotenv.config();
