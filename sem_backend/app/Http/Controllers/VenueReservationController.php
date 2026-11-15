<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Venue;
use App\Models\VenueReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VenueReservationController extends Controller
{
    // GET - View confirmed and cancelled reservations
    public function index(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        return response()->json(
            VenueReservation::with(['event', 'venue', 'confirmedBy'])
                ->latest()
                ->get()
        );
    }

    // POST - Confirm a venue reservation
    public function store(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $validated = $request->validate([
            'event_id' => [
                'required',
                'integer',
                Rule::exists('events', 'id'),
            ],
            'venue_id' => [
                'required',
                'integer',
                Rule::exists('venues', 'id'),
            ],
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        $reservation = DB::transaction(function () use ($validated, $request) {

            // Lock the venue row so concurrent reservation
            // requests for the same venue are serialized.
            $venue = Venue::whereKey($validated['venue_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $event = Event::findOrFail($validated['event_id']);

            if ($event->status !== 'approved') {
                throw ValidationException::withMessages([
                    'event_id' => 'Only approved events can reserve venues.',
                ]);
            }

            if ($venue->status !== 'active') {
                throw ValidationException::withMessages([
                    'venue_id' => 'This venue is not active.',
                ]);
            }

            // Check for overlapping confirmed reservations.
            $conflict = VenueReservation::where('venue_id', $venue->id)
                ->where('status', 'confirmed')
                ->where('start_datetime', '<', $validated['end_datetime'])
                ->where('end_datetime', '>', $validated['start_datetime'])
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages([
                    'venue_id' => 'Venue is already reserved for the selected schedule.',
                ]);
            }

            // Prevent duplicate confirmed venue allocations
            // for the same event.
            $existingEventReservation = VenueReservation::where(
                'event_id',
                $event->id
            )
                ->where('status', 'confirmed')
                ->exists();

            if ($existingEventReservation) {
                throw ValidationException::withMessages([
                    'event_id' => 'This event already has a confirmed venue reservation.',
                ]);
            }

            return VenueReservation::create([
                'event_id' => $event->id,
                'venue_id' => $venue->id,
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'status' => 'confirmed',
                'confirmed_by' => $request->user()->id,
                'confirmed_at' => now(),
            ]);
        }, 3);

        return response()->json([
            'message' => 'Venue reservation confirmed successfully.',
            'reservation' => $reservation->load([
                'event',
                'venue',
                'confirmedBy'
            ]),
        ], 201);
    }

    // PATCH - Cancel a confirmed reservation
    public function cancel(Request $request, VenueReservation $reservation)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        if ($reservation->status !== 'confirmed') {
            return response()->json([
                'message' => 'Reservation is already cancelled.',
            ], 422);
        }

        $reservation->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Venue reservation cancelled successfully.',
            'reservation' => $reservation,
        ]);
    }
}
