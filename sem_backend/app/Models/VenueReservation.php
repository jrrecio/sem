<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueReservation extends Model
{
    protected $fillable = [
        'event_id',
        'venue_id',
        'start_datetime',
        'end_datetime',
        'status',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
