import { InventoryItem } from '../models/inventoryItem.model.js';

export const inventoryRepository = {
  /**
   * Creates the item or refreshes its descriptive fields. Stock fields are written only
   * on insert, so re-running the seed never resets live quantities.
   */
  async upsertFromSeed({ key, category, name, priceMinor, quantity, threshold }) {
    return InventoryItem.findOneAndUpdate(
      { key },
      {
        $set: { category, name, priceMinor },
        $setOnInsert: { quantity, threshold, lastAlertedAt: null, isActive: true },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  },

  findByKeys(keys) {
    return InventoryItem.find({ key: { $in: keys } });
  },

  findByIds(ids, { session } = {}) {
    return InventoryItem.find({ _id: { $in: ids } }).session(session ?? null);
  },

  listActive() {
    return InventoryItem.find({ isActive: true }).sort({ category: 1, name: 1 });
  },

  listAll() {
    return InventoryItem.find().sort({ category: 1, name: 1 });
  },
};
