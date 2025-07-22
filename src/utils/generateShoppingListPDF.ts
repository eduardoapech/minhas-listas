
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ShoppingItem } from '../screens/Lists';

export async function generatePDFFile(title: string, items: ShoppingItem[]): Promise<string> {
    const total = items.reduce((acc, item) => {
        const preco = item.valorUnitario || 0;
        const qtd = item.quantidade || 1;
        return acc + preco * qtd;
    }, 0);

    const html = `
    <html>
      <body>
        <h1>Relatório - ${title}</h1>
        <ul>
          ${items
            .map(
                (item) =>
                    `<li>${item.text} - Quantidade: ${item.quantidade ?? 1} - Valor: R$ ${item.valorUnitario?.toFixed(2) ?? "0.00"}</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
      </body>
    </html>
  `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
}

/**
 * Salva o PDF na galeria
 */
export async function savePDFToGallery(uri: string): Promise<void> {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) throw new Error("Permissão negada para acessar a galeria.");

    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync("Download", asset, false);
}

/**
 * Compartilha o PDF usando o menu nativo
 */
export async function sharePDF(uri: string): Promise<void> {
    await Sharing.shareAsync(uri);
}
