<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venue extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'capacity',
        'description',
        'facilities',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'facilities' => 'array',
    ];
}
