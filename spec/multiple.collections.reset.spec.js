describe( "Models shared between multiple collections: adding and removing models with reset()", function () {

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

    describe( "when a selected model is added by resetting the collection", function () {
        var model1, model2, model3,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1] );
            singleCollectionB = new SingleSelectCollection( [model3] );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3] );

            model1.select();
            model2.select();
            model3.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.reset( [model1] );
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should be selected in a single-select collection if multiple models with selected status are added, and it is the last of them", function () {
            singleCollectionA.reset( [model1, model2] );
            expect( model2.selected ).toBe( true );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should be deselected in a single-select collection if multiple models with selected status are added, and it is not the last of them", function () {
            singleCollectionA.reset( [model1, model2] );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection (being the first of multiple selected models)", function () {
            multiCollectionA.reset( [model1, model3] );
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should be added to the selected models in a multi-select collection (being the last of multiple selected models)", function () {
            multiCollectionA.reset( [model1, model3] );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.reset( [model1, model2] );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.reset( [model1, model2] );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should become deselected if it is not part of any other collections, and is being re-added to the original collection (single-select)", function () {
            // By resetting the collection, the selected model is first removed, then re-added. If the model is not part of
            // any other collection, it loses its 'selected' status while being removed.
            //
            // This is expected behaviour, and it serves a purpose. A reset, with models which are not shared by any other
            // collection, should provide a clean slate.
            multiCollectionA.reset();
            singleCollectionA.reset( [model1] );
            expect( model1.selected ).toBe( false );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should become deselected if it is not part of any other collections, and is being re-added to the original collection (multi-select)", function () {
            // The model loses its 'selected' status while being removed. See comment above.
            singleCollectionA.reset();
            multiCollectionA.reset( [model1, model2] );
            expect( model1.selected ).toBe( false );
            expect( model2.selected ).toBe( false );
            expect( multiCollectionA.selected ).toEqual( {} );
        } );

        it( 'should not trigger a selected event on the model (added to a single-select collection)', function () {
            singleCollectionA.reset( [model1] );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a selected event on the model (added to a multi-select collection)', function () {
            multiCollectionA.reset( [model1] );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model (added to a single-select collection)', function () {
            // For one, reset() is meant to suppress individual notifications. Also,
            // the reselect event implies some sort of active 'select' action, which
            // is not present here. See comments in the 'add' tests for more on the
            // rationale.
            singleCollectionA.reset( [model1] );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a reselected event on the model (added to a multi-select collection)', function () {
            multiCollectionA.reset( [model1] );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a select:one event when added to a single-select collection', function () {
            // reset() is meant to suppress individual notifications. Just like the add event, selection events are silenced.
            // Whatever needs to be done, should be dealt with in the reset event handler.
            singleCollectionA.reset( [model1] );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.reset( [model1] );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a select:some or select:all event when added to a multi-select collection', function () {
            // For the rationale, see above.
            multiCollectionA.reset( [model1] );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            // For the rationale, see above.
            multiCollectionA.reset( [model1] );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should trigger a deselected event on the model when added to a singe-select collection together with other selected models, and it is not the last of them', function () {
            singleCollectionA.reset( [model1, model2] );
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselect:one event when added to a singe-select collection, even if multiple models with selected status are added, and all but the last one are deselected', function () {
            singleCollectionA.reset( [model1, model2] );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( 'should not trigger a reselect:one event when added to a singe-select collection, even if multiple models with selected status are added, and all but the last one are deselected', function () {
            singleCollectionA.reset( [model1, model2] );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:some or select:none event when the reset is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.reset( [model1, model2] );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a reselect:one event on another single-select collection holding the model', function () {
            singleCollectionA.reset( [model3] );
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a reselect:any event on another multi-select collection holding the model', function () {
            singleCollectionA.reset( [model1] );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should not trigger a reselect:any event on another multi-select collection, even when the reset is inducing a change (a deselection) there', function () {
            singleCollectionA.reset( [model1, model2] );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should not leak the internal backboneSubcall flag into the options of the reset event (single-select collection)', function () {
            // To make this test resilient against naming changes of internal flags, we test the absence of **any**
            // unexpected options. We simply expect the unmodified default reset options object, which contains
            // options.previousModels only.
            var resetListener = jasmine.createSpy( "resetListener" );

            singleCollectionA.on( "reset", resetListener );
            singleCollectionA.reset( [model1, model2] );

            expect( resetListener ).toHaveBeenCalledOnce();
            expect( resetListener ).toHaveBeenCalledWith( singleCollectionA, { previousModels: [model1] } );
        } );

        it( 'should not leak the internal backboneSubcall flag into the options of the reset event (multi-select collection)', function () {
            // To make this test resilient against naming changes of internal flags, we test the absence of **any**
            // unexpected options. See above.
            var resetListener = jasmine.createSpy( "resetListener" );

            multiCollectionA.on( "reset", resetListener );
            multiCollectionA.reset( [model1, model2] );

            expect( resetListener ).toHaveBeenCalledOnce();
            expect( resetListener ).toHaveBeenCalledWith( multiCollectionA, { previousModels: [model1, model2, model3] } );
        } );

        it( 'should not leak the internal backboneSubcall flag into the options of the add event when reset is called with an explicit `silent: false` option (single-select collection)', function () {
            // To make this test resilient against naming changes of internal flags, we test the absence of **any**
            // unexpected options. We simply expect the unmodified default reset options object, which contains
            // options.previousModels only.

            // ATTN This Backbone behaviour may change at some point. If, in the future, silent: false no longer
            // triggers an add event, the test can be removed.
            var addListener = jasmine.createSpy( "addListener" );

            singleCollectionA.on( "add", addListener );
            singleCollectionA.reset( [model1, model2], { silent: false } );

            expect( addListener ).toHaveBeenCalledTwice();
            expect( addListener ).toHaveBeenCalledWith( model1, singleCollectionA, jasmine.any( Object ) );
            expect( addListener ).toHaveBeenCalledWith( model2, singleCollectionA, jasmine.any( Object ) );

            var allCallsAllArgs = addListener.calls.allArgs(),
                allArgsByPosition = _.zip.apply( null, allCallsAllArgs ),
                allOptionsObjects = allArgsByPosition[2] || [],
                optionKeys = _.reduce( allOptionsObjects, function ( collected, optionsObject ) {
                    return _.union( collected, _.keys( optionsObject ) );
                }, [] );

            expect( optionKeys ).not.toContain( jasmine.stringMatching( /^@bbs:/ ) );
        } );

        it( 'should not leak the internal backboneSubcall flag into the options of the add event when reset is called with an explicit `silent: false` option (multi-select collection)', function () {
            // Because of the flurry of semi-internal stuff showing up in the add event options here, a the full
            // expected options object would be a brittle construct. We have to make sure that no internal flags are
            // present, so we check for anything that matches the @bbs: prefix.

            // ATTN This Backbone behaviour may change at some point. If, in the future, silent: false no longer
            // triggers an add event, the test can be removed.

            var addListener = jasmine.createSpy( "addListener" );

            multiCollectionA.on( "add", addListener );
            multiCollectionA.reset( [model1, model2], { silent: false } );

            expect( addListener ).toHaveBeenCalledTwice();
            expect( addListener ).toHaveBeenCalledWith( model1, multiCollectionA, jasmine.any( Object ) );
            expect( addListener ).toHaveBeenCalledWith( model2, multiCollectionA, jasmine.any( Object ) );

            var allCallsAllArgs = addListener.calls.allArgs(),
                allArgsByPosition = _.zip.apply( null, allCallsAllArgs ),
                allOptionsObjects = allArgsByPosition[2] || [],
                optionKeys = _.reduce( allOptionsObjects, function ( collected, optionsObject ) {
                    return _.union( collected, _.keys( optionsObject ) );
                }, [] );

            expect( optionKeys ).not.toContain( jasmine.stringMatching( /^@bbs:/ ) );
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.reset( [model1] );
            expect( model1.selected ).toBe( true );
        } );

    } );

    describe( "when a selected model is added by resetting the collection, with options.silent enabled", function () {
        var model1, model2, model3,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1] );
            singleCollectionB = new SingleSelectCollection( [model3] );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3] );

            model1.select();
            model2.select();
            model3.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is added to", function () {
            singleCollectionA.reset( [model1], { silent: true } );
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should be selected in a single-select collection if multiple models with selected status are added, and it is the last of them", function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( model2.selected ).toBe( true );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should be deselected in a single-select collection if multiple models with selected status are added, and it is not the last of them", function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection (being the first of multiple selected models)", function () {
            multiCollectionA.reset( [model1, model3], { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should be added to the selected models in a multi-select collection (being the last of multiple selected models)", function () {
            multiCollectionA.reset( [model1, model3], { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should become deselected if it is not part of any other collections, and is being re-added to the original collection (single-select)", function () {
            // By resetting the collection, the selected model is first removed, then re-added. If the model is not part of
            // any other collection, it loses its 'selected' status while being removed.
            //
            // This is expected behaviour, and it serves a purpose. A reset, with models which are not shared by any other
            // collection, should provide a clean slate.
            multiCollectionA.reset( null, { silent: true } );
            singleCollectionA.reset( [model1], { silent: true } );
            expect( model1.selected ).toBe( false );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should become deselected if it is not part of any other collections, and is being re-added to the original collection (multi-select)", function () {
            // The model loses its 'selected' status while being removed. See comment above.
            singleCollectionA.reset( null, { silent: true } );
            multiCollectionA.reset( [model1, model2], { silent: true } );
            expect( model1.selected ).toBe( false );
            expect( model2.selected ).toBe( false );
            expect( multiCollectionA.selected ).toEqual( {} );
        } );

        it( 'should not trigger an event on the model (added to a single-select collection)', function () {
            singleCollectionA.reset( [model1], { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model (added to a multi-select collection)', function () {
            multiCollectionA.reset( [model1], { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event when added to a single-select collection', function () {
            // We ignore the @bbs:reset:silent event here, which is always fired during an otherwise silent reset.
            singleCollectionA.reset( [model1], { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:reset:silent" );
        } );

        it( 'should not trigger a collection event when added to a multi-select collection', function () {
            // We ignore the @bbs:reset:silent event here, which is always fired during an otherwise silent reset.
            multiCollectionA.reset( [model1], { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:reset:silent" );
        } );

        it( 'should not trigger an event on another single-select collection holding the model', function () {
            singleCollectionA.reset( [model3], { silent: true } );
            expect( singleCollectionB.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another multi-select collection holding the model', function () {
            singleCollectionA.reset( [model1], { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when added to a singe-select collection together with other selected models, and it is not the last of them', function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event when added to a singe-select collection, even if multiple models with selected status are added, and all but the last one are deselected', function () {
            // We ignore the @bbs:reset:silent event here, which is always fired during an otherwise silent reset.
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:reset:silent" );
        } );

        it( 'should not trigger a multi-select collection event when the reset is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.reset( [model1], { silent: true } );
            expect( model1.selected ).toBe( true );
        } );

    } );

    describe( "when a selected model is removed by resetting the collection", function () {
        var model1, model2,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            singleCollectionA.reset();
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            multiCollectionA.reset();
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected if removed from all collections", function () {
            singleCollectionA.reset();
            multiCollectionA.reset();
            expect( model1.selected ).toBe( false );
        } );

        it( "should remain selected in those collections it has not been removed from (removed from single-select)", function () {
            singleCollectionA.reset();
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected in those collections it has not been removed from (removed from multi-select)", function () {
            multiCollectionA.reset();
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should remain selected itself if not removed from all collections", function () {
            singleCollectionA.reset();
            expect( model1.selected ).toBe( true );
        } );

        it( 'should not trigger a deselected event on the model when it is still part of another collection (removed from single-select)', function () {
            singleCollectionA.reset();
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should not trigger a deselected event on the model when it is still part of another collection (removed from multi-select)', function () {
            multiCollectionA.reset();
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a deselected event on the model when removed from all collections (single-select collection last)', function () {
            multiCollectionA.reset();
            singleCollectionA.reset();
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should trigger a deselected event on the model when removed from all collections (multi-select collection last)', function () {
            singleCollectionA.reset();
            multiCollectionA.reset();
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselect:one event when removed from a single-select collection', function () {
            // reset() is meant to suppress individual notifications. Just like the add event, selection events are silenced.
            // Whatever needs to be done, should be dealt with in the reset event handler.
            singleCollectionA.reset();
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( 'should not trigger a select:none event when removed from a multi-select collection', function () {
            // For the rationale, see above.
            multiCollectionA.reset();
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
        } );

        it( 'should not trigger a deselect:one event when removed from all collections, single-select collection last', function () {
            // See above.
            multiCollectionA.reset();
            singleCollectionA.reset();
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( 'should not trigger a select:none event when removed from all collections, multi-select collection last', function () {
            // See above.
            singleCollectionA.reset();
            multiCollectionA.reset();
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
        } );

    } );

    describe( "when a selected model is removed by resetting the collection, with options.silent enabled", function () {
        var model1, model2,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( "should no longer be selected in a single-select collection", function () {
            singleCollectionA.reset( null, { silent: true } );
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should no longer be selected in a multi-select collection", function () {
            multiCollectionA.reset( null, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should no longer be selected if removed from all collections", function () {
            singleCollectionA.reset( null, { silent: true } );
            multiCollectionA.reset( null, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should remain selected in those collections it has not been removed from (removed from single-select)", function () {
            singleCollectionA.reset( null, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected in those collections it has not been removed from (removed from multi-select)", function () {
            multiCollectionA.reset( null, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should remain selected itself if not removed from all collections", function () {
            singleCollectionA.reset( null, { silent: true } );
            expect( model1.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model while being removed from all collections (single-select collection last)', function () {
            multiCollectionA.reset( null, { silent: true } );
            singleCollectionA.reset( null, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model while being removed from all collections (multi-select collection last)', function () {
            singleCollectionA.reset( null, { silent: true } );
            multiCollectionA.reset( null, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a single-select collection event while being removed from all collections, single-select collection last', function () {
            // We ignore the @bbs:reset:silent event here, which is always fired during an otherwise silent reset.
            multiCollectionA.reset( null, { silent: true } );
            singleCollectionA.reset( null, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:reset:silent" );
        } );

        it( 'should not trigger a multi-select collection event while being removed from all collections, multi-select collection last', function () {
            // We ignore the @bbs:reset:silent event here, which is always fired during an otherwise silent reset.
            singleCollectionA.reset( null, { silent: true } );
            multiCollectionA.reset( null, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:reset:silent" );
        } );

    } );

    describe( 'The event @bbs:reset:silent', function () {

        var newPlainModel, newSelectedModel, existingModel, collection;

        beforeEach( function () {
            newPlainModel = new Backbone.Model();
            newSelectedModel = new Model();
            existingModel = new Model();

            existingModel.select();
            newSelectedModel.select();
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'in a Select.One collection', function () {

            beforeEach( function () {
                collection = new SingleSelectCollection( [existingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired on reset() with options.silent enabled', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:reset:silent" );
            } );

            it( 'passes along the collection as first argument', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:reset:silent", collection );
            } );

            it( 'passes along an options object as second argument, containing the previous models in options.previousModels', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:reset:silent", collection, { silent: true, previousModels: [existingModel] } );
            } );

            it( 'is fired after reset() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:reset:silent", function ( cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.reset( [newPlainModel], { silent: true } );
                expect( modelsInCollection ).toEqual( [newPlainModel] );
            } );

            it( 'is fired after new models have been processed by Backbone.Select, ie after selections have been updated and the Select.Me mixin has been applied to plain models', function () {
                var selectedInCollection, pickyType;

                collection.on( "@bbs:reset:silent", function ( cbCollection ) {
                    selectedInCollection = cbCollection.selected;
                    pickyType = cbCollection.first() && cbCollection.first()._pickyType;
                } );

                collection.reset( [newSelectedModel], { silent: true } );
                expect( selectedInCollection ).toBe( newSelectedModel );

                collection.reset( [newPlainModel], { silent: true } );
                expect( pickyType ).toEqual( "Backbone.Select.Me" );
            } );

            it( 'is not fired on reset() if options.silent is not enabled', function () {
                collection.reset();
                expect( collection.trigger ).not.toHaveBeenCalledOnceForEvents( "@bbs:reset:silent" );
            } );

        } );

        describe( 'in a Select.Many collection', function () {

            beforeEach( function () {
                collection = new MultiSelectCollection( [existingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired on reset() with options.silent enabled', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:reset:silent" );
            } );

            it( 'passes along the collection as first argument', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:reset:silent", collection );
            } );

            it( 'passes along an options object as second argument, containing the previous models in options.previousModels', function () {
                collection.reset( null, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:reset:silent", collection, { silent: true, previousModels: [existingModel] } );
            } );

            it( 'is fired after reset() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:reset:silent", function ( cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.reset( [newPlainModel], { silent: true } );
                expect( modelsInCollection ).toEqual( [newPlainModel] );
            } );

            it( 'is fired after new models have been processed by Backbone.Select, ie after selections have been updated and the Select.Me mixin has been applied to plain models', function () {
                var selectedInCollection, pickyType;

                collection.on( "@bbs:reset:silent", function ( cbCollection ) {
                    selectedInCollection = _.clone( cbCollection.selected );
                    pickyType = cbCollection.first() && cbCollection.first()._pickyType;
                } );

                collection.reset( [newSelectedModel], { silent: true } );
                expect( _.values( selectedInCollection ) ).toEqual( [newSelectedModel] );

                collection.reset( [newPlainModel], { silent: true } );
                expect( pickyType ).toEqual( "Backbone.Select.Me" );
            } );

            it( 'is not fired on reset() if options.silent is not enabled', function () {
                collection.reset();
                expect( collection.trigger ).not.toHaveBeenCalledOnceForEvents( "@bbs:reset:silent" );
            } );

        } );

    } );

} );
