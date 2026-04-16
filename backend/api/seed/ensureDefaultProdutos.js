import Produtos from '../models/Produtos.js';
import { logInfo, logWarn } from '../utils/logger.js';

const PRODUTOS_INICIAIS = [
  { codigo_interno: 'ARRZ001', descricao: 'Arroz Tipo 1 5kg', valor_venda: 22.90, valor_custo: 18.50, quantidade_estoque: 100 },
  { codigo_interno: 'FEIJ001', descricao: 'Feijão Carioca 1kg', valor_venda: 8.50, valor_custo: 6.20, quantidade_estoque: 80 },
  { codigo_interno: 'OLEO001', descricao: 'Óleo de Soja 900ml', valor_venda: 9.90, valor_custo: 6.80, quantidade_estoque: 120 },
  { codigo_interno: 'ACUC001', descricao: 'Açúcar Cristal 1kg', valor_venda: 4.50, valor_custo: 3.20, quantidade_estoque: 150 },
  { codigo_interno: 'CAFE001', descricao: 'Café Torrado 500g', valor_venda: 24.90, valor_custo: 16.00, quantidade_estoque: 60 },
  { codigo_interno: 'MACA001', descricao: 'Macarrão Espaguete 500g', valor_venda: 4.20, valor_custo: 2.80, quantidade_estoque: 200 },
  { codigo_interno: 'SAL001', descricao: 'Sal Refinado 1kg', valor_venda: 2.80, valor_custo: 1.50, quantidade_estoque: 180 },
  { codigo_interno: 'LEITE001', descricao: 'Leite Integral 1L', valor_venda: 5.40, valor_custo: 4.10, quantidade_estoque: 90 },
  { codigo_interno: 'BISC001', descricao: 'Biscoito Cream Cracker 140g', valor_venda: 3.90, valor_custo: 2.40, quantidade_estoque: 110 },
  { codigo_interno: 'SABA001', descricao: 'Sabão em Pó 1kg', valor_venda: 14.90, valor_custo: 10.50, quantidade_estoque: 70 },
];

/**
 * insere produtos iniciais na tabela produtos se ela tiver vazia
 */
export async function ensureDefaultProdutos() {
  try {
    const count = await Produtos.count();
    if (count > 0) {
      logInfo('Produtos já existem no banco', { total: count });
      return;
    }
    await Produtos.bulkCreate(PRODUTOS_INICIAIS);
    logInfo('Produtos iniciais criados', { total: PRODUTOS_INICIAIS.length });
  } catch (error) {
    logWarn('Erro ao criar produtos iniciais', { message: error?.message });
  }
}
