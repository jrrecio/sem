<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    public function show(Request $request, Event $event)
    {
        abort_unless($request->user()->role === 'admin', 403);

        return response()->json([
            'event_id' => $event->id,
            'estimated_budget' => $event->estimated_budget,
            'budget' => $event->budgets()->latest('id')->first(),
        ]);
    }

    public function review(Request $request, Event $event)
    {
        abort_unless($request->user()->role === 'admin', 403);

        $validated = $request->validate([
            'decision' => [
                'required',
                Rule::in(['approved', 'rejected']),
            ],
        ]);

        abort_unless($event->status === 'pending', 422);

        $budget = $event->budgets()->firstOrCreate(
            ['event_id' => $event->id],
            ['status' => 'pending']
        );

        $budget->status = $validated['decision'];
        $budget->save();

        return response()->json([
            'message' => 'Budget reviewed successfully.',
            'budget' => $budget,
        ]);
    }
}
