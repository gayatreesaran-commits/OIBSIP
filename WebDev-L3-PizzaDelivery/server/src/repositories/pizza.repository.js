import { Pizza } from '../models/pizza.model.js';

export const pizzaRepository = {
  upsertFromSeed({ key, name, description, priceMinor, ingredients }) {
    return Pizza.findOneAndUpdate(
      { key },
      { $set: { name, description, priceMinor, ingredients }, $setOnInsert: { isAvailable: true } },
      { upsert: true, returnDocument: 'after' },
    );
  },

  listAvailable() {
    return Pizza.find({ isAvailable: true }).sort({ name: 1 });
  },

  findById(id) {
    return Pizza.findById(id);
  },
};
