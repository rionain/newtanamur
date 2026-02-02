<?php

namespace App\Services;

class CacheService
{
    /**
     * Implements "Turbo Speed" File Modification Strategy.
     * Checks if data for a specific company has changed since a timestamp.
     */
    public function hasUpdates(int $companyId, int $lastCheckTime): bool
    {
        $cacheFile = WRITEPATH . "cache/company_{$companyId}.txt";

        if (!file_exists($cacheFile)) {
            return true; // No file, assume updates needed
        }

        $lastUpdateTime = filemtime($cacheFile);
        return $lastUpdateTime > $lastCheckTime;
    }

    /**
     * Mark a company as updated (hits the filesystem timestamp).
     */
    public function markAsUpdated(int $companyId): void
    {
        $cachePath = WRITEPATH . 'cache/';
        if (!is_dir($cachePath)) {
            mkdir($cachePath, 0777, true);
        }

        $cacheFile = $cachePath . "company_{$companyId}.txt";
        touch($cacheFile);
    }
}
