import Dexie from 'dexie';

export const db = new Dexie('RomanticDatesDB');

db.version(1).stores({
  settings: '++id, key',
  dates: '++id, title, date, rating, createdAt',
  photos: '++id, dateId, blob, order',
});

export async function initDB() {
  try {
    await db.open();
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database', error);
  }
}

export async function getSetting(key) {
  try {
    console.log(`Getting setting: ${key}`);
    if (!db.isOpen()) {
      console.log('Database not open, opening...');
      await db.open();
    }
    
    const setting = await db.settings.get({ key });
    console.log(`Retrieved setting ${key}:`, setting);
    return setting ? setting.value : null;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

export async function setSetting(key, value) {
  try {
    console.log(`Saving setting: ${key} =`, value);
    // First try to update existing setting
    const existing = await db.settings.get({ key });
    if (existing) {
      await db.settings.update(existing.id, { value });
      console.log(`Updated existing setting: ${key}`);
    } else {
      // If no existing setting, add a new one
      await db.settings.add({ key, value });
      console.log(`Added new setting: ${key}`);
    }
    // Verify the setting was saved
    const saved = await db.settings.get({ key });
    console.log(`Verified setting ${key}:`, saved);
    return saved;
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error);
    throw error;
  }
}

export async function clearAllData() {
  try {
    // Clear all tables
    await Promise.all([
      db.settings.clear(),
      db.dates.clear(),
      db.photos.clear()
    ]);
    
    // Clear any IndexedDB storage that might not be covered by Dexie
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('RomanticDatesDB');
      req.onsuccess = resolve;
      req.onerror = reject;
      req.onblocked = () => resolve(); // If the database is blocked, still resolve
    });
    
    // Re-initialize the database
    await initDB();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

// Initialize the database when this module is imported
initDB().catch(console.error);
