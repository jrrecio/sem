<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ActivityController extends Controller
{
    // Get all activities
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Activity::with([
            'event:id,title',
            'assignedUser:id,name'
        ]);

        if ($user->role !== 'admin') {
            $query->whereHas('event', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    // Create a new activity
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'duration_minutes' => 'required|integer|min:0',
            'priority' => [
                'sometimes',
                Rule::in(['low', 'medium', 'high'])
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'pending',
                    'in_progress',
                    'completed',
                    'cancelled'
                ])
            ],
            'deadline' => 'nullable|date',
        ]);

        $event = Event::findOrFail($validated['event_id']);

        $this->authorizeEvent($request, $event);

        // New activities always start as pending
        $validated['status'] = 'pending';

        $activity = Activity::create($validated);

        return response()->json([
            'message' => 'Activity created successfully',
            'activity' => $activity
        ], 201);
    }

    // View a specific activity
    public function show(Request $request, Activity $activity)
    {
        $this->authorizeEvent($request, $activity->event);

        return response()->json(
            $activity->load([
                'event:id,title',
                'assignedUser:id,name'
            ])
        );
    }

    // Update an activity
    public function update(Request $request, Activity $activity)
    {
        $this->authorizeEvent($request, $activity->event);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'duration_minutes' => 'sometimes|integer|min:0',
            'priority' => [
                'sometimes',
                Rule::in(['low', 'medium', 'high'])
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'pending',
                    'in_progress',
                    'completed',
                    'cancelled'
                ])
            ],
            'deadline' => 'sometimes|nullable|date',
        ]);

        $activity->update($validated);

        return response()->json([
            'message' => 'Activity updated successfully',
            'activity' => $activity->fresh()
        ]);
    }

    // Delete an activity
    public function destroy(Request $request, Activity $activity)
    {
        $this->authorizeEvent($request, $activity->event);

        $activity->delete();

        return response()->json([
            'message' => 'Activity deleted successfully'
        ]);
    }

    // Check if user can manage this event
    private function authorizeEvent(Request $request, Event $event): void
    {
        $user = $request->user();

        abort_unless(
            $user->role === 'admin' ||
                (
                    $event->user_id === $user->id &&
                    in_array($event->status, [
                        'draft',
                        'pending',
                        'approved'
                    ])
                ),
            403,
            'You are not authorized to manage this event.'
        );
    }
}
