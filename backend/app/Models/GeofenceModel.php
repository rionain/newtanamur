<?php

namespace App\Models;

use CodeIgniter\Model;

class GeofenceModel extends Model
{
    protected $table = 'geofences';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;

    protected $allowedFields = [
        'company_id',
        'name',
        'type',
        'coordinates',
        'color',
        'is_active'
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    /**
     * Get all geofences for a specific company
     */
    public function getByCompany(int $companyId)
    {
        return $this->where('company_id', $companyId)
            ->where('is_active', 1)
            ->findAll();
    }
}
