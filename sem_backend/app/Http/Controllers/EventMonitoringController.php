<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\EventMonitoringTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EventMonitoringController extends Controller
{
    // Check if user can access the event
    private function canAccessEvent($user, Event $event): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role !== 'user') {
            return false;
        }

        return (int) $event->user_id === (int) $user->id
            || EventAssignment::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    // GET: All accessible approved events with progress
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Event::where('status', 'approved');

        if ($user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('monitoringTasks', function ($taskQuery) use ($user) {
                        $taskQuery->where('assigned_to', $user->id);
                    })
                    ->orWhereHas('assignments', function ($assignmentQuery) use ($user) {
                        $assignmentQuery->where('user_id', $user->id);
                    });
            });
        }

        $events = $query->withCount([
            'monitoringTasks',
            'monitoringTasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'completed');
            }
        ])->latest()->get();

        $events->each(function ($event) {
            $total = $event->monitoring_tasks_count;
            $completed = $event->completed_tasks_count;

            $event->progress = $total > 0
                ? round(($completed / $total) * 100)
                : 0;
        });

        return response()->json($events);
    }

    // GET: Tasks for one event
    public function show(Request $request, Event $event)
    {
        abort_unless(
            $event->status === 'approved'
                && $this->canAccessEvent($request->user(), $event),
            403,
            'Unauthorized event access.'
        );

        $tasks = EventMonitoringTask::where('event_id', $event->id)
            ->with('assignedStudent:id,name,email')
            ->latest()
            ->get();

        return response()->json($tasks);
    }

    // POST: Create a monitoring task
    public function store(Request $request, Event $event)
    {
        abort_unless(
            $event->status === 'approved'
                && $this->canAccessEvent($request->user(), $event),
            403,
            'Unauthorized event access.'
        );

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'user'),
            ],
            'due_date' => 'nullable|date',
        ]);

        if (!empty($validated['assigned_to'])) {
            $isAssigned = EventAssignment::where('event_id', $event->id)
                ->where('user_id', $validated['assigned_to'])
                ->exists();

            if (!$isAssigned) {
                return response()->json([
                    'message' => 'Student must be assigned to this event first.'
                ], 422);
            }
        }

        $task = EventMonitoringTask::create([
            ...$validated,
            'event_id' => $event->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Monitoring task created successfully.',
            'task' => $task->load('assignedStudent:id,name,email'),
        ], 201);
    }

    // PUT: Update task details or progress
    public function update(Request $request, EventMonitoringTask $task)
    {
        $event = Event::findOrFail($task->event_id);

        abort_unless(
            $event->status === 'approved'
                && $this->canAccessEvent($request->user(), $event),
            403,
            'Unauthorized event access.'
        );

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'assigned_to' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'user'),
            ],
            'due_date' => 'sometimes|nullable|date',
            'status' => [
                'sometimes',
                'required',
                Rule::in(['pending', 'in_progress', 'completed']),
            ],
        ]);

        if (!empty($validated['assigned_to'])) {
            $isAssigned = EventAssignment::where('event_id', $event->id)
                ->where('user_id', $validated['assigned_to'])
                ->exists();

            if (!$isAssigned) {
                return response()->json([
                    'message' => 'Student must be assigned to this event first.'
                ], 422);
            }
        }

        $task->update($validated);

        return response()->json([
            'message' => 'Monitoring task updated successfully.',
            'task' => $task->load('assignedStudent:id,name,email'),
        ]);
    }

    // DELETE: Remove a monitoring task
    public function destroy(Request $request, EventMonitoringTask $task)
    {
        $event = Event::findOrFail($task->event_id);

        abort_unless(
            $event->status === 'approved'
                && $this->canAccessEvent($request->user(), $event),
            403,
            'Unauthorized event access.'
        );

        $task->delete();

        return response()->json([
            'message' => 'Monitoring task deleted successfully.'
        ]);
    }
}
