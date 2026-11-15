<?php

namespace App\Services;

use App\Models\Venue;
use App\Models\VenueReservation;
use Carbon\Carbon;

class VenueRecommendationService
{
    public function recommend(
        int $expectedParticipants,
        string $startDatetime,
        string $endDatetime,
        array $requiredFacilities = []
    ): array {

        $start = Carbon::parse($startDatetime);
        $end = Carbon::parse($endDatetime);

        // Validate requested schedule
        if ($end->lessThanOrEqualTo($start)) {
            throw new \InvalidArgumentException(
                'End date must be after start date.'
            );
        }

        // STEP 1: Retrieve active venues
        $venues = Venue::where('status', 'active')->get();

        $suitableVenues = [];

        foreach ($venues as $venue) {

            // STEP 2: Check venue capacity
            if ($venue->capacity < $expectedParticipants) {
                continue;
            }

            // STEP 3: Check schedule conflicts
            $hasConflict = VenueReservation::where(
                'venue_id',
                $venue->id
            )
                ->where('status', 'confirmed')
                ->where('start_datetime', '<', $end)
                ->where('end_datetime', '>', $start)
                ->exists();

            if ($hasConflict) {
                continue;
            }

            // STEP 4: Check required facilities
            $availableFacilities = array_map(
                'strtolower',
                $venue->facilities ?? []
            );

            $required = array_map(
                'strtolower',
                $requiredFacilities
            );

            if (array_diff($required, $availableFacilities)) {
                continue;
            }

            // STEP 5: Calculate excess capacity
            $excessCapacity = $venue->capacity
                - $expectedParticipants;

            $suitableVenues[] = [
                'venue_id' => $venue->id,
                'name' => $venue->name,
                'location' => $venue->location,
                'capacity' => $venue->capacity,
                'facilities' => $venue->facilities ?? [],
                'excess_capacity' => $excessCapacity,
            ];
        }

        // STEP 6: GREEDY SELECTION
        // Smallest excess capacity comes first.
        // Venue ID is the deterministic tie-breaker.
        usort($suitableVenues, function ($a, $b) {
            return $a['excess_capacity']
                <=> $b['excess_capacity']
                ?: $a['venue_id'] <=> $b['venue_id'];
        });

        return [
            'recommended_venue' => $suitableVenues[0] ?? null,
            'alternative_venues' => array_slice(
                $suitableVenues,
                1
            ),
            'total_suitable_venues' => count($suitableVenues),
        ];
    }
}
