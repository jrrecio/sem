<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EventRequirementsController extends Controller
{
    // Display requirements for a particular event
    public function index(Request $request, int $eventId)
    {
        $event = Event::findOrFail($eventId);

        abort_unless(
            $request->user()->role === 'admin' ||
                $event->user_id === $request->user()->id,
            403
        );

        return response()->json(
            DB::table('event_requirements')
                ->where('event_id', $eventId)
                ->orderBy('id')
                ->get()
        );
    }

    // Add a new requirement (Admin only)
    public function store(Request $request, int $eventId)
    {
        $event = Event::findOrFail($eventId);

        abort_unless($request->user()->role === 'admin', 403);

        abort_unless(
            $event->status === 'pending',
            422,
            'Requirements can only be added to pending events.'
        );

        $validated = $request->validate([
            'requirement_name' => 'required|string|max:255',
        ]);

        $id = DB::table('event_requirements')->insertGetId([
            'event_id' => $eventId,
            'requirement_name' => $validated['requirement_name'],
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Requirement added successfully.',
            'requirement' => DB::table('event_requirements')->find($id),
        ], 201);
    }

    // Verify a requirement (Admin only)
    public function update(
        Request $request,
        int $eventId,
        int $requirementId
    ) {
        $event = Event::findOrFail($eventId);

        abort_unless($request->user()->role === 'admin', 403);

        abort_unless(
            $event->status === 'pending',
            422,
            'Only pending events can have requirements verified.'
        );

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'verified'])],
        ]);

        $requirement = DB::table('event_requirements')
            ->where('event_id', $eventId)
            ->where('id', $requirementId)
            ->first();

        if (!$requirement) {
            return response()->json([
                'message' => 'Requirement not found.',
            ], 404);
        }

        DB::table('event_requirements')
            ->where('id', $requirementId)
            ->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Requirement status updated successfully.',
        ]);
    }
}
