
import { db } from '../db';
import { apiService } from './api';
import { Report } from '../types';

const SYNC_BATCH_SIZE = 5;

export const syncManager = {
  /**
   * Main sync logic:
   * 1. Prioritize text-only reports (hasImage: false)
   * 2. Process in batches
   */
  async processSyncQueue(onProgress?: (msg: string) => void): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    try {
      // 1. Get all pending reports
      const pending = await db.reports.where('status').equals('pending').toArray();
      if (pending.length === 0) return { success: 0, failed: 0 };

      // 2. Sort by prioritization (No images first)
      const sortedQueue = [...pending].sort((a, b) => {
        if (a.hasImage === b.hasImage) return a.timestamp - b.timestamp;
        return a.hasImage ? 1 : -1;
      });

      onProgress?.(`Starting sync of ${sortedQueue.length} reports...`);

      // 3. Process in batches
      for (let i = 0; i < sortedQueue.length; i += SYNC_BATCH_SIZE) {
        const batch = sortedQueue.slice(i, i + SYNC_BATCH_SIZE);
        
        await Promise.all(batch.map(async (report) => {
          try {
            const syncedReport = await apiService.submitReport(report);
            await db.reports.update(report.id!, {
              ...syncedReport,
              status: 'synced'
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to sync report ${report.id}:`, err);
            await db.reports.update(report.id!, {
              error: err instanceof Error ? err.message : 'Unknown error'
            });
            failedCount++;
          }
        }));
        
        onProgress?.(`Progress: ${successCount + failedCount}/${sortedQueue.length}`);
      }

      return { success: successCount, failed: failedCount };
    } catch (err) {
      console.error('Critical sync error:', err);
      return { success: successCount, failed: failedCount };
    }
  }
};
