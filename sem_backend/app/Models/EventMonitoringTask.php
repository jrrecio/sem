<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventMonitoringTask extends Model
{
    protected $fillable = [
        'event_id',
        'assigned_to',
        'title',
        'description',
        'status',
        'due_date',
    ];
    public function monitoringTasks()
    {
        return $this->hasMany(EventMonitoringTask::class);
    }

    public function assignments()
    {
        return $this->hasMany(EventAssignment::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function assignedStudent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
