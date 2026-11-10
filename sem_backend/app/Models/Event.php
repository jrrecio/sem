<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title',
        'event_type',
        'description',
        'objectives',
        'start_date',
        'end_date',
        'proposed_venue_id',
        'estimated_attendees',
        'estimated_budget',
    ];
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_user_id'
        );
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(
            Venue::class,
            'proposed_venue_id'
        );
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(event_requirements::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
