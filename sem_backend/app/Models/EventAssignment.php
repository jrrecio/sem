<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAssignment extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'event_role'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}