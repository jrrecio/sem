<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventAssignmentController extends Controller
{
    // ====================================
    // ADMIN: GET ELIGIBLE STUDENTS
    // ====================================
    public function eligibleUsers(Request $request)
    {
        abort_unless(
            $request->user()->role === 'admin',
            403
        );

        return User::where('role', 'user')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }

    // ====================================
    // ADMIN: VIEW ALL ASSIGNMENTS
    // ====================================
    public function index(Request $request)
    {
        abort_unless(
            $request->user()->role === 'admin',
            403
        );

        return EventAssignment::with([
            'event',
            'student:id,name,email'
        ])
            ->latest()
            ->get();
    }

    // ====================================
    // ADMIN: ASSIGN STUDENT TO EVENT
    // ====================================
    public function store(Request $request)
    {
        abort_unless(
            $request->user()->role === 'admin',
            403
        );

        $validated = $request->validate([
            'event_id' => [
                'required',
                'integer',
                'exists:events,id'
            ],

            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where('role', 'user')
            ],

            'event_role' => [
                'required',
                Rule::in([
                    'Event Coordinator',
                    'Assistant Coordinator',
                    'Documentation Officer',
                    'Logistics Officer',
                    'Finance Officer',
                    'Program Officer'
                ])
            ]
        ]);

        // Find selected event
        $event = Event::findOrFail(
            $validated['event_id']
        );

        // Only approved events can be assigned
        if ($event->status !== 'approved') {
            return response()->json([
                'message' =>
                'Only approved events can have student assignments.'
            ], 422);
        }

        // Prevent duplicate student assignments
        $existingAssignment = EventAssignment::where(
            'event_id',
            $validated['event_id']
        )
            ->where(
                'user_id',
                $validated['user_id']
            )
            ->exists();

        if ($existingAssignment) {
            return response()->json([
                'message' =>
                'This student is already assigned to this event.'
            ], 422);
        }

        // Save assignment
        $assignment = EventAssignment::create(
            $validated
        );

        return response()->json([
            'message' =>
            'Student assigned successfully.',

            'assignment' => $assignment->load([
                'event',
                'student:id,name,email'
            ])
        ], 201);
    }

    // ====================================
    // STUDENT: VIEW OWN ASSIGNMENTS
    // ====================================
    public function myAssignments(Request $request)
    {
        return EventAssignment::with('event')
            ->where(
                'user_id',
                $request->user()->id
            )
            ->latest()
            ->get();
    }

    // ====================================
    // ADMIN: REMOVE ASSIGNMENT
    // ====================================
    public function destroy(
        Request $request,
        EventAssignment $assignment
    ) {
        abort_unless(
            $request->user()->role === 'admin',
            403
        );

        $assignment->delete();

        return response()->json([
            'message' =>
            'Student assignment removed successfully.'
        ]);
    }
}
