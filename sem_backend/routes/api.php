
<?php
use Illuminate\Http\Request;
use App\Models\EventAssignment;
use App\Models\User;
// ============================================================
// SMARTCAMPUS - API ROUTES
// Purpose: Define API endpoints for the Laravel backend.
// ============================================================

use Illuminate\Support\Facades\Route;


// ============================================================
// 1. CONTROLLER IMPORTS
// Purpose: Connect API routes to their respective controllers.
// ============================================================

// Authentication
use App\Http\Controllers\Api\AuthController;

// Event Management
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventAssignmentController;
use App\Http\Controllers\EventRequirementsController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\EventMonitoringController;
use App\Http\Controllers\VenueReservationController;
use App\Http\Controllers\VenueRecommendationController;

// Activities and Dependencies
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityDependencyController;

// Venues and Resources
use App\Http\Controllers\VenueController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\EventResourceController;


// Scheduling
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ScheduleItemController;

// Rule-Based Decision Support
use App\Http\Controllers\RuleController;
use App\Http\Controllers\AlgorithmRunController;


// ============================================================
// 2. PUBLIC ROUTES
// Purpose: Allow registration and login without authentication.
// ============================================================

// Register a new user
Route::post(
    'register',
    [AuthController::class, 'register']
);

// Login and receive an authentication token
Route::post(
    'login',
    [AuthController::class, 'login']
);


// ============================================================
// 3. AUTHENTICATED ROUTES
// Purpose: Protect endpoints using Laravel Sanctum.
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // ========================================================
    // 3.1 USER AUTHENTICATION
    // Purpose: Get logged-in user information and logout.
    // ========================================================

    // Get authenticated user
    Route::get(
        'user',
        [AuthController::class, 'user']
    );

    // Logout authenticated user
    Route::post(
        'logout',
        [AuthController::class, 'logout']
    );


    // ========================================================
    // 3.2 EVENT MANAGEMENT
    // Purpose: Create, view, update, and delete events.
    // ========================================================

    Route::apiResource(
        'events',
        EventController::class
    );

    // Submit event proposal for approval
    Route::post(
        'events/{event}/submit',
        [EventController::class, 'submit']
    );

    // Approve or reject event proposal
    Route::post(
        'events/{event}/review',
        [EventController::class, 'review']
    );


    // ========================================================
    // 3.3 EVENT ROLE ASSIGNMENTS
    // Purpose: Assign, update, and remove students from events.
    // ========================================================

    // ADMIN: Get eligible students
    Route::get(
        'event-assignments/eligible-students',
        [EventAssignmentController::class, 'eligibleUsers']
    );

    // ADMIN: View all event assignments
    Route::get(
        'event-assignments',
        [EventAssignmentController::class, 'index']
    );

    // ADMIN: Assign a student to an event
    Route::post(
        'event-assignments',
        [EventAssignmentController::class, 'store']
    );

    // ADMIN: Update an existing student assignment
    Route::put(
        'event-assignments/{assignment}',
        [EventAssignmentController::class, 'update']
    );

    // ADMIN: Remove a student assignment
    Route::delete(
        'event-assignments/{assignment}',
        [EventAssignmentController::class, 'destroy']
    );

    // STUDENT: View their assigned events
    Route::get(
        'my-assigned-events',
        [EventAssignmentController::class, 'myAssignments']
    );


    // ========================================================
    // 3.4 EVENT REQUIREMENTS
    // Purpose: Manage requirements for event approval.
    // ========================================================

    // View requirements for a specific event
    Route::get(
        'events/{eventId}/requirements',
        [EventRequirementsController::class, 'index']
    );

    // Add a requirement to an event
    Route::post(
        'events/{eventId}/requirements',
        [EventRequirementsController::class, 'store']
    );

    // Update an existing requirement
    Route::patch(
        'events/{eventId}/requirements/{requirementId}',
        [EventRequirementsController::class, 'update']
    );


    // ========================================================
    // 3.5 EVENT BUDGET MANAGEMENT
    // Purpose: View and review proposed event budgets.
    // ========================================================

    // View budget details
    Route::get(
        'events/{event}/budget',
        [BudgetController::class, 'show']
    );

    // Approve or reject an event budget
    Route::post(
        'events/{event}/budget/review',
        [BudgetController::class, 'review']
    );


    // ========================================================
    // 3.6 ACTIVITY MANAGEMENT
    // Purpose: Manage activities belonging to school events.
    // ========================================================

    Route::apiResource(
        'activities',
        ActivityController::class
    );


    // ========================================================
    // 3.7 ACTIVITY DEPENDENCIES
    // Purpose: Manage dependencies between event activities.
    // ========================================================

    Route::apiResource(
        'activity-dependencies',
        ActivityDependencyController::class
    );


    // ========================================================
    // 3.8 VENUE MANAGEMENT
    // Purpose: Manage available school event venues.
    // ========================================================

    Route::apiResource(
        'venues',
        VenueController::class
    );


    // ========================================================
    // 3.9 TIME SLOT MANAGEMENT
    // Purpose: Manage event scheduling time slots.
    // ========================================================

    Route::apiResource(
        'time-slots',
        TimeSlotController::class
    );


    // ========================================================
    // 3.10 RESOURCE MANAGEMENT
    // Purpose: Manage resources used during school events.
    // ========================================================

    Route::apiResource(
        'resources',
        ResourceController::class
    );


    // ========================================================
    // 3.11 EVENT RESOURCE MANAGEMENT
    // Purpose: Assign resources to specific school events.
    // ========================================================

    Route::apiResource(
        'event-resources',
        EventResourceController::class
    );


    // ========================================================
    // 3.12 RULE-BASED DECISION SUPPORT
    // Purpose: Manage predefined event planning rules.
    // ========================================================

    Route::apiResource(
        'rules',
        RuleController::class
    );


    // ========================================================
    // 3.13 EVENT SCHEDULE MANAGEMENT
    // Purpose: Create and manage event schedules.
    // ========================================================

    Route::apiResource(
        'schedules',
        ScheduleController::class
    );


    // ========================================================
    // 3.14 SCHEDULE ITEM MANAGEMENT
    // Purpose: Manage individual schedule items.
    // ========================================================

    Route::apiResource(
        'schedule-items',
        ScheduleItemController::class
    );
    // EVENT MONITORING ROUTES
    Route::get('/event-monitoring', [EventMonitoringController::class, 'index']);

    Route::get('/events/{event}/monitoring', [EventMonitoringController::class, 'show']);

    Route::post('/events/{event}/monitoring', [EventMonitoringController::class, 'store']);

    Route::put('/monitoring-tasks/{task}', [EventMonitoringController::class, 'update']);

    Route::delete('/monitoring-tasks/{task}', [EventMonitoringController::class, 'destroy']);

    
    Route::apiResource('venues', VenueController::class)
        ->except(['destroy']);

    Route::get(
        '/venue-reservations',
        [VenueReservationController::class, 'index']
    );

    Route::post(
        '/venue-reservations',
        [VenueReservationController::class, 'store']
    );

    Route::patch(
        '/venue-reservations/{reservation}/cancel',
        [VenueReservationController::class, 'cancel']
    );
    Route::post(
        '/events/{event}/recommend-venues',
        [VenueRecommendationController::class, 'recommend']
    );
    


    // ========================================================
    // 3.15 ALGORITHM RUN RECORDS
    // Purpose: Manage records of scheduling algorithm runs.
    // ========================================================

    Route::apiResource(
        'algorithm-runs',
        AlgorithmRunController::class
    );
});
