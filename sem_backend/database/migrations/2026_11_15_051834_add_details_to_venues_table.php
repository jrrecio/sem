<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->string('name');
            $table->string('location');
            $table->unsignedInteger('capacity');
            $table->text('description')->nullable();
            $table->json('facilities')->nullable();
            $table->string('status')->default('active');
        });
    }

    public function down(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'location',
                'capacity',
                'description',
                'facilities',
                'status',
            ]);
        });
    }
};
