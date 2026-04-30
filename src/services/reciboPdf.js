import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function formatarData(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso || '';
  }
}

function montarHtml(pedido) {
  const itensHtml = (pedido.itens || [])
    .map(
      (item) => `
        <tr>
          <td>${item.nome || ''}</td>
          <td style="text-align:center;">${item.quantidade || 0}g</td>
          <td style="text-align:right;">R$ ${Number(item.preco || 0).toFixed(
            2
          )}</td>
        </tr>`
    )
    .join('');

  const enderecoHtml = pedido.endereco
    ? `
      <p><strong>Entrega:</strong><br/>
        ${pedido.endereco.rua || ''}, ${pedido.endereco.numero || ''}
        ${
          pedido.endereco.complemento
            ? ' - ' + pedido.endereco.complemento
            : ''
        }<br/>
        ${pedido.endereco.bairro || ''} - ${pedido.endereco.cidade || ''}/${
        pedido.endereco.estado || ''
      }<br/>
        CEP: ${pedido.endereco.cep || ''}
      </p>`
    : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { color: #4B0000; margin-bottom: 4px; }
          .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; font-size: 13px; }
          th { background: #4B0000; color: white; text-align: left; }
          .total { margin-top: 18px; font-size: 18px; text-align: right; color: #4B0000; }
          .obs { background: #f7f7f7; padding: 10px; border-radius: 4px; margin-top: 14px; }
        </style>
      </head>
      <body>
        <h1>Rango App - Recibo</h1>
        <div class="meta">
          Pedido #${(pedido.id || '').slice(-5)} -
          ${formatarData(pedido.data)}<br/>
          Status: ${pedido.status || ''}
        </div>
        ${enderecoHtml}
        <table>
          <thead>
            <tr><th>Item</th><th style="text-align:center;">Qtd</th><th style="text-align:right;">Preço</th></tr>
          </thead>
          <tbody>${itensHtml}</tbody>
        </table>
        <p class="total">Total: R$ ${Number(pedido.total || 0).toFixed(2)}</p>
        ${
          pedido.observacao
            ? `<div class="obs"><strong>Observação:</strong> ${pedido.observacao}</div>`
            : ''
        }
        <p style="margin-top:30px; font-size: 11px; color:#999; text-align:center;">
          Recibo gerado pelo Rango App
        </p>
      </body>
    </html>
  `;
}

export async function gerarReciboPdf(pedido) {
  const html = montarHtml(pedido);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Recibo do pedido',
    });
  }
  return uri;
}
