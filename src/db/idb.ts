const DB_NAME = "braceframe";
const DB_VERSION = 2;

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("photos")) {
        const photos = db.createObjectStore("photos", { keyPath: "id" });
        photos.createIndex("byDate", "date");
        photos.createIndex("byPoseDate", ["pose", "date"], { unique: false });
      }
      if (!db.objectStoreNames.contains("appointments")) {
        const appts = db.createObjectStore("appointments", { keyPath: "id" });
        appts.createIndex("byDate", "date");
      }
      if (!db.objectStoreNames.contains("adherence")) {
        const days = db.createObjectStore("adherence", { keyPath: "id" });
        days.createIndex("byPatientDate", ["patientId", "date"], { unique: true });
        days.createIndex("byPatient", "patientId");
        days.createIndex("byDate", "date");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function reqTo<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
