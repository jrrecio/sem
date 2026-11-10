
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityDependencyController;
use App\Http\Controllers\VenueController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\EventResourceController;
use App\Http\Controllers\RuleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ScheduleItemController;
use App\Http\Controllers\AlgorithmRunController;
use App\Http\Controllers\EventRequirementsController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\EventAssignmentController;


// ====================================
// PUBLIC ROUTES
// ====================================

Route::post(
    '/register',
    [AuthController::class, 'register']
);

Route::post(
    '/login',
    [AuthController::class, 'login']
);


// ====================================
// AUTHENTICATED ROUTES
// ====================================

Route::middleware('auth:sanctum')->group(function () {

    // ====================================
    // AUTHENTICATION
    // ====================================

    Route::get(
        'user',
        [AuthController::class, 'user']
    );

    Route::post(
        'logout',
        [AuthController::class, 'logout']
    );


    // ====================================
    // EVENT MANAGEMENT
    // ====================================

    Route::apiResource(
        'events',
        EventController::class
    );

    // Submit an event proposal
    Route::post(
        'events/{event}/submit',
        [EventController::class, 'submit']
    );

    // Review event proposal
    Route::post(
        'events/{event}/review',
        [EventController::class, 'review']
    );


    // ====================================
    // EVENT ROLE ASSIGNMENTS
    // ====================================

    // ADMIN: Retrieve eligible students
    Route::get(
        'event-assignments/eligible-students',
        [EventAssignmentController::class, 'eligibleUsers']
    );

    // ADMIN: View all event assignments
    Route::get(
        'event-assignments',
        [EventAssignmentController::class, 'index']
    );

    // ADMIN: Assign student to an event
    Route::post(
        'event-assignments',
        [EventAssignmentController::class, 'store']
    );

    // ADMIN: Remove student assignment
    Route::delete(
        'event-assignments/{assignment}',
        [EventAssignmentController::class, 'destroy']
    );

    // STUDENT: View own assigned events
    Route::get(
        'my-assigned-events',
        [EventAssignmentController::class, 'myAssignments']
    );


    // ====================================
    // ACTIVITIES
    // ====================================

    Route::apiResource(
        'activities',
        ActivityController::class
    );


    // ====================================
    // ACTIVITY DEPENDENCIES
    // ====================================

    Route::apiResource(
        'activity-dependencies',
        ActivityDependencyController::class
    );


    // ====================================
    // VENUES
    // ====================================

    Route::apiResource(
        'venues',
        VenueController::class
    );


    // ====================================
    // TIME SLOTS
    // ====================================

    Route::apiResource(
        'time-slots',
        TimeSlotController::class
    );


    // ====================================
    // RESOURCES
    // ====================================

    Route::apiResource(
        'resources',
        ResourceController::class
    );


    // ====================================
    // EVENT RESOURCES
    // ====================================

    Route::apiResource(
        'event-resources',
        EventResourceController::class
    );


    // ====================================
    // RULES
    // ====================================

    Route::apiResource(
        'rules',
        RuleController::class
    );


    // ====================================
    // SCHEDULES
    // ====================================

    Route::apiResource(
        'schedules',
        ScheduleController::class
    );


    // ====================================
    // SCHEDULE ITEMS
    // ====================================

    Route::apiResource(
        'schedule-items',
        ScheduleItemController::class
    );


    // ====================================
    // EVENT REQUIREMENTS
    // ====================================

    // View event requirements
    Route::get(
        'events/{eventId}/requirements',
        [EventRequirementsController::class, 'index']
    );

    // Add event requirement
    Route::post(
        'events/{eventId}/requirements',
        [EventRequirementsController::class, 'store']
    );

    // Update event requirement
    Route::patch(
        'events/{eventId}/requirements/{requirementId}',
        [EventRequirementsController::class, 'update']
    );


    // ====================================
    // EVENT BUDGET MANAGEMENT
    // ====================================

    // View event budget
    Route::get(
        'events/{event}/budget',
        [BudgetController::class, 'show']
    );

    // Review event budget
    Route::post(
        'events/{event}/budget/review',
        [BudgetController::class, 'review']
    );


    // ====================================
    // ALGORITHM RUNS
    // ====================================

    Route::apiResource(
        'algorithm-runs',
        AlgorithmRunController::class
    );
});
