<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\VenueRecommendationService;
use Illuminate\Http\Request;

class VenueRecommendationController extends Controller
{
    public function recommend(
        Request $request,
        Event $event,
        VenueRecommendationService $service
    ) {
        // Administrator only
        abort_unless(
            $request->user()?->role === 'admin',
            403
        );

        // Only approved events
        if ($event->status !== 'approved') {
            return response()->json([
                'message' => 'Event must be approved first.'
            ], 422);
        }

        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'required_facilities' => 'sometimes|array',
            'required_facilities.*' => 'string|max:255',
        ]);

        $result = $service->recommend(
            (int) $event->estimated_attendees,
            $validated['start_datetime'],
            $validated['end_datetime'],
            $validated['required_facilities'] ?? []
        );

        return response()->json([
            'event_id' => $event->id,
            'event_title' => $event->title,
            'expected_participants' => $event->estimated_attendees,
            'algorithm' => 'Greedy Algorithm',
            'result' => $result,
            'message' => $result['recommended_venue']
                ? 'Suitable venues found. Administrator confirmation is required.'
                : 'No suitable venue found.',
        ]);
    }
}
