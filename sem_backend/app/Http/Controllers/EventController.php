<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;


class EventController extends Controller
{

    public function index()
    {
        return response()->json(
            Event::with([
                'user:id,name',
                'venue',
                'coordinator:id,name,email'
            ])
                ->latest()
                ->get()
        );
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'description' => 'required|string',
            'objectives' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'proposed_venue_id' => 'nullable|exists:venues,id',
            'estimated_attendees' => 'required|integer|min:1',
            'estimated_budget' => 'required|numeric|min:0',
        ]);

        $event = new Event($validated);

        $event->user_id = $request->user()->id;
        $event->status = 'draft';
        $event->save();

        return response()->json([
            'message' => 'Event proposal created',
            'event' => $event
        ], 201);        
    }
    public function myAssignedEvents(Request $request)
    {
        $events = Event::with([
            'user:id,name',
            'coordinator:id,name,email'
        ])
            ->where('assigned_user_id', $request->user()->id)
            ->where('status', 'approved')
            ->orderBy('start_date')
            ->get();

        return response()->json($events);
    }

    public function show(Request $request, Event $event)
    {
        return response()->json(
            $event->load([
                'user:id,name',
                'venue',
                'activities',
                'requirements',
                'budgets'
            ])
        );
    }

    public function update(Request $request, Event $event)
    {
        abort_unless(
            $request->user()->role === 'admin' ||
                (
                    $event->user_id === $request->user()->id &&
                    $event->status === 'draft'
                ),
            403
        );

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'event_type' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'objectives' => 'sometimes|nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'proposed_venue_id' => 'sometimes|nullable|exists:venues,id',
            'estimated_attendees' => 'sometimes|required|integer|min:1',
            'estimated_budget' => 'sometimes|required|numeric|min:0',
        ]);

        $start = $validated['start_date'] ?? $event->start_date;
        $end = $validated['end_date'] ?? $event->end_date;

        if (strtotime($end) < strtotime($start)) {
            return response()->json([
                'message' => 'End date must not be earlier than start date.'
            ], 422);
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated',
            'event' => $event->fresh()
        ]);
    }

    public function destroy(Request $request, Event $event)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $event->delete();

        return response()->json([
            'message' => 'Event deleted'
        ]);
    }

    public function submit(Request $request, Event $event)
    {
        abort_unless(
            $request->user()->role === 'admin' ||
                $event->user_id === $request->user()->id,
            403
        );

        abort_unless($event->status === 'draft', 422);

        $event->status = 'pending';
        $event->save();

        return response()->json([
            'message' => 'Proposal submitted for review',
            'event' => $event
        ]);
    }

    public function review(Request $request, Event $event)
    {
        
    
        abort_unless($request->user()->role === 'admin', 403);

        $validated = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_reason' => 'required_if:decision,rejected|nullable|string',
        ]);

        abort_unless($event->status === 'pending', 422);

        if ($validated['decision'] === 'approved') {
            // Do not approve until all requirements,
            // budget and feasibility checks are verified.
            $hasRequirements = $event->requirements()->exists();

            $incomplete = $event->requirements()
                ->where('status', '!=', 'verified')
                ->exists();

            if (!$hasRequirements || $incomplete) {
                return response()->json([
                    'message' => 'Requirements are not fully verified.'
                ], 422);
            }

            $budgetApproved = $event->budgets()
                ->where('status', 'approved')
                ->exists();

            if (!$budgetApproved) {
                return response()->json([
                    'message' => 'Budget approval is required.'
                ], 422);
            }
        }

        DB::transaction(function () use ($event, $request, $validated) {
            $event->status = $validated['decision'];
            $event->approved_by = $request->user()->id;
            $event->approved_at =
                $validated['decision'] === 'approved' ? now() : null;

            $event->rejection_reason =
                $validated['decision'] === 'rejected'
                ? $validated['rejection_reason']
                : null;

            $event->save();
        });

        return response()->json([
            'message' => 'Proposal reviewed',
            'event' => $event->fresh()
        ]);
    }
}
