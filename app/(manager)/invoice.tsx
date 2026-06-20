import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { getInvoice, Invoice } from '@/services/manager';
import { Colors, Spacing } from '@/theme';
import { formatCurrency } from '@/utils/currency';

function invoiceHtml(invoice: Invoice) {
  const rows = invoice.byEmployee
    .map(
      (entry) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #262e3a;">${entry.employeeName}</td>
        <td style="padding:8px;border-bottom:1px solid #262e3a;text-align:right;">${formatCurrency(entry.totalAll)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
  <html><head><meta charset="utf-8" /></head>
  <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #0d1117;">
    <h1 style="color:#14b8a6;">Pulse Invoice - ${invoice.month}</h1>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #14b8a6;">Employee</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid #14b8a6;">Amount due</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <h2 style="margin-top:24px;">Total: ${formatCurrency(invoice.totalAll)}</h2>
  </body></html>`;
}

export default function InvoiceScreen() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getInvoice().then(setInvoice).catch(() => setInvoice(null));
  }, []);

  const handleExport = async () => {
    if (!invoice) return;
    setExporting(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: invoiceHtml(invoice) });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Could not export invoice', 'Something went wrong while generating the PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Screen scroll>
      <AppText variant="title" color={Colors.teal}>
        {invoice.month}
      </AppText>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        {invoice.byEmployee.length === 0 ? (
          <AppText variant="body" color={Colors.textSecondary}>
            No claimed perks this month.
          </AppText>
        ) : (
          invoice.byEmployee.map((entry) => (
            <Card key={entry.employeeId}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="label">{entry.employeeName}</AppText>
                <AppText variant="label" color={Colors.teal}>
                  {formatCurrency(entry.totalAll)}
                </AppText>
              </View>
              <AppText variant="caption" color={Colors.textTertiary} style={{ marginTop: Spacing.xxs }}>
                {entry.items.length} claimed perk{entry.items.length !== 1 ? 's' : ''}
              </AppText>
            </Card>
          ))
        )}
      </View>

      <View style={{ marginTop: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="subtitle">Total due</AppText>
        <AppText variant="subtitle" color={Colors.teal}>
          {formatCurrency(invoice.totalAll)}
        </AppText>
      </View>

      <Button label="Export PDF" onPress={handleExport} loading={exporting} style={{ marginTop: Spacing.xl }} />
    </Screen>
  );
}
