<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venue_reservations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('event_id')
                ->constrained('events')
                ->restrictOnDelete();

            $table->foreignId('venue_id')
                ->constrained('venues')
                ->restrictOnDelete();

            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');

            $table->enum('status', [
                'confirmed',
                'cancelled'
            ])->default('confirmed');

            $table->foreignId('confirmed_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamp('confirmed_at');

            $table->timestamps();

            $table->index([
                'venue_id',
                'start_datetime',
                'end_datetime'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venue_reservations');
    }
};
