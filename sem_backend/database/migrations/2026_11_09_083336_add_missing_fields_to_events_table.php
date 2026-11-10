<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('event_type', 100)->nullable();
            $table->text('objectives')->nullable();

            $table->foreignId('proposed_venue_id')
                ->nullable()
                ->constrained('venues')
                ->nullOnDelete();

            $table->unsignedInteger('estimated_attendees')
                ->default(0);

            $table->decimal('estimated_budget', 12, 2)
                ->default(0);

            $table->text('rejection_reason')->nullable();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['proposed_venue_id']);
            $table->dropForeign(['approved_by']);

            $table->dropColumn([
                'event_type',
                'objectives',
                'proposed_venue_id',
                'estimated_attendees',
                'estimated_budget',
                'rejection_reason',
                'approved_by',
                'approved_at'
            ]);
        });
    }
};
