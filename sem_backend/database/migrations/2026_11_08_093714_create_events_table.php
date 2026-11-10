<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users');

            $table->string('title');
            $table->string('event_type');
            $table->text('description');
            $table->text('objectives')->nullable();

            $table->date('start_date');
            $table->date('end_date');

            $table->foreignId('proposed_venue_id')
                ->nullable()
                ->constrained('venues')
                ->nullOnDelete();

            $table->unsignedInteger('estimated_attendees')
                ->default(0);

            $table->decimal('estimated_budget', 12, 2)
                ->default(0);

            $table->enum('status', [
                'draft',
                'pending',
                'approved',
                'rejected',
                'ongoing',
                'completed',
                'cancelled'
            ])->default('draft');

            $table->text('rejection_reason')->nullable();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
