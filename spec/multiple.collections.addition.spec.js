describe( "Models shared between multiple collections: adding models during instantiation, with add(), with create()", function () {

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

    describe( "when creating additional collections with a model that is already selected", function () {
        var selectLogger, reselectLogger, LoggedSingleSelectCollection, LoggedMultiSelectCollection,
            model, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            selectLogger = new Logger();
            reselectLogger = new Logger();

            // Always create `var selectLogger = new Logger(); var reselectLogger =
            // new Logger();` before instantiating LoggedSingleSelectCollection, or
            // pass loggers in as options
            LoggedSingleSelectCollection = SingleSelectCollection.extend( {
                initialize: function ( models, options ) {
                    var selectLogger = options && options.selectLogger || selectLogger,
                        reselectLogger = options && options.reselectLogger || reselectLogger;

                    this.on( "select:one", function ( model ) {
                        selectLogger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                    } );
                    this.on( "deselect:one", function ( model ) {
                        selectLogger.log( "deselect:one event: Model " + model.cid + " deselected in collection " + this._pickyCid );
                    } );
                    this.on( "reselect:one", function ( model ) {
                        reselectLogger.log( "reselect:one event: Model " + model.cid + " reselected in collection " + this._pickyCid );
                    } );

                    SingleSelectCollection.prototype.initialize.call( this, models );
                }
            } );

            // Always create `var selectLogger = new Logger(); var reselectLogger =
            // new Logger();` before instantiating LoggedMultiSelectCollection, or
            // pass loggers in as options
            LoggedMultiSelectCollection = MultiSelectCollection.extend( {
                initialize: function ( models, options ) {
                    var selectLogger = options && options.selectLogger || selectLogger,
                        reselectLogger = options && options.reselectLogger || reselectLogger;

                    this.on( "select:none", function () {
                        selectLogger.log( "select:none event fired in collection " + this._pickyCid );
                    } );
                    this.on( "select:some", function () {
                        selectLogger.log( "select:some event fired in collection " + this._pickyCid );
                    } );
                    this.on( "select:all", function () {
                        selectLogger.log( "select:all event fired in collection " + this._pickyCid );
                    } );
                    this.on( "reselect:any", function () {
                        reselectLogger.log( "reselect:any event fired in selected in collection " + this._pickyCid );
                    } );

                    MultiSelectCollection.prototype.initialize.call( this, models );
                }
            } );

            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            singleCollectionA.select( model );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();

            singleCollectionB = new LoggedSingleSelectCollection( [model] );
            multiCollectionA = new LoggedMultiSelectCollection( [model] );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should remain selected in the originating collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be selected in another single-select collection it is added to", function () {
            expect( singleCollectionB.selected ).toBe( model );
        } );

        it( "should be among the selected models in another multi-select collection it is added to", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            expect( model.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:one, select:some or select:all events on a collections it is added to', function () {
            // That is because
            //
            // - the initialize method of a collection is called before the models are
            //   added to it, so it would be too early to fire select:* events
            // - the models are added with a silent reset, so there is nothing to
            //   listen to when the addition is done.
            //
            // These events, if they occurred, would be captured by the logger.
            expect( selectLogger.entries.length ).toEqual( 0 );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // registering the model status in the new collection does not belong into
            // that category. It does not reflect the action of a user reaffirming a
            // selection.
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the originating collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:one or reselect:any event on a collection it is added to", function () {
            expect( reselectLogger.entries.length ).toEqual( 0 );
        } );

        it( "should be selected in a single-select collection if multiple models with selected status are added, and it is the last of them", function () {
            var m1 = new Model(),
                m2 = new Model(),
                collection;

            m1.select();
            m2.select();

            collection = new SingleSelectCollection( [m1, m2] );
            expect( m2.selected ).toBe( true );
            expect( collection.selected ).toBe( m2 );
        } );

        it( "should be deselected in a single-select collection if multiple models with selected status are added, and it is not the last of them", function () {
            var m1 = new Model(),
                m2 = new Model(),
                collection;

            m1.select();
            m2.select();

            //noinspection JSUnusedAssignment
            collection = new SingleSelectCollection( [m1, m2] );
            expect( m1.selected ).toBe( false );
        } );

        it( 'should not trigger a deselect:one event when added to a singe-select collection, even if multiple models with selected status are added, and all but the last one are deselected', function () {
            var options = {
                    selectLogger: new Logger(),
                    reselectLogger: new Logger()
                },
                m1 = new Model(),
                m2 = new Model(),
                collection;

            m1.select();
            m2.select();

            //noinspection JSUnusedAssignment
            collection = new LoggedSingleSelectCollection( [m1, m2], options );
            expect( selectLogger.entries.length ).toEqual( 0 );
        } );

        it( 'should trigger a deselected event on the model when added to a singe-select collection together with other selected models, and it is not the last of them', function () {
            var m1 = new Model(),
                m2 = new Model(),
                collection;

            m1.select();
            m2.select();

            spyOn( m1, "trigger" ).and.callThrough();

            //noinspection JSUnusedAssignment
            collection = new SingleSelectCollection( [m1, m2] );
            expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { label: "selected" } );
        } );
    } );

    describe( "when a selected model is added", function () {
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
            singleCollectionA.add( model2 );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.add( model2 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.add( model2 );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.add( model2 );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.add( model2 );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a single-select collection', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // registering the model status in the new collection does not belong into
            // that category. It does not reflect the action of a user reaffirming a
            // selection.
            singleCollectionA.add( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a selected event on the model when added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a multi-select collection', function () {
            // See the comment above for the rationale.
            multiCollectionA.add( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a deselected event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselected event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below.
            multiCollectionA.add( model4 );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a select:one event when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:one", model2, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should trigger a deselect:one event when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:some or select:all event when added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model4], deselected: [] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model4], deselected: [] }, multiCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should trigger a select:some or select:none event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.add( model2 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a select:all, select:some or select:none event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.add( model2 );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselect:one event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.add( model1 );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a reselect:any event on another multi-select collection holding the model', function () {
            singleCollectionA.add( model2 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

    } );

    describe( "when a selected model is added, with options.silent enabled", function () {
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
            singleCollectionA.add( model2, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model when added to a single-select collection', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when added to a multi-select collection', function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( model4.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below for that.
            multiCollectionA.add( model4, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a single-select collection event when added to a single-select collection', function () {
            // We ignore the "@bbs:add:silent" event here, which is always fired during an otherwise silent addition.
            singleCollectionA.add( model2, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:add:silent" );
        } );

        it( 'should not trigger a multi-select collection event when added to a multi-select collection', function () {
            // We ignore the "@bbs:add:silent" event here, which is always fired during an otherwise silent addition.
            multiCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "@bbs:add:silent" );
        } );

        it( 'should not trigger a multi-select collection event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.add( model2, { silent: true } );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.add( model1, { silent: true } );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another multi-select collection holding the model', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( "when a selected model is re-added to a collection it is already part of", function () {
        var model1, model2, model3, model4,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model3, model4] );

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
            multiCollectionA.close();
        } );

        it( "should remain selected in a single-select collection it is added to", function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should remain part of the selected models in a multi-select collection", function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection", function () {
            singleCollectionA.add( model4 );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.add( model2 );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model when re-added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when re-added to a single-select collection', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // re-registering the model in the collection does not belong into that
            // category. It does not reflect the action of a user reaffirming a selection.
            singleCollectionA.add( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a selected event on the model when re-added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when re-added to a multi-select collection', function () {
            // See the comment above for the rationale.
            multiCollectionA.add( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a deselected event on another selected model when re-added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( model3.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should not trigger a select:one event when re-added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a deselect:one event when re-added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.add( model2 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should not trigger a select:some or select:all event when added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            multiCollectionA.add( model4 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should not trigger a select:all, select:some or select:none event in another multi-select collection which is sharing the model', function () {
            model1.select();
            multiCollectionA.trigger.calls.reset();

            singleCollectionA.add( model1 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWith( "select:all" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWith( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWith( "select:none" );
        } );

        it( 'should not trigger a select:one or deselect:one event in another single-select collection which is sharing the model', function () {
            model1.select();
            singleCollectionA.trigger.calls.reset();

            multiCollectionA.add( model1 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWith( "select:one" );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWith( "deselect:one" );
        } );

        it( 'should not trigger a reselect:any event in another multi-select collection which is sharing the model', function () {
            model1.select();
            multiCollectionA.trigger.calls.reset();

            singleCollectionA.add( model1 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should not trigger a reselect:one event in another single-select collection which is sharing the model', function () {
            model1.select();
            singleCollectionA.trigger.calls.reset();

            multiCollectionA.add( model1 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

    } );

    describe( "when a selected model is re-added to a collection it is already part of, with options.silent enabled", function () {
        var model1, model2, model3, model4,
            singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            model4 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model3, model4] );

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
            multiCollectionA.close();
        } );

        it( "should remain selected in a single-select collection it is added to", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should remain part of the selected models in a multi-select collection", function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection", function () {
            singleCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger any event on the model when re-added to a single-select collection', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any event on the model when re-added to a multi-select collection', function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( model4.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any event on another selected model when re-added to a multi-select collection', function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( model3.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any collection event when re-added to a single-select collection', function () {
            singleCollectionA.add( model2, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any collection event when added to a multi-select collection', function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any collection event in another multi-select collection which is sharing the model', function () {
            model1.select();
            multiCollectionA.trigger.calls.reset();

            singleCollectionA.add( model1, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger any collection event in another single-select collection which is sharing the model', function () {
            model1.select();
            singleCollectionA.trigger.calls.reset();

            multiCollectionA.add( model1, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( "when a selected model is added with create()", function () {

        // NB In order to create a model **selected**, we need to use a model type which self-selects in initialize().

        var originalBackboneAjax,
            model1, model2, model3,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeAll( function () {
            originalBackboneAjax = Backbone.ajax;
            Backbone.ajax = function () {};
        } );

        afterAll( function () {
            Backbone.ajax = originalBackboneAjax;
        } );

        beforeEach( function () {
            var SelfSelectingModel = Model.extend( {

                initialize: function ( attributes, options ) {
                    Backbone.Select.Me.applyTo( this, options );
                    spyOn( this, "trigger" ).and.callThrough();
                    this.select( options );
                },

                urlRoot: "/"

            } );

            model1 = new Model();
            model2 = new Model();
            model3 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1], { model: SelfSelectingModel } );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3], { model: SelfSelectingModel } );

            model1.select();
            model2.select();
            model3.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is created in", function () {
            var createdModel = singleCollectionA.create( {} );
            expect( singleCollectionA.selected ).toBe( createdModel );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.create( {} );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            var createdModel = multiCollectionA.create( {} );
            expect( multiCollectionA.selected[createdModel.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is created in", function () {
            singleCollectionA.create( {} );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is created in", function () {
            singleCollectionA.create( {} );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            var createdModel = singleCollectionA.create( {} );
            expect( createdModel.selected ).toBe( true );
        } );

        it( 'should trigger a selected event on the model when created in a single-select collection', function () {
            var createdModel = singleCollectionA.create( {} );
            expect( createdModel.trigger ).toHaveBeenCalledWithInitial( "selected", createdModel );
        } );

        it( 'should not trigger a reselected event on the model when created a single-select collection', function () {
            var createdModel = singleCollectionA.create( {} );
            expect( createdModel.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a selected event on the model when created in a multi-select collection', function () {
            var createdModel = multiCollectionA.create( {} );
            expect( createdModel.trigger ).toHaveBeenCalledWithInitial( "selected", createdModel );
        } );

        it( 'should not trigger a reselected event on the model when created in a multi-select collection', function () {
            var createdModel = multiCollectionA.create( {} );
            expect( createdModel.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a deselected event on the previously selected model when created in a single-select collection', function () {
            singleCollectionA.create( {} );
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselected event on a previously selected model when created in a multi-select collection', function () {
            multiCollectionA.create( {} );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a select:one event when created in a single-select collection', function () {
            var createdModel = singleCollectionA.create( {} );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:one", createdModel, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", createdModel, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should trigger a deselect:one event when created in a single-select collection', function () {
            singleCollectionA.create( {} );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:one event when created in a single-select collection', function () {
            singleCollectionA.create( {} );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:some or select:all event when created in a multi-select collection', function () {
            var createdModel = multiCollectionA.create( {} );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [createdModel], deselected: [] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [createdModel], deselected: [] }, multiCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:any event when created in a multi-select collection', function () {
            multiCollectionA.create( {} );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should trigger a select:some or select:none event when the model creation is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.create( {} );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

    } );

    describe( "when a selected model is added with create(), with options.silent enabled", function () {

        // NB In order to create a model **selected**, we need to use a model type which self-selects in initialize().

        var originalBackboneAjax,
            model1, model2, model3,
            singleCollectionA, singleCollectionB, multiCollectionA;

        beforeAll( function () {
            originalBackboneAjax = Backbone.ajax;
            Backbone.ajax = function () {};
        } );

        afterAll( function () {
            Backbone.ajax = originalBackboneAjax;
        } );

        beforeEach( function () {
            var SelfSelectingModel = Model.extend( {

                initialize: function ( attributes, options ) {
                    Backbone.Select.Me.applyTo( this, options );
                    spyOn( this, "trigger" ).and.callThrough();
                    // NB In order to make the `silent` option apply to the selection process, it has to be passed on to
                    // the call. Seems obvious, but is easy to miss.
                    this.select( options );
                },

                urlRoot: "/"

            } );

            model1 = new Model();
            model2 = new Model();
            model3 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1], { model: SelfSelectingModel } );
            multiCollectionA = new MultiSelectCollection( [model1, model2, model3], { model: SelfSelectingModel } );

            model1.select();
            model2.select();
            model3.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( model3, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
        } );

        afterEach( function () {
            singleCollectionA.close();
            if ( singleCollectionB ) singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection it is created in", function () {
            var createdModel = singleCollectionA.create( {}, { silent: true } );
            expect( singleCollectionA.selected ).toBe( createdModel );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            var createdModel = multiCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.selected[createdModel.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is created in", function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is created in", function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            var createdModel = singleCollectionA.create( {}, { silent: true } );
            expect( createdModel.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model when created in a single-select collection', function () {
            var createdModel = singleCollectionA.create( {}, { silent: true } );
            expect( createdModel.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "request" );
        } );

        it( 'should not trigger an event on the model when created in a multi-select collection', function () {
            var createdModel = multiCollectionA.create( {}, { silent: true } );
            expect( createdModel.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "request" );
        } );

        it( 'should not trigger an event on the previously selected model when created in a single-select collection', function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a previously selected model when created in a multi-select collection', function () {
            multiCollectionA.create( {}, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a single-select collection event when created in a single-select collection', function () {
            // We ignore the "@bbs:add:silent" event here, which is always fired during an otherwise silent addition.
            singleCollectionA.create( {}, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "request", "@bbs:add:silent" );
        } );

        it( 'should not trigger a multi-select collection event when created in a multi-select collection', function () {
            // We ignore the "@bbs:add:silent" event here, which is always fired during an otherwise silent addition.
            multiCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEventsAnd( "request", "@bbs:add:silent" );
        } );

        it( 'should not trigger a multi-select collection event when the model creation is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( 'The event @bbs:add:silent, when triggered by add()', function () {

        // Only covering add() here. See also the corresponding tests for the event when triggered by set().

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

            it( 'is fired on add() with options.silent enabled', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:add:silent" );
            } );

            it( 'passes along the model as first argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel, collection );
            } );

            it( 'passes along an options object as third argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel, collection, { silent: true } );
            } );

            it( 'is fired after add() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:add:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.add( newPlainModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [existingModel, newPlainModel] );
            } );

            it( 'is fired after new models have been processed by Backbone.Select, ie after selections have been updated and the Select.Me mixin has been applied to plain models', function () {
                var selectedInCollection, pickyType;

                collection.on( "@bbs:add:silent", function ( model, cbCollection ) {
                    selectedInCollection = cbCollection.selected;
                    pickyType = cbCollection.first() && cbCollection.first()._pickyType;
                } );

                collection.add( newSelectedModel, { silent: true } );
                expect( selectedInCollection ).toBe( newSelectedModel );

                collection.add( newPlainModel, { silent: true } );
                expect( pickyType ).toEqual( "Backbone.Select.Me" );
            } );

            it( 'is not fired on add() if options.silent is not enabled', function () {
                collection.add( newPlainModel );
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:add:silent" );
            } );

        } );

        describe( 'in a Select.Many collection', function () {

            beforeEach( function () {
                collection = new MultiSelectCollection( [existingModel] );
                spyOn( collection, "trigger" ).and.callThrough();
            } );

            it( 'is fired on add() with options.silent enabled', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledOnceForEvents( "@bbs:add:silent" );
            } );

            it( 'passes along the model as first argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel );
            } );

            it( 'passes along the collection as second argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel, collection );
            } );

            it( 'passes along an options object as third argument', function () {
                collection.add( newPlainModel, { silent: true } );
                expect( collection.trigger ).toHaveBeenCalledWithInitial( "@bbs:add:silent", newPlainModel, collection, { silent: true } );
            } );

            it( 'is fired after add() has done its job', function () {
                var modelsInCollection;

                collection.on( "@bbs:add:silent", function ( model, cbCollection ) {
                    modelsInCollection = cbCollection.models.slice();
                } );

                collection.add( newPlainModel, { silent: true } );
                expect( modelsInCollection ).toEqual( [existingModel, newPlainModel] );
            } );

            it( 'is fired after new models have been processed by Backbone.Select, ie after selections have been updated and the Select.Me mixin has been applied to plain models', function () {
                var selectedInCollection, pickyType;

                collection.on( "@bbs:add:silent", function ( model, cbCollection ) {
                    selectedInCollection = _.clone( cbCollection.selected );
                    pickyType = cbCollection.first() && cbCollection.first()._pickyType;
                } );

                collection.add( newSelectedModel, { silent: true } );
                expect( _.values( selectedInCollection ) ).toEqual( [existingModel, newSelectedModel] );

                collection.add( newPlainModel, { silent: true } );
                expect( pickyType ).toEqual( "Backbone.Select.Me" );
            } );

            it( 'is not fired on add() if options.silent is not enabled', function () {
                collection.add( newPlainModel );
                expect( collection.trigger ).not.toHaveBeenCalledForEvents( "@bbs:add:silent" );
            } );

        } );

    } );

} );
