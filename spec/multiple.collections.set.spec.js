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
            singleCollectionA.set( model5, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event when added to a multi-select collection', function () {
            multiCollectionA.set( model5, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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

} );
