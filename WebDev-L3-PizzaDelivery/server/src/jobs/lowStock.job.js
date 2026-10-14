export const LOW_STOCK_JOB_NAME = 'low-stock-alert';

export function createLowStockJob({ lowStockAlertService }) {
  return {
    name: LOW_STOCK_JOB_NAME,
    run: () => lowStockAlertService.run(),
  };
}
