describe( "models shared between multiple collections: adding and removing models with add(), remove(), reset(), and while instantiating", function () {

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
            singleCollectionA.add( model2, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when added to a multi-select collection', function () {
            multiCollectionA.add( model4, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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

    describe( "when a selected model is added with set()", function () {
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
            singleCollectionA.set( model2 );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.set( model2 );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.set( model4 );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2 );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2 );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model2 );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a single-select collection', function () {
            // The reselect event implies some sort of active 'select' action. Simply
            // registering the model status in the new collection does not belong into
            // that category. It does not reflect the action of a user reaffirming a
            // selection.
            singleCollectionA.set( model2 );
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should not trigger a selected event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a reselected event on the model when added to a multi-select collection', function () {
            // See the comment above for the rationale.
            multiCollectionA.set( model4 );
            expect( model4.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( 'should trigger a deselected event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.set( model2 );
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselected event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below.
            multiCollectionA.set( model4 );
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a select:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:one", model2, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should trigger a deselect:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2 );
            expect( singleCollectionA.trigger ).toHaveBeenCalledWithInitial( "deselect:one", model1, singleCollectionA );
            // or (full signature)
            // expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:one event when added to a single-select collection', function () {
            singleCollectionA.set( model2 );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( 'should trigger a select:some or select:all event when added to a multi-select collection', function () {
            multiCollectionA.set( model4 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWithInitial( "select:all", { selected: [model4], deselected: [] }, multiCollectionA );
            // or (full signature)
            // expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model4], deselected: [] }, multiCollectionA, { label: "selected", _externalEvent: "add" } );
        } );

        it( 'should not trigger a reselect:any event when added to a multi-select collection', function () {
            multiCollectionA.set( model4 );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( 'should trigger a select:some or select:none event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.set( model2 );
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a select:all, select:some or select:none event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model2 );

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
            singleCollectionA.set( model2, { silent: true } );
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should deselect any previously selected model in a single-select collection", function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( model1.selected ).toBe( false );
        } );

        it( "should be added to the selected models in a multi-select collection", function () {
            multiCollectionA.set( model4, { silent: true } );
            expect( multiCollectionA.selected[model4.cid] ).not.toBeUndefined();
        } );

        it( "should deselect other selected models in a multi-select collection if they are shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should leave other selected models untouched in a multi-select collection, provided they are not shared with the single-select collection the new model is added to", function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( multiCollectionA.selected[model3.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( model2.selected ).toBe( true );
        } );

        it( 'should not trigger an event on the model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( model2.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { silent: true } );
            expect( model4.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the previously selected model when added to a single-select collection', function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a previously selected model when added to a multi-select collection, as long as old and new models are not shared with a single-select collection', function () {
            // ... in which case only one of them can remain selected, of course. See test below for that.
            multiCollectionA.set( model4, { silent: true } );
            expect( model1.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a single-select collection event when added to a single-select collection', function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when added to a multi-select collection', function () {
            multiCollectionA.set( model4, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the addition is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the addition does not deselect a model in another multi-select collection', function () {
            model5 = new Model();
            singleCollectionB = new SingleSelectCollection( [model5] );
            model5.select();

            singleCollectionB.set( model2, { silent: true } );

            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another single-select collection holding the model', function () {
            singleCollectionB = new SingleSelectCollection();
            singleCollectionB.set( model1, { silent: true } );

            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on another multi-select collection holding the model', function () {
            singleCollectionA.set( model2, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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

                initialize: function () {
                    Backbone.Select.Me.applyTo( this );
                    spyOn( this, "trigger" ).and.callThrough();
                    this.select();
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

                initialize: function () {
                    Backbone.Select.Me.applyTo( this );
                    spyOn( this, "trigger" ).and.callThrough();
                    this.select();
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
            expect( createdModel.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on the model when created in a multi-select collection', function () {
            var createdModel = multiCollectionA.create( {}, { silent: true } );
            expect( createdModel.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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
            singleCollectionA.create( {}, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when created in a multi-select collection', function () {
            multiCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event when the model creation is inducing a deselection in another multi-select collection', function () {
            singleCollectionA.create( {}, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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
            singleCollectionA.remove( model1, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a multi-select collection it is removed from', function () {
            multiCollectionA.remove( model1, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger an event on a multi-select collection it is removed from, if all remaining models are still selected', function () {
            var model3 = new Model();
            var model4 = new Model();

            var multiCollection = new MultiSelectCollection( [model3, model4] );
            model3.select();
            model4.select();

            spyOn( multiCollection, "trigger" ).and.callThrough();

            multiCollection.remove( model3, { silent: true } );
            expect( multiCollection.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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
            singleCollectionA.reset( [model1], { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a collection event when added to a multi-select collection', function () {
            multiCollectionA.reset( [model1], { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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
            singleCollectionA.reset( [model1, model2], { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
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
            multiCollectionA.reset( null, { silent: true } );
            singleCollectionA.reset( null, { silent: true } );
            expect( singleCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

        it( 'should not trigger a multi-select collection event while being removed from all collections, multi-select collection last', function () {
            singleCollectionA.reset( null, { silent: true } );
            multiCollectionA.reset( null, { silent: true } );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalled_ignoringInternalEvents();
        } );

    } );

    describe( 'option signalling the external event', function () {

        describe( 'when a selected model is added', function () {
            var model1, model2, model3, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();
                model2.select();
                model3.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "add" in the deselect:one event when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to the deselected model when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when added to a multi-select collection', function () {
                multiCollectionA.add( model3 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model3], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to another collection when the addition is inducing a deselection there', function () {
                singleCollectionA.add( model2 );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is added with set()', function () {
            var model1, model2, model3, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();
                model2.select();
                model3.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "add" in the deselect:one event when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to the deselected model when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when added to a multi-select collection', function () {
                multiCollectionA.set( model3 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model3], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to another collection when the addition is inducing a deselection there', function () {
                singleCollectionA.set( model2 );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is added with create()', function () {

            // NB In order to create a model **selected**, we need to use a model type which self-selects in initialize().

            var originalBackboneAjax,
                model1, model2,
                singleCollectionA, multiCollectionA;

            beforeAll( function () {
                originalBackboneAjax = Backbone.ajax;
                Backbone.ajax = function () {};
            } );

            afterAll( function () {
                Backbone.ajax = originalBackboneAjax;
            } );

            beforeEach( function () {
                var SelfSelectingModel;

                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                SelfSelectingModel = Model.extend( {

                    initialize: function () {
                        Backbone.Select.Me.applyTo( this );
                        spyOn( this, "trigger" ).and.callThrough();
                        this.select();
                    },

                    urlRoot: "/"

                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1], { model: SelfSelectingModel } );
                multiCollectionA = new MultiSelectCollection( [model1, model2], { model: SelfSelectingModel } );

                model1.select();
                model2.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when created in a single-select collection', function () {
                var createdModel = singleCollectionA.create( {} );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", createdModel, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "add" in the deselect:one event when created in a single-select collection', function () {
                singleCollectionA.create( {} );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to the deselected model when created in a single-select collection', function () {
                singleCollectionA.create( {} );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when created in a multi-select collection', function () {
                var createdModel = multiCollectionA.create( {} );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [createdModel], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to another collection when the model creation is inducing a deselection there', function () {
                singleCollectionA.create( {} );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is removed', function () {
            var model1, model2,
                singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

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
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the deselected model when the model is removed from all collections (single-select collection last)', function () {
                multiCollectionA.remove( model1 );
                singleCollectionA.remove( model1 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the deselected model when the model is removed from all collections (multi-select collection last)', function () {
                singleCollectionA.remove( model1 );
                multiCollectionA.remove( model1 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "remove" in the deselect:one event, and pass along options.index from the remove event, when the model is removed from a single-select collection', function () {
                singleCollectionA.remove( model1 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );

            it( 'should set _externalEvent: "remove" in the select:some or select:none event, and pass along options.index from the remove event, when the model is removed from a multi-select collection', function () {
                multiCollectionA.remove( model1 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [model1] }, multiCollectionA, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );

            it( 'should set _externalEvent: "remove" in the select:all event, and pass along options.index from the remove event, when the model is removed from a multi-select collection and all remaining models are still selected', function () {
                var model3 = new Model();
                var model4 = new Model();

                var multiCollection = new MultiSelectCollection( [model3, model4] );
                model3.select();
                model4.select();

                spyOn( multiCollection, "trigger" ).and.callThrough();

                multiCollection.remove( model3 );
                expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model3] }, multiCollection, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );
        } );

        describe( 'when a selected model is destroyed', function () {
            var model1, model2, model3, model4,
                singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();
                model4 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1, model3, model4] );
                multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

                model3.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the destroyed model', function () {
                model3.destroy();
                expect( model3.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "remove" in the deselect:one event, and pass along options.index from the remove event, when the model is destroyed in a single-select collection', function () {
                model1.select();
                singleCollectionA.trigger.calls.reset();

                model1.destroy();
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );

            it( 'should set _externalEvent: "remove" in the select:some or select:none event, and pass along options.index from the remove event, when the model is destroyed in a multi-select collection', function () {
                model2.select();
                multiCollectionA.trigger.calls.reset();

                model2.destroy();
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model2] }, multiCollectionA, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );

            it( 'should set _externalEvent: "remove" in the select:all event, and pass along options.index from the remove event, when the model is destroyed in a multi-select collection and all remaining models are still selected', function () {
                var model5 = new Model();
                var model6 = new Model();

                var multiCollection = new MultiSelectCollection( [model5, model6] );
                model5.select();
                model6.select();

                spyOn( multiCollection, "trigger" ).and.callThrough();

                model5.destroy();
                expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model5] }, multiCollection, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );
        } );

        // `reset` event:
        //
        // The _externalEvent: "reset" is not implemented. reset() is meant to
        // suppress individual notifications. Just like the add event, selection
        // events are silenced during a reset. Hence, without a selection event,
        // _externalEvent: "reset" won't ever occur.
        //
        // Whatever needs to be done, should be dealt with in the reset event
        // handler.

    } );

    describe( 'registering and unregistering a collection with models', function () {

        var originalBackboneAjax;

        beforeAll( function () {
            originalBackboneAjax = Backbone.ajax;
            Backbone.ajax = function () {};
        } );

        afterAll( function () {
            Backbone.ajax = originalBackboneAjax;
        } );

        describe( 'A single-select collection', function () {

            var model1, model2, model3, models, collection;

            beforeEach( function () {
                SingleSelectCollection = SingleSelectCollection.extend( {
                    url: "/"
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                models = [model1, model2, model3];

                model2.select();

                collection = new SingleSelectCollection();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'is registered with a set of models', function () {

                it( 'when the models are passed in at instantiation', function () {
                    collection = new SingleSelectCollection( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added', function () {
                    collection.add( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added, with options.silent enabled', function () {
                    collection.add( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set()', function () {
                    collection.set( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set(), with options.silent enabled', function () {
                    collection.set( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create()', function () {
                    var createdModel1 = collection.create( {} ),
                        createdModel2 = collection.create( {} ),
                        createdModel3 = collection.create( {} );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create(), with options.silent enabled', function () {
                    var createdModel1 = collection.create( {}, { silent: true } ),
                        createdModel2 = collection.create( {}, { silent: true } ),
                        createdModel3 = collection.create( {}, { silent: true } );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset', function () {
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, with options.silent enabled', function () {
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before', function () {
                    collection.add( models );
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before (options.silent enabled)', function () {
                    collection.add( models );
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

            } );

            describe( 'is unregistered with a set of models', function () {

                it( 'when the models are removed', function () {
                    collection.add( models );
                    collection.remove( models );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are removed, with options.silent enabled', function () {
                    collection.add( models );
                    collection.remove( models, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy();
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed, with options.silent enabled', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy( { silent: true } );
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset', function () {
                    collection.add( models );
                    collection.reset();

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset, with options.silent enabled', function () {
                    collection.add( models );
                    collection.reset( null, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

            } );

        } );

        describe( 'A multi-select collection', function () {

            var model1, model2, model3, models, collection;

            beforeEach( function () {
                MultiSelectCollection = MultiSelectCollection.extend( {
                    url: "/"
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                models = [model1, model2, model3];

                model2.select();

                collection = new MultiSelectCollection();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'is registered with a set of models', function () {

                it( 'when the models are passed in at instantiation', function () {
                    collection = new MultiSelectCollection( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added', function () {
                    collection.add( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added, with options.silent enabled', function () {
                    collection.add( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set()', function () {
                    collection.set( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set(), with options.silent enabled', function () {
                    collection.set( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create()', function () {
                    var createdModel1 = collection.create( {} ),
                        createdModel2 = collection.create( {} ),
                        createdModel3 = collection.create( {} );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create(), with options.silent enabled', function () {
                    var createdModel1 = collection.create( {}, { silent: true } ),
                        createdModel2 = collection.create( {}, { silent: true } ),
                        createdModel3 = collection.create( {}, { silent: true } );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset', function () {
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, with options.silent enabled', function () {
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before', function () {
                    collection.add( models );
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before (options.silent enabled)', function () {
                    collection.add( models );
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

            } );

            describe( 'is unregistered with a set of models', function () {

                it( 'when the models are removed', function () {
                    collection.add( models );
                    collection.remove( models );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are removed, with options.silent enabled', function () {
                    collection.add( models );
                    collection.remove( models, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy();
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed, with options.silent enabled', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy( { silent: true } );
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset', function () {
                    collection.add( models );
                    collection.reset();

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset, with options.silent enabled', function () {
                    collection.add( models );
                    collection.reset( null, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

            } );

        } );

    } );

} );
