import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// config do banco (isso aqui eu rodei local pra encher a base)
const client = new Client({
  host: 'localhost',
  database: 'agendalog',
  user: 'postgres',
  password: 'postgres',
  port: 5432
});

async function insertProdutos() {
  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conectado com sucesso!');

    // leio o arquivo sql
    const sqlPath = join(__dirname, '../sql/create_produtos.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('Executando script SQL...');
    
    // executo o script sql
    await client.query(sql);
    
    console.log('✅ Tabela criada e produtos inseridos com sucesso!');
    
    // confiro quantos produtos entrou
    const result = await client.query('SELECT COUNT(*) as total FROM produtos');
    console.log(`📦 Total de produtos no banco: ${result.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
    
    // se a tabela ja existe, tento so inserir os produtos
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tabela já existe. Tentando apenas inserir produtos...');
      try {
        await insertOnlyProdutos();
      } catch (err) {
        console.error('❌ Erro ao inserir produtos:', err.message);
      }
    }
  } finally {
    await client.end();
    console.log('Conexão encerrada.');
  }
}

async function insertOnlyProdutos() {
  const produtos = [
    // arroz
    ['ARR001', '7891000100103', 'Arroz Branco Tipo 1 5kg', 25.90, 18.50, 150],
    ['ARR002', '7891000100110', 'Arroz Branco Tipo 1 1kg', 6.50, 4.20, 200],
    ['ARR003', '7891000100127', 'Arroz Parboilizado 5kg', 28.90, 20.00, 120],
    ['ARR004', '7891000100134', 'Arroz Integral 1kg', 8.90, 6.00, 80],
    // feijao
    ['FEI001', '7891000200100', 'Feijão Carioca 1kg', 9.90, 6.50, 180],
    ['FEI002', '7891000200117', 'Feijão Preto 1kg', 10.50, 7.00, 150],
    ['FEI003', '7891000200124', 'Feijão Carioca 500g', 5.90, 3.80, 200],
    // acucar
    ['ACU001', '7891000300107', 'Açúcar Cristal 1kg', 5.90, 3.50, 250],
    ['ACU002', '7891000300114', 'Açúcar Refinado 1kg', 6.20, 3.80, 300],
    ['ACU003', '7891000300121', 'Açúcar Demerara 1kg', 8.90, 6.00, 100],
    // oleo
    ['OLE001', '7891000400104', 'Óleo de Soja 900ml', 7.90, 5.00, 200],
    ['OLE002', '7891000400111', 'Óleo de Girassol 900ml', 8.50, 5.50, 150],
    ['OLE003', '7891000400128', 'Óleo de Canola 900ml', 9.90, 6.50, 120],
    // macarrao
    ['MAC001', '7891000500101', 'Macarrão Espaguete 500g', 4.90, 2.80, 300],
    ['MAC002', '7891000500118', 'Macarrão Parafuso 500g', 4.90, 2.80, 280],
    ['MAC003', '7891000500125', 'Macarrão Penne 500g', 5.20, 3.00, 250],
    ['MAC004', '7891000500132', 'Macarrão Fettuccine 500g', 5.50, 3.20, 200],
    // leite
    ['LEI001', '7891000600108', 'Leite Integral 1L', 5.90, 3.80, 400],
    ['LEI002', '7891000600115', 'Leite Desnatado 1L', 6.20, 4.00, 350],
    ['LEI003', '7891000600122', 'Leite Semidesnatado 1L', 6.00, 3.90, 380],
    ['LEI004', '7891000600139', 'Leite Longa Vida Integral 1L', 4.90, 3.20, 500],
    // cafe
    ['CAF001', '7891000700105', 'Café Torrado e Moído 500g', 18.90, 12.00, 200],
    ['CAF002', '7891000700112', 'Café Solúvel 200g', 15.90, 10.00, 150],
    ['CAF003', '7891000700129', 'Café em Cápsulas 10 unidades', 12.90, 8.00, 180],
    // farinha
    ['FAR001', '7891000800102', 'Farinha de Trigo 1kg', 6.90, 4.20, 250],
    ['FAR002', '7891000800119', 'Farinha de Mandioca 500g', 5.50, 3.50, 150],
    ['FAR003', '7891000800126', 'Farinha de Milho 500g', 4.90, 3.00, 180],
    // sal
    ['SAL001', '7891000900109', 'Sal Refinado 1kg', 3.90, 2.00, 400],
    ['SAL002', '7891000900116', 'Sal Grosso 1kg', 4.20, 2.20, 300],
    // adocante
    ['ADO001', '7891001000106', 'Adoçante Líquido 200ml', 8.90, 5.50, 120],
    ['ADO002', '7891001000113', 'Adoçante em Pó 200g', 7.50, 4.80, 150],
    // biscoitos
    ['BIS001', '7891001100103', 'Biscoito Recheado Chocolate 130g', 4.50, 2.50, 300],
    ['BIS002', '7891001100110', 'Biscoito Água e Sal 200g', 3.90, 2.20, 250],
    ['BIS003', '7891001100127', 'Biscoito Doce 200g', 4.20, 2.40, 280],
    // molhos
    ['MOL001', '7891001200100', 'Molho de Tomate 340g', 4.90, 2.80, 200],
    ['MOL002', '7891001200117', 'Ketchup 380g', 6.90, 4.00, 180],
    ['MOL003', '7891001200124', 'Maionese 500g', 8.90, 5.50, 150],
    ['MOL004', '7891001200131', 'Mostarda 200g', 5.50, 3.20, 120],
    // conservas
    ['CON001', '7891001300107', 'Milho Verde em Conserva 200g', 4.50, 2.60, 200],
    ['CON002', '7891001300114', 'Ervilha em Conserva 200g', 4.50, 2.60, 180],
    ['CON003', '7891001300121', 'Seleta de Legumes 200g', 5.20, 3.00, 150],
    // enlatados
    ['ENL001', '7891001400104', 'Atum em Lata 170g', 8.90, 5.50, 200],
    ['ENL002', '7891001400111', 'Sardinha em Lata 125g', 5.90, 3.50, 250],
    ['ENL003', '7891001400128', 'Milho Verde Lata 200g', 3.90, 2.20, 300],
    // bebidas
    ['BEB001', '7891001500101', 'Refrigerante Cola 2L', 8.90, 5.50, 400],
    ['BEB002', '7891001500118', 'Refrigerante Guaraná 2L', 8.90, 5.50, 380],
    ['BEB003', '7891001500125', 'Suco de Laranja 1L', 6.90, 4.20, 300],
    ['BEB004', '7891001500132', 'Água Mineral 1,5L', 3.90, 2.00, 500],
    // limpeza
    ['LIM001', '7891001600108', 'Detergente Líquido 500ml', 3.90, 2.20, 300],
    ['LIM002', '7891001600115', 'Sabão em Pó 1kg', 12.90, 7.50, 200],
    ['LIM003', '7891001600122', 'Amaciante 2L', 15.90, 9.50, 180],
    ['LIM004', '7891001600139', 'Desinfetante 1L', 6.90, 4.00, 250],
    // higiene
    ['HIG001', '7891001700105', 'Sabonete 90g', 2.90, 1.50, 400],
    ['HIG002', '7891001700112', 'Shampoo 400ml', 12.90, 7.50, 200],
    ['HIG003', '7891001700129', 'Condicionador 400ml', 13.90, 8.00, 180],
    ['HIG004', '7891001700136', 'Pasta de Dente 90g', 4.90, 2.80, 300],
    // carnes
    ['CAR001', '7891001800102', 'Carne Bovina Moída 1kg', 35.90, 25.00, 50],
    ['CAR002', '7891001800119', 'Frango Inteiro 1kg', 12.90, 8.50, 80],
    ['CAR003', '7891001800126', 'Peito de Frango 1kg', 18.90, 12.00, 60],
    ['CAR004', '7891001800133', 'Presunto Fatiado 200g', 8.90, 5.50, 100],
    ['CAR005', '7891001800140', 'Mortadela 200g', 6.90, 4.20, 120],
    // laticinios
    ['LAT001', '7891001900109', 'Queijo Mussarela 500g', 22.90, 15.00, 100],
    ['LAT002', '7891001900116', 'Queijo Prato 500g', 24.90, 16.00, 80],
    ['LAT003', '7891001900123', 'Requeijão 250g', 7.90, 5.00, 150],
    ['LAT004', '7891001900130', 'Manteiga 500g', 18.90, 12.00, 120],
    ['LAT005', '7891001900147', 'Iogurte Natural 1L', 8.90, 5.50, 200],
    // frutas
    ['FRU001', '7891002000106', 'Banana Prata 1kg', 6.90, 4.00, 100],
    ['FRU002', '7891002000113', 'Maçã 1kg', 8.90, 5.50, 80],
    ['FRU003', '7891002000120', 'Laranja 1kg', 5.90, 3.50, 120],
    ['FRU004', '7891002000137', 'Tomate 1kg', 7.90, 4.50, 90],
    ['FRU005', '7891002000144', 'Cebola 1kg', 5.90, 3.20, 150],
    ['FRU006', '7891002000151', 'Batata 1kg', 6.90, 4.00, 200],
    ['FRU007', '7891002000168', 'Cenoura 1kg', 4.90, 2.80, 180]
  ];

  const insertQuery = `
    INSERT INTO produtos (codigo_interno, codigo_barras, descricao, valor_venda, valor_custo, quantidade_estoque)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (codigo_interno) DO NOTHING
  `;

  let inseridos = 0;
  for (const produto of produtos) {
    try {
      const result = await client.query(insertQuery, produto);
      if (result.rowCount > 0) {
        inseridos++;
      }
    } catch (err) {
      console.error(`Erro ao inserir ${produto[0]}:`, err.message);
    }
  }

  console.log(`✅ ${inseridos} produtos inseridos com sucesso!`);
}

// executo o script
insertProdutos().catch(console.error);

