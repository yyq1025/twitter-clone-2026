import type { ElectricCollectionUtils } from "@tanstack/electric-db-collection";
import type {
  Collection,
  InsertConfig,
  OperationConfig,
  WritableDeep,
} from "@tanstack/react-db";

export const isCollectionAvailable = <T extends object>(
  collection: Collection<T, string | number, ElectricCollectionUtils>,
) => {
  return collection.status === "loading" || collection.status === "ready";
};

export const safeAwaitTxId = async <T extends object>(
  collection: Collection<T, string | number, ElectricCollectionUtils>,
  txid: number,
) => {
  if (!isCollectionAvailable(collection)) return;
  return await collection.utils.awaitTxId(txid);
};

export const safeInsert = <T extends object>(
  collection: Collection<T, string | number, ElectricCollectionUtils>,
  item: T,
  config?: InsertConfig,
) => {
  if (!isCollectionAvailable(collection)) return;
  try {
    return collection.insert(item, config);
  } catch (error) {
    console.warn("safeInsert error:", error);
  }
};

export const safeSingleUpdate = <T extends object>(
  collection: Collection<T, string | number, ElectricCollectionUtils>,
  key: string | number,
  callback: (daft: WritableDeep<T>) => void,
) => {
  if (!isCollectionAvailable(collection)) return;
  try {
    return collection.update(key, callback);
  } catch (error) {
    console.warn("safeSingleUpdate error:", error);
  }
};

export const safeDelete = <T extends object>(
  collection: Collection<T, string | number, ElectricCollectionUtils>,
  keys: string | number | (string | number)[],
  config?: OperationConfig,
) => {
  if (!isCollectionAvailable(collection)) return;
  try {
    return collection.delete(keys, config);
  } catch (error) {
    console.warn("safeDelete error:", error);
  }
};
