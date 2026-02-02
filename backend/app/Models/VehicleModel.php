<?php

namespace App\Models;

use CodeIgniter\Model;

class VehicleModel extends Model
{
    protected $table = 'mobil';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'company_id',
        'name',
        'plate_number',
        'device_kode',
        'fuel_volt1',
        'fuel_liter1',
        'fuel_volt2',
        'fuel_liter2',
        'last_lat',
        'last_lng',
        'last_speed',
        'last_dtime',
        'old_fuel',
        'old_suhu',
        'old_alarm'
    ];

    /**
     * Get all vehicles for a specific company.
     */
    public function getByCompany(int $companyId)
    {
        return $this->where('company_id', $companyId)->findAll();
    }

    /**
     * Find vehicle by its hardware/device code (Concox, Meitrack, etc.)
     */
    public function findByDeviceKode(string $kode)
    {
        return $this->where('device_kode', $kode)->first();
    }
}
