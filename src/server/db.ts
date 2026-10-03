import pg from 'pg';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null;

// Inicializa tabelas se o banco estiver conectado
export async function initDatabase() {
  if (!pool) {
    console.log('ℹ️ [DB] DATABASE_URL não configurada. Usando armazenamento local em arquivo.');
    return;
  }

  try {
    const client = await pool.connect();
    console.log('✅ [DB] Conectado com sucesso ao Neon PostgreSQL!');

    // Cria tabela de configurações do admin
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria tabela de autenticação
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_auth (
        id VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria tabela de pagamentos / pedidos
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(100) PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        plan VARCHAR(100),
        email VARCHAR(255),
        amount NUMERIC(10, 2),
        method VARCHAR(50),
        gateway VARCHAR(50),
        pix_code TEXT,
        card_last4 VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('✅ [DB] Tabelas verificadas/criadas no Neon PostgreSQL com sucesso.');
  } catch (err: any) {
    console.warn('⚠️ [DB] Aviso ao conectar com Neon PostgreSQL:', err.message);
  }
}
