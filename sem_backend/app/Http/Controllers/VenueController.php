<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class VenueController extends Controller
{
    // Check whether the logged-in user is an Admin
    private function isAdmin()
    {
        return Auth::user()?->role === 'admin';
    }

    // GET - Retrieve all venues
    public function index()
    {
        return response()->json(
            Venue::orderBy('name')->get()
        );
    }

    // POST - Create a new venue
    public function store(Request $request)
    {
        // Admin only
        if (!$this->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access only.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:venues,name',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string|max:255',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        $venue = Venue::create($validated);

        return response()->json([
            'message' => 'Venue created successfully.',
            'venue' => $venue,
        ], 201);
    }

    // GET - Retrieve a specific venue
    public function show(Venue $venue)
    {
        return response()->json($venue);
    }

    // PUT/PATCH - Update venue details
    public function update(Request $request, Venue $venue)
    {
        // Admin only
        if (!$this->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access only.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('venues', 'name')->ignore($venue->id),
            ],
            'location' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|required|integer|min:1',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string|max:255',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        $venue->update($validated);

        return response()->json([
            'message' => 'Venue updated successfully.',
            'venue' => $venue,
        ]);
    }

    // DELETE - Temporarily disabled
    public function destroy(Venue $venue)
    {
        return response()->json([
            'message' => 'Venue deletion is disabled until reservation safeguards are implemented.'
        ], 403);
    }
}
