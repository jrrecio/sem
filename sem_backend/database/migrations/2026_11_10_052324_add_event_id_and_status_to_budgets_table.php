<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->foreignId('event_id')
                ->nullable()
                ->constrained('events')
                ->cascadeOnDelete();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn(['event_id', 'status']);
        });
    }
};
