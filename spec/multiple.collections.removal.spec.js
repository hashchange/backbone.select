describe( "Models shared between multiple collections: removing models with remove() and destroy()", function () {

    var Model, SingleSelectCollection, MultiSelectCollection;

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    beforeEach( function () {

        Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Select.Me.applyTo( this );
            }
        } );

        SingleSelectCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.One.applyTo( this, models );
            }
        } );

        MultiSelectCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.Many.applyTo( this, models );
            }
        } );

    } );

    describe( "when a selected model is removed", function () {
        var model1, model2,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            if ( singleCollectionA ) singleCollectionA.close();
            if ( multiCollectionA ) multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            singleCollectionA.remove( model1 );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            multiCollectionA.remove( model1 );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected if removed from all collections", function () {
            singleCollectionA.remove( model1 );
            multiCollectionA.remove( model1 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had accidentally been re-added to a collection already holding it", function () {
            // This is to make sure that the reference counting, which is going on behind the scenes, does not get out of
            // step.
            singleCollectionA.add( model1 );      // model is already part of the collection, adding it for the second time
            multiCollectionA.add( model1 );       // adding the model for the second time

            singleCollectionA.remove( model1 );
            multiCollectionA.remove( model1 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (single-select collection, closed first)", function () {
            singleCollectionA.close();
            singleCollectionA = undefined;

            multiCollectionA.remove( model1 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (multi-select collection, closed first)", function () {
            multiCollectionA.close();
            multiCollectionA = undefined;

            singleCollectionA.remove( model1 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (single-select collection, closed last)", function () {
            multiCollectionA.remove( model1 );

            singleCollectionA.close();
            singleCollectionA = undefined;

            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (multi-select collection, closed last)", function () {
            singleCollectionA.remove( model1 );

            multiCollectionA.close();
            multiCollectionA = undefined;

            expect( model1.selected ).toBe( false );
        } );

        it( "should remain selected in those collections it has not been removed from (removed from single-select)", function () {
            singleCollectionA.remove( model1 );
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected in those collections it has not been removed from (removed from multi-select)", function () {
            multiCollectionA.remove( model1 );
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should remain selected itself if not removed from all collections", function () {
            singleCollectionA.remove( model1 );
            expect( model1.selected ).toBe( true );
        } );

        it( 'should not trigger a deselected event on the model when it is still part of another collection (removed from single-select)', function () {
            singleCollectionA.remove( model1 );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should not trigger a deselected event on the model when it is still part of another collection (removed from multi-select)', function () {
            multiCollectionA.remove( model1 );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a deselected event on the model when removed from all collections (single-select collection last)', function () {
            multiCollectionA.remove( model1 );
            singleCollectionA.remove( model1 );
            expect( model1.trigger ).toHaveBeenCalledWithInitial( "deselected", model1 );
            // or (full signature)
            // expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected", index: 0 } );
        } );

        it( 'should trigger a deselected event on the model when removed from all collections (multi-select collection last)', function () {
            singleCollectionA.remove( model1 );
            multiCollectionA.remove( model1 );
            expect( model1.trigger ).toHaveBeenCalledWithInitial( "deselected", model1 );
            // or (full signature)
            // expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected", index: 0 } );
        } );

        it( 'should trigger a deselect:one event on a single-select collection it is removed from', function () {
            singleCollectionA.remove( model1 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

        it( 'should trigger a select:some or select:none event on a multi-select collection it is removed from', function () {
            multiCollectionA.remove( model1 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model1] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

        it( 'should trigger a select:all event on a multi-select collection it is removed from, if all remaining models are still selected', function () {
            // It may be counter-intuitive to see a select:all event after a selected model is removed, but after the
            // removal of the model is complete, the selection has shrunk, and the one remaining model is selected, so:
            // select:all.
            var model3 = new Model();
            var model4 = new Model();

            var multiCollection = new MultiSelectCollection( [model3, model4] );
            model3.select();
            model4.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            multiCollection.remove( model3 );
            expect( multiCollection.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [], deselected: [model3] }, multiCollection );
            // or (full signature)
            // expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model3] }, multiCollection, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

        it( 'should trigger a select:none event on a multi-select collection it is removed from, if it has been the only model in a multi-select collection (not shared by another collection)', function () {
            var model3 = new Model();

            var multiCollection = new MultiSelectCollection( [model3] );
            model3.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            multiCollection.remove( model3 );
            expect( multiCollection.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model3] }, multiCollection );
        } );

        it( 'should trigger a select:none event on a multi-select collection it is removed from, if it has been the only model in a multi-select collection (shared by another collection)', function () {
            var multiCollection = new MultiSelectCollection( [model1] );

            spyOn( multiCollection, "trigger" ).and.callThrough();

            multiCollection.remove( model1 );
            expect( multiCollection.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model1] }, multiCollection );
        } );

        it( 'should trigger a deselect:one event on a single-select collection it is removed from, and no other selection-related collection events, if it has been the only model in a multi-select collection (not shared by another collection)', function () {
            var model3 = new Model();

            var singleCollection = new SingleSelectCollection( [model3] );
            model3.select();

            spyOn( singleCollection, "trigger" ).and.callThrough();

            singleCollection.remove( model3 );
            expect( singleCollection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model3, singleCollection );
            expect( singleCollection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
            expect( singleCollection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a deselect:one event on a single-select collection it is removed from, and no other selection-related collection events, if it has been the only model in a multi-select collection (shared by another collection)', function () {
            var singleCollection = new SingleSelectCollection( [model1] );

            spyOn( singleCollection, "trigger" ).and.callThrough();

            singleCollection.remove( model1 );
            expect( singleCollection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollection );
            expect( singleCollection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
            expect( singleCollection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a deselect:one or select:one event on a single-select collection it remains part of', function () {
            multiCollectionA.remove( model1 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:none, select:some or select:all event on a multi-select collection it remains part of', function () {
            singleCollectionA.remove( model1 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

    } );

    describe( "when a selected model is removed, with options.silent enabled", function () {
        var model1, model2,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            if ( singleCollectionA ) singleCollectionA.close();
            if ( multiCollectionA ) multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            singleCollectionA.remove( model1, { silent: true } );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            multiCollectionA.remove( model1, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected if removed from all collections", function () {
            singleCollectionA.remove( model1, { silent: true } );
            multiCollectionA.remove( model1, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had accidentally been re-added to a collection already holding it", function () {
            // This is to make sure that the reference counting, which is going on behind the scenes, does not get out of
            // step.
            singleCollectionA.add( model1 );      // model is already part of the collection, adding it for the second time
            multiCollectionA.add( model1 );       // adding the model for the second time

            singleCollectionA.remove( model1, { silent: true } );
            multiCollectionA.remove( model1, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (single-select collection, closed first)", function () {
            singleCollectionA.close();
            singleCollectionA = undefined;

            multiCollectionA.remove( model1, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (multi-select collection, closed first)", function () {
            multiCollectionA.close();
            multiCollectionA = undefined;

            singleCollectionA.remove( model1, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (single-select collection, closed last)", function () {
            multiCollectionA.remove( model1, { silent: true } );

            singleCollectionA.close();
            singleCollectionA = undefined;

            expect( model1.selected ).toBe( false );
        } );

        it( "should no longer be selected if removed from all collections, even if it had been part of a collection which had simply been closed and all references to it removed (multi-select collection, closed last)", function () {
            singleCollectionA.remove( model1, { silent: true } );

            multiCollectionA.close();
            multiCollectionA = undefined;

            expect( model1.selected ).toBe( false );
        } );

        it( "should remain selected in those collections it has not been removed from (removed from single-select)", function () {
            singleCollectionA.remove( model1, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected in those collections it has not been removed from (removed from multi-select)", function () {
            multiCollectionA.remove( model1, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should remain selected itself if not removed from all collections", function () {
            singleCollectionA.remove( model1, { silent: true } );
            expect( model1.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model while being removed from all collections (single-select collection last)', function () {
            multiCollectionA.remove( model1, { silent: true } );
            singleCollectionA.remove( model1, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model while being removed from all collections (multi-select collection last)', function () {
            singleCollectionA.remove( model1, { silent: true } );
            multiCollectionA.remove( model1, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a single-select collection it is removed from', function () {
            // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent removal.
            singleCollectionA.remove( model1, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
        } );

        it( 'should not trigger an event on a multi-select collection it is removed from', function () {
            // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent removal.
            multiCollectionA.remove( model1, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
        } );

        it( 'should not trigger an event on a multi-select collection it is removed from, if all remaining models are still selected', function () {
            // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent removal.
            var model3 = new Model();
            var model4 = new Model();

            var multiCollection = new MultiSelectCollection( [model3, model4] );
            model3.select();
            model4.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            multiCollection.remove( model3, { silent: true } );
            expect( multiCollection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
        } );

        it( 'should not trigger an event on a single-select collection it remains part of', function () {
            multiCollectionA.remove( model1, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a multi-select collection it remains part of', function () {
            singleCollectionA.remove( model1, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( 'when an unselected model is removed and only selected models are left in the collection', function () {

        var model1, model2, collection;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            model1.select();
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'in a Select.One collection', function () {

            beforeEach( function () {
                collection = new SingleSelectCollection( [model1, model2] );
                spyOn( collection, "trigger" ).and.callThrough();

                collection.remove( model2 );
            } );

            it( 'no selection-related event is fired in the collection', function () {
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:one", "deselect:one", "reselect:one" );
            } );

        } );

        describe( 'in a Select.Many collection', function () {

            beforeEach( function () {
                collection = new MultiSelectCollection( [model1, model2] );
                spyOn( collection, "trigger" ).and.callThrough();

                collection.remove( model2 );
            } );

            it( 'no selection-related event is fired in the collection', function () {
                // The status of the collection changes from some models being selected to all models being selected. That
                // may sound like a trigger for the select:all event, but it is not what the event is for.
                //
                // Even though the status changes, no selection or deselection is involved. We don't have selection events
                // when the status changes, we have them when a selection changes. Put differently, we never have events
                // when both diff.selected and diff.deselected would be empty.
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:none", "select:some", "select:all", "reselect:any" );
            } );

        } );

    } );

    describe( "when a selected model is removed by calling destroy() on it", function () {

        var model1, model2, model3, model4,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model3, model4] );
            multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

            model1.select();
            model2.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            if ( singleCollectionA ) singleCollectionA.close();
            if ( multiCollectionA ) multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            model1.destroy();
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            model2.destroy();
            expect( multiCollectionA.selected[model2.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected in any collection when it is part of multiple collections", function () {
            model3.select();
            model3.destroy();
            expect( singleCollectionA.selected ).toBeUndefined();
            expect( multiCollectionA.selected[model3.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected itself if removed from all collections", function () {
            model3.select();
            model3.destroy();
            expect( model3.selected ).toBe( false );
        } );

        it( 'should trigger a deselected event on the model when removed from a single-select collection', function () {
            model1.destroy();
            expect( model1.trigger ).toHaveBeenCalledWithInitial( "deselected", model1 );
            // or (full signature)
            // expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected", index: 0 } );
        } );

        it( 'should trigger a deselected event on the model when removed from a multi-select collection', function () {
            model2.destroy();
            expect( model2.trigger ).toHaveBeenCalledWithInitial( "deselected", model2 );
            // or (full signature)
            // expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model2, { label: "selected", index: 0 } );
        } );

        it( 'should trigger a deselect:one event on a single-select collection it is removed from', function () {
            model1.destroy();
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

        it( 'should trigger a select:some or select:none event on a multi-select collection it is removed from', function () {
            model2.destroy();
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model2] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [model2] }, multiCollectionA, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

        it( 'should trigger a select:all event on a multi-select collection it is removed from, if all remaining models are still selected', function () {
            var model5 = new Model();
            var model6 = new Model();

            var multiCollection = new MultiSelectCollection( [model5, model6] );
            model5.select();
            model6.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            model5.destroy();
            expect( multiCollection.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [], deselected: [model5] }, multiCollection );
            // or (full signature)
            // expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model5] }, multiCollection, { label: "selected", _externalEvent: "remove", index: 0 } );
        } );

    } );

    describe( "when a selected model is removed by calling destroy() on it, with options.silent enabled", function () {

        var model1, model2, model3, model4,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model3, model4] );
            multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

            model1.select();
            model2.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            if ( singleCollectionA ) singleCollectionA.close();
            if ( multiCollectionA ) multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            model1.destroy( { silent: true } );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            model2.destroy( { silent: true } );
            expect( multiCollectionA.selected[model2.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected in any collection when it is part of multiple collections", function () {
            model3.select();
            model3.destroy( { silent: true } );
            expect( singleCollectionA.selected ).toBeUndefined();
            expect( multiCollectionA.selected[model3.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected itself if removed from all collections", function () {
            model3.select();
            model3.destroy( { silent: true } );
            expect( model3.selected ).toBe( false );
        } );

        it( 'should not trigger a deselected event on the model when removed from a single-select collection', function () {
            model1.destroy( { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should not trigger a deselected event on the model when removed from a multi-select collection', function () {
            model2.destroy( { silent: true } );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should not trigger a deselect:one event on a single-select collection it is removed from', function () {
            model1.destroy( { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( 'should not trigger a select:some or select:none event on a multi-select collection it is removed from', function () {
            model2.destroy( { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
        } );

        it( 'should not trigger a select:all event on a multi-select collection it is removed from, if all remaining models are still selected', function () {
            var model5 = new Model();
            var model6 = new Model();

            var multiCollection = new MultiSelectCollection( [model5, model6] );
            model5.select();
            model6.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            model5.destroy( { silent: true } );
            expect( multiCollection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

    } );

    describe( 'The event @bbs:remove:silent, when triggered by remove()', function () {

        // Only covering remove() here. See also the corresponding tests for the event when triggered by set().

        var removedModel, remainingModel, collection;

        beforeEach( function () {
            removedModel = new Model();
            remainingModel = new Model();

            removedModel.select();
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'in a Select.One collection', function () {

            beforeEach( function () {
                collection = new SingleSelectCollection( [removedModel, remainingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired on remove() with options.silent enabled', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:remove:silent" );
            } );

            it( 'passes along the removed model as first argument', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed model in options.index', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed in order', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.remove( [removedModel, removedModel2, removedModel3], { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 1 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 1 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed in reverse order', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.remove( [removedModel3, removedModel2, removedModel], { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 3 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 2 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'is fired after remove() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.remove( removedModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [remainingModel] );
            } );

            it( 'is fired after the removed model has been processed by Backbone.Select, ie after selections have been updated', function () {
                var selectedInCollection, removedModelSelected;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    selectedInCollection = cbCollection.selected;
                    removedModelSelected = model.selected;
                } );

                collection.remove( removedModel, { silent: true } );
                expect( selectedInCollection ).toBeUndefined();
                expect( removedModelSelected ).toEqual( false );
            } );

            it( 'is not fired on remove() if options.silent is not enabled', function () {
                collection.remove();
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:remove:silent" );
            } );

        } );

        describe( 'in a Select.Many collection', function () {

            beforeEach( function () {
                collection = new MultiSelectCollection( [removedModel, remainingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired on remove() with options.silent enabled', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:remove:silent" );
            } );

            it( 'passes along the removed model as first argument', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed model in options.index', function () {
                collection.remove( removedModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed in order', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.remove( [removedModel, removedModel2, removedModel3], { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 1 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 1 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed in reverse order', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.remove( [removedModel3, removedModel2, removedModel], { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 3 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 2 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'is fired after remove() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.remove( removedModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [remainingModel] );
            } );

            it( 'is fired after the removed model has been processed by Backbone.Select, ie after selections have been updated', function () {
                var selectedInCollection, removedModelSelected;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    selectedInCollection = _.clone( cbCollection.selected );
                    removedModelSelected = model.selected;
                } );

                collection.remove( removedModel, { silent: true } );
                expect( selectedInCollection ).toEqual( {} );
                expect( removedModelSelected ).toEqual( false );
            } );

            it( 'is not fired on remove() if options.silent is not enabled', function () {
                collection.remove();
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:remove:silent" );
            } );

        } );

    } );

} );
