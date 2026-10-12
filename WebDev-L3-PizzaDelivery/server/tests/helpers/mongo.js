import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

/**
 * Starts an in-memory replica set. A replica set (not a standalone server) is required
 * because the app relies on multi-document transactions for stock and payments.
 */
export async function startTestDatabase() {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());

  return {
    async reset() {
      const collections = await mongoose.connection.db.collections();
      await Promise.all(collections.map((collection) => collection.deleteMany({})));
    },
    async stop() {
      await mongoose.disconnect();
      await replSet.stop();
    },
  };
}
