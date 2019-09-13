<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLodgingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lodgings', function (Blueprint $table) {
            $table->increments('id');

            $table->string("name");
            $table->text("description")->nullable(true);
            $table->string("website");
            $table->text('address');

            $table->integer('image_id')->unsigned();
            $table->foreign('image_id')->references('id')->on('files')
                ->onDelete('restrict')
                ->onUpdate('restrict');

            $table->timestamps();
        });

        Schema::create('events_lodgings', function ($table) {
            $table->engine = 'InnoDB';
            $table->integer('event_id')->unsigned();
            $table->integer('lodging_id')->unsigned();
            $table->foreign('event_id')->references('id')->on('events')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->foreign('lodging_id')->references('id')->on('lodgings')
                ->onDelete('restrict')
                ->onUpdate('restrict');
//            $table->primary(['event_id', 'lodging_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lodgings');
        Schema::table('events_lodgings', function (Blueprint $table) {
            $table->dropForeign('events_lodgings_event_id_foreign');
            $table->dropForeign('events_lodgings_lodging_id_foreign');
        });
        Schema::dropIfExists('events_lodgings');
    }
}
