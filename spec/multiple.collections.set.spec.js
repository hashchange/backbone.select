describe( "Models shared between multiple collections: adding and removing models with set()", function () {

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

    describe( "when a selected model is added with set()", function () {
        var model1, model2, model3, model4, model5,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();
            model5 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

            model1.select();
            model3.select();
            model4.select();
            model5.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( model5, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.set( model5 );
            expect( singleCollectionA.selected ).toBe( model5 );
        } );

        it( "should deselect a previously selected model as it is removed, provided that the model is not shared by another collection (set() in single-select collection)", function () {
            singleCollectionA.set( model5 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should leave a previously selected model selected as it is removed, provided that the model is shared by another collection (set() in single-select collection)", function () {
            model2.select();
            singleCollectionA.set( model5 );
            expect( model2.selected ).toBe( true );
        } );

        it( "should be added to the selected models in a multi-select collection it is added to", function () {
            multiCollectionA.set( model5 );
            expect( multiCollectionA.selected[model5.cid] ).not.toBeUndefined();
        } );

        it( "should deselect any previously selected models as they are removed, provided that the models are not shared by another collection (set() in multi-select collection)", function () {
            multiCollectionA.set( model5 );
            expect( model3.selected ).toBe( false );
            expect( model4.selected ).toBe( false );
        } );

        it( "should leave any previously selected models selected as they are removed, provided that the models are shared by another collection (set() in multi-select collection)", function () {
            model2.select();
            multiCollectionA.set( model5 );
            expect( model2.selected ).toBe( true );
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model5 );
            expect( model5.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model5 );
            expect( model5.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a single-select collection', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // registering the model status in the new collection does not belong into
            // that category. It does not reflect the action of a user reaffirming a
            // selection.
            singleCollectionA.set( model5 );
            expect( model5.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a selected event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model5 );
            expect( model5.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a multi-select collection', function () {
            // See the comment above for the rationale.
            multiCollectionA.set( model5 );
            expect( model5.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a deselected event on a previously selected model as it is removed, provided that the model is not shared by another collection (set() in single-select collection)', function () {
            singleCollectionA.set( model5 );
            expect( model1.trigger ).toHaveBeenCalledWithInitial( "deselected", model1 );
        } );

        it( 'should not trigger a deselected event on a previously selected model as it is removed, provided that the model is shared by another collection (set() in single-select collection)', function () {
            model2.select();
            model2.trigger.calls.reset();

            singleCollectionA.set( model5 );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringEvents( "remove" );
        } );

        it( 'should trigger a deselected event on any previously selected models as they are removed, provided that the models are not shared by another collection (set() in multi-select collection)', function () {
            multiCollectionA.set( model5 );
            expect( model3.trigger ).toHaveBeenCalledWithInitial( "deselected", model3 );
            expect( model4.trigger ).toHaveBeenCalledWithInitial( "deselected", model4 );
        } );

        it( 'should not trigger a deselected event on any previously selected models as they are removed, provided that the models are shared by another collection (set() in multi-select collection)', function () {
            model2.select();
            model2.trigger.calls.reset();

            multiCollectionA.set( model5 );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringEvents( "remove" );
        } );

        it( 'should trigger a select:one event when added to a single-select collection', function () {
            singleCollectionA.set( model5 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:one", model5, singleCollectionA );
        } );

        it( 'should trigger a deselect:one event when a previously selected model is removed from a single-select collection, provided that the removed model is not shared by another collection', function () {
            // The removed model becomes deselected, then.
            singleCollectionA.set( model5 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
        } );

        it( 'should trigger a deselect:one event when a previously selected model is removed from a single-select collection, even if the removed model is shared by another collection', function () {
            // The removed model remains selected then, but still should trigger a deselect:one event on the collection
            // it is removed from.
            model2.select();
            singleCollectionA.trigger.calls.reset();

            singleCollectionA.set( model5 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model2, singleCollectionA );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.set( model5 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:all event when added to a multi-select collection', function () {
            // Note that only the added model is contained in the diff object, not the removed ones which are deselected.
            // Each removed model fires its own `remove` event, along with a select:all/some/none event of its own.
            // Likewise, each added model gets its own `add` event, followed by an update of the selection.
            multiCollectionA.set( model5 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model5], deselected: [] }, multiCollectionA );
        } );

        it( 'should trigger a select:some or select:all event as previous selected models are removed one by one, in a multi-select collection', function () {
            multiCollectionA.set( model5 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [], deselected: [model3] }, multiCollectionA );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model4] }, multiCollectionA );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            multiCollectionA.set( model5 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should not trigger a select:all, select:some or select:none event in another multi-select collection holding the model', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model4 );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselect:one event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.set( model1 );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a reselect:any event on another multi-select collection holding the model', function () {
            singleCollectionA.set( model2 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

    } );

    describe( "when a selected model is added with set(), with options.silent enabled", function () {
        var model1, model2, model3, model4, model5,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();
            model5 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

            model1.select();
            model3.select();
            model4.select();
            model5.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( model5, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.set( model5, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model5 );
        } );

        it( "should deselect a previously selected model as it is removed, provided that the model is not shared by another collection (set() in single-select collection)", function () {
            singleCollectionA.set( model5, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should leave a previously selected model selected as it is removed, provided that the model is shared by another collection (set() in single-select collection)", function () {
            model2.select();
            singleCollectionA.set( model5, { silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( "should be added to the selected models in a multi-select collection it is added to", function () {
            multiCollectionA.set( model5, { silent: true } );
            expect( multiCollectionA.selected[model5.cid] ).not.toBeUndefined();
        } );

        it( "should deselect any previously selected models as they are removed, provided that the models are not shared by another collection (set() in multi-select collection)", function () {
            multiCollectionA.set( model5, { silent: true } );
            expect( model3.selected ).toBe( false );
            expect( model4.selected ).toBe( false );
        } );

        it( "should leave any previously selected models selected as they are removed, provided that the models are shared by another collection (set() in multi-select collection)", function () {
            model2.select();
            multiCollectionA.set( model5, { silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model5, { silent: true } );
            expect( model5.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model5, { silent: true } );
            expect( model5.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model5, { silent: true } );
            expect( model5.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a deselected event on a previously selected model as it is removed, even if the model is not shared by another collection (set() in single-select collection)', function () {
            // ... so the model actually becomes deselected (would stay selected if it were part of another collection).
            singleCollectionA.set( model5, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a deselected event on any previously selected models as they are removed, even if the models are not shared by another collection (set() in multi-select collection)', function () {
            // See preceding test.
            multiCollectionA.set( model5, { silent: true } );
            expect( model3.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
            expect( model4.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event when added to a single-select collection', function () {
            // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent removal.
            singleCollectionA.set( model5, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
        } );

        it( 'should not trigger a collection event when added to a multi-select collection', function () {
            // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent removal.
            multiCollectionA.set( model5, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
        } );

        it( 'should not trigger a collection event in another multi-select collection holding the model', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model4, { silent: true } );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.set( model1, { silent: true } );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( "when a selected model is added with set(), with options.remove set to false", function () {
        var model1, model2, model3, model4, model5,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1] );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3] );

            model1.select();
            model2.select();
            model3.select();
            model4.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.set( model4, { remove: false } );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a single-select collection', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // registering the model status in the new collection does not belong into
            // that category. It does not reflect the action of a user reaffirming a
            // selection.
            singleCollectionA.set( model2, { remove: false } );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a selected event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { remove: false } );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a multi-select collection', function () {
            // See the comment above for the rationale.
            multiCollectionA.set( model4, { remove: false } );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a deselected event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselected event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below.
            multiCollectionA.set( model4, { remove: false } );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a select:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:one", model2, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should trigger a deselect:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:some or select:all event when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { remove: false } );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model4], deselected: [] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model4], deselected: [] }, multiCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { remove: false } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should trigger a select:some or select:none event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a select:all, select:some or select:none event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model2, { remove: false } );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselect:one event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.set( model1, { remove: false } );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a reselect:any event on another multi-select collection holding the model', function () {
            singleCollectionA.set( model2, { remove: false } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

    } );

    describe( "when a selected model is added with set(), with options.remove set to false, and with options.silent enabled", function () {
        var model1, model2, model3, model4, model5,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1] );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3] );

            model1.select();
            model2.select();
            model3.select();
            model4.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( model4, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.set( model4, { remove: false, silent: true } );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { remove: false, silent: true } );
            expect( model4.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below for that.
            multiCollectionA.set( model4, { remove: false, silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a single-select collection event when added to a single-select collection', function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { remove: false, silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model2, { remove: false, silent: true } );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.set( model1, { remove: false, silent: true } );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another multi-select collection holding the model', function () {
            singleCollectionA.set( model2, { remove: false, silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( 'when a selected model is added with set(), together with a selected model already in the collection', function () {

        var model1, model2, collection;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            model1.select();
            model2.select();
        } );

        describe( 'in a Select.One collection', function () {

            beforeEach( function () {
                collection = new SingleSelectCollection( [model2] );

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'with the existing model passed in first', function () {

                beforeEach( function () {
                    collection.set( [model2, model1] );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model is deselected', function () {
                    expect( model2.selected ).toBe( false );
                } );

                it( 'the new model is selected in the collection', function () {
                    expect( collection.selected ).toBe( model1 );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "add" );
                } );

                it( 'a deselected event is triggered on the existing model', function () {
                    expect( model2.trigger ).toHaveBeenCalledWithInitial( "deselected", model2 );
                } );

                it( 'no reselected event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
                } );

                it( 'a select:one collection event is triggered for the new model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:one", model1, collection );
                } );

                it( 'a deselect:one collection event is triggered for the existing model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model2, collection );
                } );

                it( 'no reselect:one event is triggered', function () {
                    expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
                } );

            } );

            describe( 'with the existing model passed in second', function () {

                // NB This may be surprising, but the order does NOT matter. The result is exactly the same as in the
                // previous test, where the existing model was passed in first.
                //
                // One might expect that the order would matter: that the first model gets deselected by the second -
                // the last one wins. But that doesn't happen because set() just acts as a wrapper around three separate
                // operations, executed in order:
                //
                // - remove() models which are not in the list
                // - update models which already exist in the collection
                // - add() the new models
                //
                // That sequence of operation takes precedence over the order of models in the array. Additions are
                // last, so a selected model which is added "wins" and deselects an existing selected model.

                beforeEach( function () {
                    collection.set( [model1, model2] );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model is deselected', function () {
                    expect( model2.selected ).toBe( false );
                } );

                it( 'the new model is selected in the collection', function () {
                    expect( collection.selected ).toBe( model1 );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "add" );
                } );

                it( 'a deselected event is triggered on the existing model', function () {
                    expect( model2.trigger ).toHaveBeenCalledWithInitial( "deselected", model2 );
                } );

                it( 'no reselected event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
                } );

                it( 'a select:one collection event is triggered for the new model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:one", model1, collection );
                } );

                it( 'a deselect:one collection event is triggered for the existing model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model2, collection );
                } );

                it( 'no reselect:one event is triggered', function () {
                    expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
                } );

            } );

        } );

        describe( 'in a Select.Many collection', function () {
            
            var model3;

            beforeEach( function () {
                model3 = new Model();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'which also contains a third model, not selected, to be removed on set()', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2] );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model remains selected', function () {
                    expect( model2.selected ).toBe( true );
                } );

                it( 'the existing and new model are selected in the collection', function () {
                    var expected = {};
                    expected[model1.cid] = model1;
                    expected[model2.cid] = model2;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "add" );
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'a select:all collection event is triggered for the new model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model1], deselected: [] }, collection );
                } );

                it( 'no collection event is triggered upon removal of the third model', function () {
                    // The collection _status_ changes from some models being selected to all models being selected, but
                    // no selection/deselection is involved. We don't have selection events when the status changes, we
                    // have them when a selection changes. Put differently, we never have events when both diff.selected
                    // and diff.deselected would be empty.
                    //
                    // So the select:all event is only called once, later on, when the new model is added to the
                    // collection.
                    expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "select:all" );
                } );

                it( 'no other selection-related events are triggered in the collection', function () {
                    // We are ignoring namespaced sub events for the labels here (select:all:selected).
                    //
                    // The one select:all event is triggered for the addition of the new model (model1), and has already
                    // been covered in the preceding test.
                    expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:none", "select:some", "reselect:any" );
                } );

            } );

            describe( 'which also contains a third model, selected, to be removed on set()', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );
                    model3.select();

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2] );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model remains selected', function () {
                    expect( model2.selected ).toBe( true );
                } );

                it( 'the existing and new model are selected in the collection', function () {
                    var expected = {};
                    expected[model1.cid] = model1;
                    expected[model2.cid] = model2;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "add" );
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'a select:all collection event is triggered upon removal of the third model', function () {
                    // It may be counter-intuitive to see a select:all event after a selected model is removed, but
                    // after the removal of the model is complete, the selection has shrunk, and the one remaining model
                    // (model2) is selected, so: selected:all.
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [], deselected: [model3] }, collection );
                } );

                it( 'a select:all collection event is triggered for the new model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model1], deselected: [] }, collection );
                } );

                it( 'no other selection-related events are triggered in the collection', function () {
                    // We are ignoring namespaced sub events for the labels here (select:all:selected).
                    //
                    // The two select:all events are triggered for the removal of the excess model (model3), and for the
                    // addition of the new model (model1), and have already been covered in the preceding tests.
                    expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:none", "select:some", "reselect:any" );
                    expect( collection.trigger ).toHaveBeenCalledTwiceForEvents( "select:all" );
                } );

            } );
            
        } );

    } );

    describe( 'when a selected model is added with set(), together with a selected model already in the collection, with options.silent enabled', function () {

        var model1, model2, collection;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            model1.select();
            model2.select();
        } );

        describe( 'in a Select.One collection', function () {

            beforeEach( function () {
                collection = new SingleSelectCollection( [model2] );

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'with the existing model passed in first', function () {

                beforeEach( function () {
                    collection.set( [model2, model1], { silent: true } );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model is deselected', function () {
                    expect( model2.selected ).toBe( false );
                } );

                it( 'the new model is selected in the collection', function () {
                    expect( collection.selected ).toBe( model1 );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered in the collection', function () {
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

            } );

            describe( 'with the existing model passed in second', function () {

                // NB This may be surprising, but the order does NOT matter. The result is exactly the same as in the
                // previous test, where the existing model was passed in first.
                //
                // One might expect that the order would matter: that the first model gets deselected by the second -
                // the last one wins. But that doesn't happen because set() just acts as a wrapper around three separate
                // operations, executed in order:
                //
                // - remove() models which are not in the list
                // - update models which already exist in the collection
                // - add() the new models
                //
                // That sequence of operation takes precedence over the order of models in the array. Additions are
                // last, so a selected model which is added "wins" and deselects an existing selected model.

                beforeEach( function () {
                    collection.set( [model1, model2], { silent: true } );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model is deselected', function () {
                    expect( model2.selected ).toBe( false );
                } );

                it( 'the new model is selected in the collection', function () {
                    expect( collection.selected ).toBe( model1 );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered in the collection', function () {
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

            } );

        } );

        describe( 'in a Select.Many collection', function () {

            var model3;

            beforeEach( function () {
                model3 = new Model();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'which also contains a third model, not selected, to be removed on set()', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { silent: true } );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model remains selected', function () {
                    expect( model2.selected ).toBe( true );
                } );

                it( 'the existing and new model are selected in the collection', function () {
                    var expected = {};
                    expected[model1.cid] = model1;
                    expected[model2.cid] = model2;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered in the collection', function () {
                    // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent
                    // removal.
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                } );

            } );

            describe( 'which also contains a third model, selected, to be removed on set()', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );
                    model3.select();

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { silent: true } );
                } );

                it( 'the new model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'the existing model remains selected', function () {
                    expect( model2.selected ).toBe( true );
                } );

                it( 'the existing and new model are selected in the collection', function () {
                    var expected = {};
                    expected[model1.cid] = model1;
                    expected[model2.cid] = model2;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( 'no event is triggered on the new model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                } );

                it( 'no event is triggered in the collection', function () {
                    // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent
                    // removal.
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                } );

            } );

        } );

    } );

    describe( 'when a selected model is removed by not being included in set()', function () {

        // The majority of these cases are covered in the tests for addition, which also examine the removal of
        // pre-existing models which have been selected. Here, we just cover a few edge cases.

        var model, collection;

        beforeEach( function () {
            model = new Model();
            model.select();
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'by passing an empty model array to set()', function () {

            describe( 'with the removed, selected model being contained in another collection', function () {

                var otherCollection;

                afterEach( function () {
                    otherCollection.close();
                } );

                describe( 'in a Select.One collection', function () {

                    beforeEach( function () {
                        collection = new SingleSelectCollection( [model] );
                        otherCollection = new SingleSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [] );
                    } );

                    it( 'the removed model remains selected', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "remove" );
                    } );

                    it( 'a deselect:one event is triggered in the collection', function () {
                        expect( collection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model, collection );
                    } );

                    it( 'no other selection-related events are triggered in the collection', function () {
                        expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:one", "reselect:one" );
                        expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "deselect:one" );
                    } );
                    
                } );
                
                describe( 'in a Select.Many collection', function () {

                    beforeEach( function () {
                        collection = new MultiSelectCollection( [model] );
                        otherCollection = new MultiSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [] );
                    } );

                    it( 'the removed model remains selected', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toEqual( {} );
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "remove" );
                    } );

                    it( 'a select:none event is triggered in the collection', function () {
                        expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model] }, collection );
                    } );

                    it( 'no other selection-related events are triggered in the collection', function () {
                        expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:all", "select:some", "reselect:any" );
                        expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "select:none" );
                    } );

                } );

            } );

            describe( 'with the removed, selected model not being contained in another collection', function () {

                describe( 'in a Select.One collection', function () {

                    beforeEach( function () {
                        collection = new SingleSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [] );
                    } );

                    it( 'the removed model is deselected', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                    it( 'a deselect event is triggered on the model', function () {
                        expect( model.trigger ).toHaveBeenCalledWithInitial( "deselected", model );
                    } );

                    it( 'no other selection-related events are triggered on the model', function () {
                        expect( model.trigger ).toHaveBeenCalledOnceForEvents( "deselected" );
                        expect( model.trigger ).not.toHaveBeenCalledForEvents( "selected", "reselected" );
                    } );

                    it( 'a deselect:one event is triggered in the collection', function () {
                        expect( collection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model, collection );
                    } );

                    it( 'no other selection-related events are triggered in the collection', function () {
                        expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:one", "reselect:one" );
                        expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "deselect:one" );
                    } );

                } );

                describe( 'in a Select.Many collection', function () {

                    beforeEach( function () {
                        collection = new MultiSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [] );
                    } );

                    it( 'the removed model is deselected', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toEqual( {} );
                    } );

                    it( 'a deselect event is triggered on the model', function () {
                        expect( model.trigger ).toHaveBeenCalledWithInitial( "deselected", model );
                    } );

                    it( 'no other selection-related events are triggered on the model', function () {
                        expect( model.trigger ).toHaveBeenCalledOnceForEvents( "deselected" );
                        expect( model.trigger ).not.toHaveBeenCalledForEvents( "selected", "reselected" );
                    } );

                    it( 'a select:none event is triggered in the collection', function () {
                        expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model] }, collection );
                    } );

                    it( 'no other selection-related events are triggered in the collection', function () {
                        expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:all", "select:some", "reselect:any" );
                        expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "select:none" );
                    } );

                } );

            } );

        } );

    } );

    describe( 'when a selected model is removed by not being included in set(), with options.silent enabled', function () {

        // The majority of these cases are covered in the tests for addition, which also examine the removal of
        // pre-existing models which have been selected. Here, we just cover a few edge cases.

        var model, collection;

        beforeEach( function () {
            model = new Model();
            model.select();
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'by passing an empty model array to set()', function () {

            describe( 'with the removed, selected model being contained in another collection', function () {

                var otherCollection;

                afterEach( function () {
                    otherCollection.close();
                } );

                describe( 'in a Select.One collection', function () {

                    beforeEach( function () {
                        collection = new SingleSelectCollection( [model] );
                        otherCollection = new SingleSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [], { silent: true } );
                    } );

                    it( 'the removed model remains selected', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                    } );

                    it( 'no events are triggered in the collection', function () {
                        // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise
                        // silent removal.
                        expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                    } );

                } );

                describe( 'in a Select.Many collection', function () {

                    beforeEach( function () {
                        collection = new MultiSelectCollection( [model] );
                        otherCollection = new MultiSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [], { silent: true } );
                    } );

                    it( 'the removed model remains selected', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toEqual( {} );
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                    } );

                    it( 'no events are triggered in the collection', function () {
                        // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise
                        // silent removal.
                        expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                    } );

                } );

            } );

            describe( 'with the removed, selected model not being contained in another collection', function () {

                describe( 'in a Select.One collection', function () {

                    beforeEach( function () {
                        collection = new SingleSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [], { silent: true } );
                    } );

                    it( 'the removed model is deselected', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                    } );

                    it( 'no events are triggered in the collection', function () {
                        // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise
                        // silent removal.
                        expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                    } );

                } );

                describe( 'in a Select.Many collection', function () {

                    beforeEach( function () {
                        collection = new MultiSelectCollection( [model] );

                        spyOn( model, "trigger" ).and.callThrough();
                        spyOn( collection, "trigger" ).and.callThrough();

                        collection.set( [], { silent: true } );
                    } );

                    it( 'the removed model is deselected', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the collection does not have a model selected', function () {
                        expect( collection.selected ).toEqual( {} );
                    } );

                    it( 'no events are triggered on the model', function () {
                        expect( model.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
                    } );

                    it( 'no events are triggered in the collection', function () {
                        // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise
                        // silent removal.
                        expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                    } );

                } );

            } );

        } );

    } );

    describe( 'when a selected model is removed by not being included in set(), with options.add set to false', function () {

        describe( 'set() is passed a new, selected model (to be ignored) and an existing, unselected model', function () {

            var model1, model2, model3, collection;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                model1.select();
                model3.select();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'in a Select.One collection', function () {

                beforeEach( function () {
                    collection = new SingleSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { add: false } );
                } );

                it( 'the new, selected (ignored) model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'only the existing model is part of the collection', function () {
                    expect( collection.models ).toEqual( [model2] );
                } );

                it( 'no model is selected in the collection', function () {
                    expect( collection.selected ).toBeUndefined();
                } );

                it( 'no events are fired on the new (ignored) model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'a deselect:one collection event is fired for a removed, selected, third model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model3, collection );
                } );

                it( 'no other selection-related events are fired in the collection', function () {
                    expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "deselect:one" );
                    expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:one", "reselect:one" );
                } );

            } );

            describe( 'in a Select.Many collection', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { add: false } );
                } );

                it( 'the new, selected (ignored) model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'only the existing model is part of the collection', function () {
                    expect( collection.models ).toEqual( [model2] );
                } );

                it( 'no model is selected in the collection', function () {
                    expect( collection.selected ).toEqual( {} );
                } );

                it( 'no events are fired on the new (ignored) model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'a select:none collection event is fired for a removed, selected, third model', function () {
                    expect( collection.trigger ).toHaveBeenCalledWithInitial( "select:none", { selected: [], deselected: [model3] }, collection );
                } );

                it( 'no other selection-related events are fired in the collection', function () {
                    expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "select:none" );
                    expect( collection.trigger ).not.toHaveBeenCalledForEvents( "select:some", "select:all", "reselect:any" );
                } );

            } );

        } );

    } );

    describe( 'when a selected model is removed by not being included in set(), with options.add set to false and options.silent enabled', function () {

        describe( 'set() is passed a new, selected model (to be ignored) and an existing, unselected model', function () {

            var model1, model2, model3, collection;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                model1.select();
                model3.select();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'in a Select.One collection', function () {

                beforeEach( function () {
                    collection = new SingleSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { add: false, silent: true } );
                } );

                it( 'the new, selected (ignored) model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'only the existing model is part of the collection', function () {
                    expect( collection.models ).toEqual( [model2] );
                } );

                it( 'no model is selected in the collection', function () {
                    expect( collection.selected ).toBeUndefined();
                } );

                it( 'no events are fired on the new (ignored) model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired in the collection', function () {
                    // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent
                    // removal.
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                } );

            } );

            describe( 'in a Select.Many collection', function () {

                beforeEach( function () {
                    collection = new MultiSelectCollection( [model2, model3] );

                    spyOn( model1, "trigger" ).and.callThrough();
                    spyOn( model2, "trigger" ).and.callThrough();
                    spyOn( model3, "trigger" ).and.callThrough();
                    spyOn( collection, "trigger" ).and.callThrough();

                    collection.set( [model1, model2], { add: false, silent: true } );
                } );

                it( 'the new, selected (ignored) model remains selected', function () {
                    expect( model1.selected ).toBe( true );
                } );

                it( 'only the existing model is part of the collection', function () {
                    expect( collection.models ).toEqual( [model2] );
                } );

                it( 'no model is selected in the collection', function () {
                    expect( collection.selected ).toEqual( {} );
                } );

                it( 'no events are fired on the new (ignored) model', function () {
                    expect( model1.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired on the existing model', function () {
                    expect( model2.trigger ).not.toHaveBeenCalled();
                } );

                it( 'no events are fired in the collection', function () {
                    // We ignore the "@bbs:remove:silent" event here, which is always fired during an otherwise silent
                    // removal.
                    expect( collection.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:remove:silent" );
                } );

            } );

        } );

    } );

    describe( 'The event @bbs:remove:silent, when triggered by set()', function () {

        // Only covering set() here. See also the corresponding tests for the event when triggered by remove().

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

            it( 'is fired while removing models with set() and options.silent enabled', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:remove:silent" );
            } );

            it( 'passes along the removed model as first argument', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed model in options.index', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 1 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 1 } );
            } );

            it( 'is fired after remove() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.set( remainingModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [remainingModel] );
            } );

            it( 'is fired after the removed model has been processed by Backbone.Select, ie after selections have been updated', function () {
                var selectedInCollection, removedModelSelected;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    selectedInCollection = cbCollection.selected;
                    removedModelSelected = model.selected;
                } );

                collection.set( remainingModel, { silent: true } );
                expect( selectedInCollection ).toBeUndefined();
                expect( removedModelSelected ).toEqual( false );
            } );

            it( 'is not fired on remove() if options.silent is not enabled', function () {
                collection.set( remainingModel );
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:remove:silent" );
            } );

        } );

        describe( 'in a Select.Many collection', function () {

            beforeEach( function () {
                collection = new MultiSelectCollection( [removedModel, remainingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired while removing models with set() and options.silent enabled', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:remove:silent" );
            } );

            it( 'passes along the removed model as first argument', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed model in options.index', function () {
                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
            } );

            it( 'passes along an options object as third argument, containing the index of the removed models in options.index when a series of models are removed', function () {
                var removedModel2 = new Model(),
                    removedModel3 = new Model();

                collection.reset( [removedModel, remainingModel, removedModel2, removedModel3] );
                collection.trigger.calls.reset();

                collection.set( remainingModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel, collection, { silent: true, index: 0 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel2, collection, { silent: true, index: 1 } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:remove:silent", removedModel3, collection, { silent: true, index: 1 } );
            } );

            it( 'is fired after remove() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.set( remainingModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [remainingModel] );
            } );

            it( 'is fired after the removed model has been processed by Backbone.Select, ie after selections have been updated', function () {
                var selectedInCollection, removedModelSelected;

                collection.on( "@bbs:remove:silent", function ( model, cbCollection ) {
                    selectedInCollection = _.clone( cbCollection.selected );
                    removedModelSelected = model.selected;
                } );

                collection.set( remainingModel, { silent: true } );
                expect( selectedInCollection ).toEqual( {} );
                expect( removedModelSelected ).toEqual( false );
            } );

            it( 'is not fired on remove() if options.silent is not enabled', function () {
                collection.set( remainingModel );
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:remove:silent" );
            } );

        } );

    } );

} );
