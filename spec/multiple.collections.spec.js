describe( "models shared between multiple collections", function () {

    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var SingleSelectCollection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.One.applyTo( this, models );
        }
    } );

    var MultiSelectCollection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.Many.applyTo( this, models );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( "when selecting a model in a single-select collection", function () {
        var model, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            singleCollectionB = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.select( model );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in the originating collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be selected in another single-select collection", function () {
            expect( singleCollectionB.selected ).toBe( model );
        } );

        it( "should be among the selected models in another multi-select collection", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( "should be selected itself", function () {
            expect( model.selected ).toBe( true );
        } );

        it( 'should trigger a selected event on the model', function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionB, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the originating collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on another multi-select collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when selecting a model in a single-select collection, with options.silent enabled", function () {
        var model, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            singleCollectionB = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.select( model, {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in another single-select collection", function () {
            expect( singleCollectionB.selected ).toBe( model );
        } );

        it( "should be among the selected models in another multi-select collection", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );
    } );

    describe( "when selecting a model in a multi-select collection", function () {
        var model, singleCollectionA, multiCollectionA, multiCollectionB;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );
            multiCollectionB = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionB, "trigger" ).and.callThrough();

            multiCollectionA.select( model );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
            multiCollectionB.close();
        } );

        it( "should be selected in the originating collection", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( "should be selected in another single-select collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be among the selected models in another multi-select collection", function () {
            expect( multiCollectionB.selected[model.cid] ).not.toBeUndefined();
        } );

        it( "should be selected itself", function () {
            expect( model.selected ).toBe( true );
        } );

        it( 'should trigger a selected event on the model', function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:all event on the originating collection', function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionB, { label: "selected" } );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:any event on the originating collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( "should not trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on another multi-select collection", function () {
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when selecting a model in a multi-select collection, with options.silent enabled", function () {
        var model, singleCollectionA, multiCollectionA, multiCollectionB;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );
            multiCollectionB = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionB, "trigger" ).and.callThrough();

            multiCollectionA.select( model, {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
            multiCollectionB.close();
        } );

        it( "should be selected in another single-select collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be among the selected models in another multi-select collection", function () {
            expect( multiCollectionB.selected[model.cid] ).not.toBeUndefined();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:some or selected:all event on the originating collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );
    } );

    describe( "when selecting a model, which is shared across collections, with its select method", function () {
        var model, singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            model.select();
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be among the selected models in a multi-select collection", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( "should be selected itself", function () {
            expect( model.selected ).toBe( true );
        } );

        it( 'should trigger a selected event on the model', function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on the single-select collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:all event on the multi-select collection', function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the single-select collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on the multi-select collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when selecting a model, which is shared across collections, with its select method and options.silent enabled", function () {
        var model, singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model = new Model();
            singleCollectionA = new SingleSelectCollection( [model] );
            multiCollectionA = new MultiSelectCollection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            model.select( {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( "should be selected in a single-select collection", function () {
            expect( singleCollectionA.selected ).toBe( model );
        } );

        it( "should be among the selected models in a multi-select collection", function () {
            expect( multiCollectionA.selected[model.cid] ).not.toBeUndefined();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on the multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );
    } );

    describe( "when re-selecting a model in a single-select collection", function () {
        var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1] );
            singleCollectionB = new SingleSelectCollection( [model1] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            multiCollectionA.select( model2 );
            multiCollectionA.select( model1 );


            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.select( model1 );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should not deselect other selected models in a multi-select collection", function () {
            expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should trigger a reselected event on the model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "reselected", model1, { label: "selected" } );
        } );

        it( "should trigger a reselect:one event on the originating collection", function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "reselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( "should trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "reselect:one", model1, singleCollectionB, { label: "selected" } );
        } );

        it( "should trigger a reselect:any event on another multi-select collection, with an array containing the model as second parameter", function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionA, { label: "selected" } );
        } );
    } );

    describe( "when re-selecting a model in a single-select collection, with options.silent enabled", function () {
        var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            singleCollectionB = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            singleCollectionA.select( model1 );

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.select( model1, {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the originating collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on another multi-select collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when re-selecting a model in a multi-select collection", function () {
        var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );
            multiCollectionB = new MultiSelectCollection( [model1, model2] );

            multiCollectionA.select( model1 );

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionB, "trigger" ).and.callThrough();

            multiCollectionA.select( model1 );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
            multiCollectionB.close();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:some or selected:all event on the originating collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should trigger a reselected event on the model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "reselected", model1, { label: "selected" } );
        } );

        it( "should trigger a reselect:any event on the originating collection, with an array containing the model as second parameter", function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionA, { label: "selected" } );
        } );

        it( "should trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "reselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( "should trigger a reselect:any event on another multi-select collection, with an array containing the model as second parameter", function () {
            expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionB, { label: "selected" } );
        } );
    } );

    describe( "when re-selecting a model in a multi-select collection, with options.silent enabled", function () {
        var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );
            multiCollectionB = new MultiSelectCollection( [model1, model2] );

            multiCollectionA.select( model1 );

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionB, "trigger" ).and.callThrough();

            multiCollectionA.select( model1, {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
            multiCollectionB.close();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:some or selected:all event on the originating collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on another multi-select collection', function () {
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:any event on the originating collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );

        it( "should not trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on another multi-select collection", function () {
            expect( multiCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when re-selecting a model, which is shared across collections, with its select method", function () {
        var model1, model2, singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            model1.select();
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( "should remain selected in a single-select collection", function () {
            expect( singleCollectionA.selected ).toBe( model1 );
        } );

        it( "should remain among the selected models in a multi-select collection", function () {
            expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
        } );

        it( "should remain selected itself", function () {
            expect( model1.selected ).toBe( true );
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on the multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should trigger a reselected event on the model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "reselected", model1, { label: "selected" } );
        } );

        it( "should trigger a reselect:one event on the single-select collection", function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "reselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( "should trigger a reselect:any event on the multi-select collection, with an array containing the model as second parameter", function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionA, { label: "selected" } );
        } );
    } );

    describe( "when re-selecting a model, which is shared across collections, with its select method and options.silent enabled", function () {
        var model1, model2, singleCollectionA, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            model1.select( {silent: true} );
        } );

        afterEach( function () {
            singleCollectionA.close();
            multiCollectionA.close();
        } );

        it( 'should not trigger a selected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( 'should not trigger a select:one event on the single-select collection', function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( 'should not trigger a select:some or selected:all event on the multi-select collection', function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( 'should not trigger a reselected event on the model', function () {
            expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the single-select collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on the multi-select collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when a model is already selected and a different model is selected in a single-select collection", function () {
        var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();

            singleCollectionA = new SingleSelectCollection( [model1, model2] );
            singleCollectionB = new SingleSelectCollection( [model1, model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            model1.select();

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.select( model2 );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be selected in the originating collection", function () {
            expect( singleCollectionA.selected ).toBe( model2 );
        } );

        it( "should be selected in another single-select collection", function () {
            expect( singleCollectionB.selected ).toBe( model2 );
        } );

        it( "should be selected in another multi-select collection", function () {
            expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
        } );

        it( "should be selected itself", function () {
            expect( model2.selected ).toBe( true );
        } );

        it( "should deselect the first model", function () {
            expect( model1.selected ).toBe( false );
        } );

        it( "should deselect the first model in another multi-select collection", function () {
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( 'should trigger a selected event on the selected model', function () {
            expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { label: "selected" } );
        } );

        it( 'should trigger a deselected event on the first model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should trigger a deselect:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a deselect:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionB, { label: "selected" } );
        } );

        it( 'should trigger a select:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionB, { label: "selected" } );
        } );

        it( 'should trigger a select:none and a select:some event on another multi-select collection', function () {
            // The process is made up of two steps. First, the previous model is
            // deselected, then the new one selected. Both steps are merged into a
            // single `select:some` event with a unified diff of `{ selected: [model2],
            // deselected: [model1] }`.
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [model2], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should not trigger a reselected event on the selected model', function () {
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event on the originating collection", function () {
            expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:one event on another single-select collection", function () {
            expect( singleCollectionB.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should not trigger a reselect:any event on another multi-select collection", function () {
            expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
        } );
    } );

    describe( "when a model is already selected and a different model is selected with its select method", function () {

        describe( "when both models are shared among multi-select collections only", function () {
            var model1, model2, multiCollectionA, multiCollectionB;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();

                multiCollectionA = new MultiSelectCollection( [model1, model2] );
                multiCollectionB = new MultiSelectCollection( [model1, model2] );

                model1.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                model2.select();
            } );

            afterEach( function () {
                multiCollectionA.close();
                multiCollectionB.close();
            } );

            it( "should be selected in all collections", function () {
                expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
                expect( multiCollectionB.selected[model2.cid] ).not.toBeUndefined();
            } );

            it( "should leave the first model selected in all collections", function () {
                expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
                expect( multiCollectionB.selected[model1.cid] ).not.toBeUndefined();
            } );

            it( 'should not trigger a selected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
            } );

            it( 'should not trigger a deselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
            } );

            it( 'should trigger a selected event on the second model', function () {
                expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { label: "selected" } );
            } );

            it( 'should trigger a select:some or selected:all event on a multi-select collection', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model2], deselected: [] }, multiCollectionA, { label: "selected" } );
            } );

            it( 'should not trigger a reselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected", model1 );
            } );

            it( 'should not trigger a reselected event on the second model', function () {
                expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected", model2 );
            } );

            it( "should not trigger a reselect:any event on a multi-select collection", function () {
                expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when both models are shared, with at least one single-select collection among the collections", function () {
            // As soon as both models are part of a single-select collection, only one of them can be flagged as selected.
            // That even extends to multi-select collections sharing those models.
            var model1, model2, singleCollectionA, multiCollectionA;

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

                model2.select();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( "should be selected in the single-select collection", function () {
                expect( singleCollectionA.selected ).toBe( model2 );
            } );

            it( "should be selected in the multi-select collection", function () {
                expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
            } );

            it( "should deselect the first model", function () {
                expect( model1.selected ).toBe( false );
            } );

            it( "should deselect the first model in the multi-select collection", function () {
                expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
            } );

            it( 'should not trigger a selected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
            } );

            it( 'should trigger a deselected event on the first model', function () {
                expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
            } );

            it( 'should trigger a selected event on the second model', function () {
                expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { label: "selected" } );
            } );

            it( 'should trigger a deselect:one event on the single-select collection', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected" } );
            } );

            it( 'should trigger a select:one event on the single-select collection', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected" } );
            } );

            it( 'should trigger a select:none and a select:some event on the multi-select collection', function () {
                // The process is made up of two steps. First, the previous model is
                // deselected, then the new one selected. Both steps are merged into a
                // single `select:some` event with a unified diff of `{ selected: [model2],
                // deselected: [model1] }`.
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [model2], deselected: [model1] }, multiCollectionA, { label: "selected" } );
            } );

            it( 'should not trigger a reselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected", model1 );
            } );

            it( 'should not trigger a reselected event on the second model', function () {
                expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected", model2 );
            } );

            it( "should not trigger a reselect:one event on the single-select collection", function () {
                expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
            } );

            it( "should not trigger a reselect:any event on the multi-select collection", function () {
                expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when the first model is shared with at least one single-select collection, but not the second", function () {
            var model1, model2, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                model2.select();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( "should be selected itself", function () {
                expect( model2.selected ).toBe( true );
            } );

            it( "should be selected in the multi-select collection", function () {
                expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
            } );

            it( "should leave the first model selected", function () {
                expect( model1.selected ).toBe( true );
            } );

            it( "should leave the first model selected in the single-select collection", function () {
                expect( singleCollectionA.selected ).toBe( model1 );
            } );

            it( "should leave the first model selected in the multi-select collection", function () {
                expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
            } );

            it( 'should not trigger a selected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
            } );

            it( 'should not trigger a deselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
            } );

            it( 'should trigger a selected event on the second model', function () {
                expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { label: "selected" } );
            } );

            it( 'should not trigger a deselect:one event on the single-select collection', function () {
                expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
            } );

            it( 'should not trigger a select:one event on the single-select collection', function () {
                expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
            } );

            it( 'should trigger a select:some or select:all event on the multi-select collection', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model2], deselected: [] }, multiCollectionA, { label: "selected" } );
            } );

            it( 'should not trigger a reselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
            } );

            it( 'should not trigger a reselected event on the second model', function () {
                expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
            } );

            it( "should not trigger a reselect:one event on the single-select collection", function () {
                expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
            } );

            it( "should not trigger a reselect:any event on the multi-select collection", function () {
                expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when the second model is shared with at least one single-select collection, but not the first", function () {

            var model1, model2, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model2] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                model2.select();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( "should be selected itself", function () {
                expect( model2.selected ).toBe( true );
            } );

            it( "should be selected in the single-select collection", function () {
                expect( singleCollectionA.selected ).toBe( model2 );
            } );

            it( "should be selected in the multi-select collection", function () {
                expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
            } );

            it( "should leave the first model selected", function () {
                expect( model1.selected ).toBe( true );
            } );

            it( "should leave the first model selected in the multi-select collection", function () {
                expect( multiCollectionA.selected[model1.cid] ).not.toBeUndefined();
            } );

            it( 'should not trigger a selected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
            } );

            it( 'should not trigger a deselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
            } );

            it( 'should trigger a selected event on the second model', function () {
                expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { label: "selected" } );
            } );

            it( 'should trigger a select:one event on the single-select collection', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { label: "selected" } );
            } );

            it( 'should trigger a select:some or select:all event on the multi-select collection', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model2], deselected: [] }, multiCollectionA, { label: "selected" } );
            } );

            it( 'should not trigger a reselected event on the first model', function () {
                expect( model1.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
            } );

            it( 'should not trigger a reselected event on the second model', function () {
                expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
            } );

            it( "should not trigger a reselect:one event on the single-select collection", function () {
                expect( singleCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
            } );

            it( "should not trigger a reselect:any event on the multi-select collection", function () {
                expect( multiCollectionA.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

    } );

    describe( "when a model is selected and deselect is called in a single-select collection", function () {
        var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1] );
            singleCollectionB = new SingleSelectCollection( [model1] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );

            multiCollectionA.select( model2 );
            singleCollectionA.select( model1 );

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( singleCollectionB, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();

            singleCollectionA.deselect();
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
        } );

        it( "should be deselected in the originating collection", function () {
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should be deselected in another single-select collection", function () {
            expect( singleCollectionB.selected ).toBeUndefined();
        } );

        it( "should be deselected in another multi-select collection", function () {
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should not deselected another selected model in a multi-select collection", function () {
            expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
        } );

        it( "should be deselected itself", function () {
            expect( model1.selected ).toBe( false );
        } );

        it( 'should trigger a deselected event on the model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a selected event on another selected model in a multi-select collection', function () {
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "deselected", model2 );
        } );

        it( 'should trigger a deselect:one event on the originating collection', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a deselect:one event on another single-select collection', function () {
            expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionB, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:none event on another multi-select collection', function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );
    } );

    describe( "when a selected model is deselected in a multi-select collection", function () {
        var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA, multiCollectionB;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            singleCollectionA = new SingleSelectCollection( [model1] );
            singleCollectionB = new SingleSelectCollection( [model2] );
            multiCollectionA = new MultiSelectCollection( [model1, model2] );
            multiCollectionB = new MultiSelectCollection( [model1, model2] );

            multiCollectionA.select( model2 );
            multiCollectionA.select( model1 );

            spyOn( model1, "trigger" ).and.callThrough();
            spyOn( model2, "trigger" ).and.callThrough();
            spyOn( singleCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionA, "trigger" ).and.callThrough();
            spyOn( multiCollectionB, "trigger" ).and.callThrough();

            multiCollectionA.deselect( model1 );
        } );

        afterEach( function () {
            singleCollectionA.close();
            singleCollectionB.close();
            multiCollectionA.close();
            multiCollectionB.close();
        } );

        it( "should be deselected in the originating collection", function () {
            expect( multiCollectionA.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should be deselected in another single-select collection which shares the model", function () {
            expect( singleCollectionA.selected ).toBeUndefined();
        } );

        it( "should be deselected in another multi-select collection", function () {
            expect( multiCollectionB.selected[model1.cid] ).toBeUndefined();
        } );

        it( "should be deselected itself", function () {
            expect( model1.selected ).toBe( false );
        } );

        it( "should not deselect another selected model in a multi-select collection", function () {
            expect( multiCollectionA.selected[model2.cid] ).not.toBeUndefined();
        } );

        it( "should not deselect another selected model which is shared between a multi-select collection and a single-select collection", function () {
            expect( singleCollectionB.selected ).toBe( model2 );
        } );

        it( 'should trigger a deselected event on the model', function () {
            expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { label: "selected" } );
        } );

        it( 'should not trigger a deselected event on another selected model in a multi-select collection', function () {
            expect( model2.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( 'should trigger a select:some or select:none event on the originating collection', function () {
            expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a deselect:one event on a single-select collection sharing the model', function () {
            expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { label: "selected" } );
        } );

        it( 'should trigger a select:some or selected:none event on another multi-select collection', function () {
            expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionB, { label: "selected" } );
        } );
    } );

    describe( 'custom options', function () {

        describe( "when selecting a model in a single-select collection with a custom option", function () {
            var model, singleCollectionA, singleCollectionB, multiCollectionA;

            beforeEach( function () {
                model = new Model();
                singleCollectionA = new SingleSelectCollection( [model] );
                singleCollectionB = new SingleSelectCollection( [model] );
                multiCollectionA = new MultiSelectCollection( [model] );

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( singleCollectionB, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                singleCollectionA.select( model, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                singleCollectionB.close();
                multiCollectionA.close();
            } );

            it( 'should trigger a selected event on the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:one event on the originating collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:one event on another single-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionB, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:some or selected:all event on another multi-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionA, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when re-selecting a model in a single-select collection with a custom option", function () {
            var model, singleCollectionA, singleCollectionB, multiCollectionA;

            beforeEach( function () {
                model = new Model();
                singleCollectionA = new SingleSelectCollection( [model] );
                singleCollectionB = new SingleSelectCollection( [model] );
                multiCollectionA = new MultiSelectCollection( [model] );

                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( singleCollectionB, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                singleCollectionA.select( model, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                singleCollectionB.close();
                multiCollectionA.close();
            } );

            it( 'should trigger a reselected event on the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:one event on the originating collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "reselect:one", model, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:one event on another single-select collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "reselect:one", model, singleCollectionB, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event on another multi-select collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "reselect:any", [model], multiCollectionA, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a model is already selected and a different model is selected in a single-select collection with a custom option", function () {
            var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1, model2] );
                singleCollectionB = new SingleSelectCollection( [model1, model2] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( singleCollectionB, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();

                singleCollectionA.select( model2, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                singleCollectionB.close();
                multiCollectionA.close();
            } );

            it( 'should trigger a selected event on the selected model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model2.trigger ).toHaveBeenCalledWith( "selected", model2, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a deselected event on the first model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a deselect:one event on the originating collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:one event on the originating collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a deselect:one event on another single-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionB, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:one event on another single-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionB.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionB, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:none and a select:some event on another multi-select collection and pass the custom option along in the options object (the last parameter)', function () {
                // The process is made up of two steps. First, the previous model is
                // deselected, then the new one selected. Both steps are merged into a
                // single `select:some` event with a unified diff of `{ selected: [model2],
                // deselected: [model1] }`.
                //
                // The merged event must pass the options object along.
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [model2], deselected: [model1] }, multiCollectionA, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when selecting a model in a multi-select collection with a custom option", function () {
            var model, singleCollectionA, multiCollectionA, multiCollectionB;

            beforeEach( function () {
                model = new Model();
                singleCollectionA = new SingleSelectCollection( [model] );
                multiCollectionA = new MultiSelectCollection( [model] );
                multiCollectionB = new MultiSelectCollection( [model] );

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionB, "trigger" ).and.callThrough();

                multiCollectionA.select( model, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
                multiCollectionB.close();
            } );

            it( 'should trigger a selected event on the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:some or selected:all event on the originating collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:one event on another single-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:some or selected:all event on another multi-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model], deselected: [] }, multiCollectionB, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when re-selecting a model in a multi-select collection with a custom option", function () {
            var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();
                singleCollectionA = new SingleSelectCollection( [model1, model2] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );
                multiCollectionB = new MultiSelectCollection( [model1, model2] );

                multiCollectionA.select( model1 );

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionB, "trigger" ).and.callThrough();

                multiCollectionA.select( model1, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
                multiCollectionB.close();
            } );

            it( 'should trigger a reselected event on the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model1.trigger ).toHaveBeenCalledWith( "reselected", model1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event on the originating collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:one event on another single-select collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "reselect:one", model1, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event on another multi-select collection and pass the custom option along in the options object (the last parameter)", function () {
                expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "reselect:any", [model1], multiCollectionB, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a selected model is deselected in a multi-select collection with a custom option", function () {
            var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA, multiCollectionB;

            beforeEach( function () {
                model1 = new Model();
                model2 = new Model();
                singleCollectionA = new SingleSelectCollection( [model1] );
                singleCollectionB = new SingleSelectCollection( [model2] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );
                multiCollectionB = new MultiSelectCollection( [model1, model2] );

                multiCollectionA.select( model2 );
                multiCollectionA.select( model1 );

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionB, "trigger" ).and.callThrough();

                multiCollectionA.deselect( model1, {foo: "bar"} );
            } );

            afterEach( function () {
                singleCollectionA.close();
                singleCollectionB.close();
                multiCollectionA.close();
                multiCollectionB.close();
            } );

            it( 'should trigger a deselected event on the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( model1.trigger ).toHaveBeenCalledWith( "deselected", model1, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:some or select:none event on the originating collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a deselect:one event on a single-select collection sharing the model and pass the custom option along in the options object (the last parameter)', function () {
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { foo: "bar", label: "selected" } );
            } );

            it( 'should trigger a select:some or selected:none event on another multi-select collection and pass the custom option along in the options object (the last parameter)', function () {
                expect( multiCollectionB.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model1] }, multiCollectionB, { foo: "bar", label: "selected" } );
            } );
        } );

    } );

    describe( 'Timing of events', function () {

        var model1, model2, model3, otherModel,
            singleSelectCollection, otherSingleSelectCollection, thirdSingleSelectCollection,
            multiSelectCollection,
            entities, events, eventStates;

        beforeEach( function () {
            model1 = new Model();
            model2 = new Model();
            model3 = new Model();
            otherModel = new Model();

            singleSelectCollection = new SingleSelectCollection( [ model1, model2, model3 ] );
            otherSingleSelectCollection = new SingleSelectCollection( [ model3, otherModel ] );
            thirdSingleSelectCollection = new SingleSelectCollection( [ model1 ] );
            multiSelectCollection = new MultiSelectCollection( [ model1, model2, model3 ] );

            entities = [
                model1, model2, model3, otherModel,
                singleSelectCollection, otherSingleSelectCollection, thirdSingleSelectCollection,
                multiSelectCollection
            ];
        } );

        afterEach( function () {
            singleSelectCollection.close();
            otherSingleSelectCollection.close();
            thirdSingleSelectCollection.close();
            multiSelectCollection.close();
        } );

        describe( 'when a deselect action is initiated in a model', function () {

            beforeEach( function () {
                model3.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                model3.deselect();
            } );

            it( 'the deselected event fires after the deselection in a related collection has taken place', function () {
                expect( events.get( model3, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model3, "deselected" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );

            it( 'the deselect:* event in a related collection fires after the deselection of the model has taken place', function () {
                expect( events.get( singleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( false );
            } );

            it( 'if the model is part of a second collection, the deselect:* event in the second collection fires after the first collection is updated', function () {
                expect( events.get( otherSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );

            it( 'if the model is part of a second collection, the deselect:* event in the first collection fires after the second collection is updated', function () {
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( otherSingleSelectCollection ).selected ).toBeUndefined();
            } );
        } );

        describe( 'when a select action is initiated in a model', function () {

            beforeEach( function () {
                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                model3.select();
            } );

            it( 'the selected event fires after the status in a related collection is updated', function () {
                expect( events.get( model3, "selected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model3, "selected" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the select:* event in a related collection fires after the model status is updated', function () {
                expect( events.get( singleSelectCollection, "select:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( model3 ).selected ).toBe( true );
            } );


            it( 'if the model is part of a second collection, the select:* event in the second collection fires after the first collection is updated', function () {
                expect( events.get( otherSingleSelectCollection, "select:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "select:one" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'if the model is part of a second collection, the select:* event in the first collection fires after the second collection is updated', function () {
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );
        } );

        describe( 'when a select action is initiated in a model and it triggers the deselection of another model', function () {

            // The deselection events could arguably be fired _before_ the selections
            // take place. But, as a policy, events of any kind are fired after all
            // models and collections have reached a new equilibrium, and all changes
            // of state have taken place (no pending actions).

            beforeEach( function () {
                otherModel.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                model3.select();
            } );

            it( 'the deselected event on the other model fires after the selection of the original model has taken place', function () {
                expect( events.get( otherModel, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherModel, "deselected" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'in a collection holding the other model, the deselect:* event fires after the selection of the original model has taken place', function () {
                expect( events.get( otherSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( true );
            } );
        } );


        describe( 'when a deselect action is initiated in a multi-select collection', function () {

            beforeEach( function () {
                model1.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                multiSelectCollection.deselect( model1 );
            } );

            it( 'the select:none or select:some event fires after the deselection of the model has taken place', function () {
                expect( events.get( multiSelectCollection, "select:none" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( multiSelectCollection, "select:none" ).stateOf( model1 ).selected ).toBe( false );
            } );

            it( 'the select:none or select:some event fires after the deselection in another collection has taken place', function () {
                expect( eventStates.getEvent( multiSelectCollection, "select:none" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );


            it( 'the deselected event fires after the deselection in the originating collection has taken place', function () {
                expect( events.get( model1, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model1, "deselected" ).stateOf( multiSelectCollection ).selected ).toEqual( {} );
            } );

            it( 'the deselected event fires after the deselection in another collection has taken place', function () {
                expect( eventStates.getEvent( model1, "deselected" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );


            it( 'the deselect:* event in another collection fires after the deselection in the originating collection has taken place', function () {
                expect( events.get( singleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( multiSelectCollection ).selected ).toEqual( {} );
            } );

            it( 'the deselect:* event in another collection fires after the deselection of the model has taken place', function () {
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( model1 ).selected ).toBe( false );
            } );
        } );


        describe( 'when a select action is initiated in a multi-select collection', function () {

            beforeEach( function () {
                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                multiSelectCollection.select( model1 );
            } );

            it( 'the select:some or select:all event fires after the model status is updated', function () {
                expect( events.get( multiSelectCollection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( model1 ).selected ).toBe( true );
            } );

            it( 'the select:some or select:all event fires after the status in another collection is updated', function () {
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( singleSelectCollection ).selected ).toBe( model1 );
            } );


            it( 'the selected event fires after the status in the originating collection is updated', function () {
                expect( events.get( model1, "selected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model1, "selected" ).stateOf( multiSelectCollection ).selected[model1.cid] ).toBe( model1 );
            } );

            it( 'the selected event fires after the status in another collection is updated', function () {
                expect( eventStates.getEvent( model1, "selected" ).stateOf( singleSelectCollection ).selected ).toBe( model1 );
            } );


            it( 'the select:* event in another collection fires after the status in the originating collection is updated', function () {
                expect( events.get( singleSelectCollection, "select:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( multiSelectCollection ).selected[model1.cid] ).toBe( model1 );
            } );

            it( 'the select:* event in another collection fires after the model status is updated', function () {
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( model1 ).selected ).toBe( true );
            } );
        } );

        describe( 'when a select action is initiated in a multi-select collection and it triggers the deselection of another model', function () {

            beforeEach( function () {
                otherModel.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                multiSelectCollection.select( model3 );
            } );

            // --------------------------------------------------------------------
            // Events should only be fired after a new equilibrium has been reached.
            // See comment above (test for model.select() action)

            it( 'the deselected event on the other model fires after the selection of the original model has taken place', function () {
                expect( events.get( otherModel, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherModel, "deselected" ).stateOf( model3 ).selected ).toBe( true );
            } );

            it( 'the deselect:* event in another collection fires after the selection of the original model has taken place', function () {
                expect( events.get( otherSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( true );
            } );


            it( 'the deselected event on the other model fires after the selection in the originating collection has taken place', function () {
                expect( eventStates.getEvent( otherModel, "deselected" ).stateOf( multiSelectCollection ).selected[model3.cid] ).toBe( model3 );
            } );

            it( 'the deselect:* event in another collection fires before after the selection in the originating collection has taken place', function () {
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( multiSelectCollection ).selected[model3.cid] ).toBe( model3 );
            } );

            // --------------------------------------------------------------------


            it( 'the selected event on the model fires after the deselection of the other model has taken place', function () {
                expect( events.get( model3, "selected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model3, "selected" ).stateOf( otherModel ).selected ).toBe( false );
            } );

            it( 'the select:some or select:all event in the originating collection fires after the deselection of the other model has taken place', function () {
                expect( events.get( multiSelectCollection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( otherModel ).selected ).toBe( false );
            } );


            it( 'the selected event on the model fires after the deselection in the other collection has taken place', function () {
                expect( eventStates.getEvent( model3, "selected" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the select:some or select:all event in the originating collection fires after the deselection in the other collection has taken place', function () {
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );
        } );


        describe( 'when a deselect action is initiated in a single-select collection', function () {

            beforeEach( function () {
                model3.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                singleSelectCollection.deselect( model3 );
            } );

            it( 'the deselect:one event fires after the deselection of the model has taken place', function () {
                expect( events.get( singleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( false );
            } );

            it( 'the deselect:one event fires after the deselection in another collection has taken place', function () {
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( otherSingleSelectCollection ).selected ).toBeUndefined();
            } );


            it( 'the deselected event fires after the deselection in the originating collection has taken place', function () {
                expect( events.get( model3, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model3, "deselected" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );

            it( 'the deselected event fires after the deselection in another collection has taken place', function () {
                expect( eventStates.getEvent( model3, "deselected" ).stateOf( otherSingleSelectCollection ).selected ).toBeUndefined();
            } );


            it( 'the deselect:* event in another collection fires after the deselection in the originating collection has taken place', function () {
                expect( events.get( otherSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( singleSelectCollection ).selected ).toBeUndefined();
            } );

            it( 'the deselect:* event in another collection fires after the deselection of the model has taken place', function () {
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( false );
            } );

        } );


        describe( 'when a select action is initiated in a single-select collection', function () {

            beforeEach( function () {
                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                singleSelectCollection.select( model3 );
            } );

            it( 'the select:one event fires after the model status is updated', function () {
                expect( events.get( singleSelectCollection, "select:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( model3 ).selected ).toBe( true );
            } );

            it( 'the select:one event fires after the status in another collection is updated', function () {
                expect( eventStates.getEvent( singleSelectCollection, "select:one" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );


            it( 'the selected event fires after the status in the originating collection is updated', function () {
                expect( events.get( model3, "selected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model3, "selected" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the selected event fires after the status in another collection is updated', function () {
                expect( eventStates.getEvent( model3, "selected" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );


            it( 'the select:* event in another collection fires after the status in the originating collection is updated', function () {
                expect( events.get( otherSingleSelectCollection, "select:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "select:one" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the select:* event in another collection fires after the model status is updated', function () {
                expect( eventStates.getEvent( otherSingleSelectCollection, "select:one" ).stateOf( model3 ).selected ).toBe( true );
            } );
        } );


        describe( 'when a select action is initiated in a single-select collection, deselecting the previously selected model', function () {

            // Events should only be fired after a new equilibrium has been reached.
            // See comment above (test for model.select() action)

            beforeEach( function () {
                model1.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                singleSelectCollection.select( model3 );
            } );

            it( 'the deselect:one event fires after the selection of the model has taken place', function () {
                expect( events.get( singleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( true );
            } );

            it( 'the deselect:one event fires after the selection in another collection has taken place', function () {
                expect( eventStates.getEvent( singleSelectCollection, "deselect:one" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );


            it( 'the deselected event fires after the selection in the originating collection has taken place', function () {
                expect( events.get( model1, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( model1, "deselected" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the deselected event fires after the selection in another collection has taken place', function () {
                expect( eventStates.getEvent( model1, "deselected" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );


            it( 'the deselect:one event in another collection fires after the selection in the originating collection has taken place', function () {
                expect( events.get( thirdSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( thirdSingleSelectCollection, "deselect:one" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the deselect:one event in another collection fires after the selection of the model has taken place', function () {
                expect( eventStates.getEvent( thirdSingleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( true );
            } );


            it( 'the aggregate select:some event in another multi-select collection fires after the selection in the originating collection has taken place', function () {
                expect( events.get( multiSelectCollection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the aggregate select:some event in another multi-select collection fires after the selection of the model has taken place', function () {
                expect( eventStates.getEvent( multiSelectCollection, "select:some" ).stateOf( model3 ).selected ).toBe( true );
            } );
        } );


        describe( 'when a select action is initiated in a single-select collection and it triggers the deselection of a model in another collection', function () {

            // NB The deselected model is not shared with the originating collection

            // Events should only be fired after a new equilibrium has been reached.
            // See comment above (test for model.select() action)

            beforeEach( function () {
                otherModel.select();

                events = getEventSpies( entities );
                eventStates = getEventStateStore( entities );

                singleSelectCollection.select( model3 );
            } );

            it( 'the deselected event on the other model fires after the selection in the originating collection has taken place', function () {
                expect( events.get( otherModel, "deselected" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherModel, "deselected" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the deselected event on the other model fires after the selection in another collection has taken place', function () {
                expect( eventStates.getEvent( otherModel, "deselected" ).stateOf( otherSingleSelectCollection ).selected ).toBe( model3 );
            } );


            it( 'the deselect:* event in the other collection fires after the selection in the originating collection has taken place', function () {
                expect( events.get( otherSingleSelectCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( singleSelectCollection ).selected ).toBe( model3 );
            } );

            it( 'the deselect:* event in the other collection fires after the selection of the model has taken place', function () {
                expect( eventStates.getEvent( otherSingleSelectCollection, "deselect:one" ).stateOf( model3 ).selected ).toBe( true );
            } );
        } );
    } );

    describe( 'Aggregation of multi-select events', function () {

        var modelSharedWithSingleA, modelSharedWithSingleB, modelSharedWithAll, modelInMultiOnly,
            singleSelectCollectionA, singleSelectCollectionB,
            multiSelectCollectionA, multiSelectCollectionB,
            entities, events, eventStates;

        beforeAll( function () {
            // The ListenerMixin creates huge nested structures. By default, they break the pretty printer in Jasmine 2
            // (was ok in Jasmine 1.3 for some reason).
            //
            // We prevent that by limiting the recursion depth of the pretty printer to 10 for this particular group of
            // tests (default is 40).
            limitJasmineRecursiveScreenOutput( Math.min( jasmine.MAX_PRETTY_PRINT_DEPTH, 10 ) );
        } );

        afterAll( function () {
            restoreJasmineRecursiveScreenOutput();
        } );

        beforeEach( function () {
            modelSharedWithSingleA = new Model();
            modelSharedWithSingleB = new Model();
            modelSharedWithAll = new Model();
            modelInMultiOnly = new Model();

            singleSelectCollectionA = new SingleSelectCollection( [ modelSharedWithSingleA, modelSharedWithAll ] );
            singleSelectCollectionB = new SingleSelectCollection( [ modelSharedWithSingleB, modelSharedWithAll ] );
            multiSelectCollectionA = new MultiSelectCollection( [ modelSharedWithSingleA, modelSharedWithAll ] );
            multiSelectCollectionB = new MultiSelectCollection( [ modelInMultiOnly, modelSharedWithSingleA, modelSharedWithSingleB, modelSharedWithAll ] );

            singleSelectCollectionA.select( modelSharedWithSingleA );
            singleSelectCollectionB.select( modelSharedWithSingleB );
            modelInMultiOnly.select();

            entities = [
                modelSharedWithSingleA, modelSharedWithSingleB, modelSharedWithAll, modelInMultiOnly,
                singleSelectCollectionA, singleSelectCollectionB,
                multiSelectCollectionA, multiSelectCollectionB
            ];

            events = getEventSpies( entities );
            eventStates = getEventStateStore( entities );
        } );

        afterEach( function () {
            singleSelectCollectionA.close();
            singleSelectCollectionB.close();
            multiSelectCollectionA.close();
            multiSelectCollectionB.close();
        } );

        describe( 'when a select action goes along with a deselect sub action, the deselection being triggered in another collection', function () {

            beforeEach( function () {
                modelSharedWithAll.select();
            } );

            it( 'a multi-select collection joins the deselect and select action into a single select:some event', function () {
                expect( events.get( multiSelectCollectionA, "select:some" ) ).toHaveBeenCalledOnce();
                expect( events.get( multiSelectCollectionA, "select:some" ) ).toHaveBeenCalledWith(
                    { selected: [modelSharedWithAll], deselected: [modelSharedWithSingleA] },
                    multiSelectCollectionA,
                    { label: "selected" }
                );
            } );

            it( 'the multi-select collection does not fire a separate select:none event', function () {
                expect( events.get( multiSelectCollectionA, "select:none" ) ).not.toHaveBeenCalled();
            } );

            it( 'another multi-select collection joins the deselect and select action into a single event, too, without spillover of data from the other collection', function () {
                expect( events.get( multiSelectCollectionB, "select:some" ) ).toHaveBeenCalledOnce();
                expect(events.get( multiSelectCollectionB, "select:some" ) ).toHaveBeenCalledWith(
                    { selected: [modelSharedWithAll], deselected: [modelSharedWithSingleA, modelSharedWithSingleB] },
                    multiSelectCollectionB,
                    { label: "selected" }
                );
            } );

            it( 'the select:some events of the multi-select collections fire after the selection of the model has taken place', function () {
                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( modelSharedWithAll ).selected ).toBe( true );
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( modelSharedWithAll ).selected ).toBe( true );
            } );

            it( 'the select:some events of the multi-select collections fire after the deselection of the models have taken place', function () {
                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( modelSharedWithSingleA ).selected ).toBe( false );
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( modelSharedWithSingleA ).selected ).toBe( false );

                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( modelSharedWithSingleB ).selected ).toBe( false );
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( modelSharedWithSingleB ).selected ).toBe( false );
            } );

            it( 'the select:some events of the multi-select collections fire after the selections in the single-select collections have taken place', function () {
                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( singleSelectCollectionA ).selected ).toBe( modelSharedWithAll );
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( singleSelectCollectionA ).selected ).toBe( modelSharedWithAll );

                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( singleSelectCollectionB ).selected ).toBe( modelSharedWithAll );
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( singleSelectCollectionB ).selected ).toBe( modelSharedWithAll );
            } );

            it( 'the select:some event of the first multi-select collection fires after the selection in the second multi-select collection has been updated', function () {
                var expectedSelection = {};
                expectedSelection[modelInMultiOnly.cid] = modelInMultiOnly;
                expectedSelection[modelSharedWithAll.cid] = modelSharedWithAll;
                expect( eventStates.getEvent( multiSelectCollectionA, "select:some" ).stateOf( multiSelectCollectionB ).selected ).toEqual( expectedSelection );
            } );

            it( 'the select:some event of the second multi-select collection fires after the selection in the first multi-select collection has been updated', function () {
                var expectedSelection = {};
                expectedSelection[modelSharedWithAll.cid] = modelSharedWithAll;
                expect( eventStates.getEvent( multiSelectCollectionB, "select:some" ).stateOf( multiSelectCollectionA ).selected ).toEqual( expectedSelection );
            } );
        } );

        describe( 'when a select action goes along with a deselect sub action, and a custom option is provided to the initial select action', function () {

            beforeEach( function () {
                modelSharedWithAll.select( { foo: "bar" } );
            } );

            it( 'the custom option is passed on to the joint select:some event in a multi-select collection', function () {
                expect( events.get( multiSelectCollectionA, "select:some" ) ).toHaveBeenCalledWith(
                    { selected: [modelSharedWithAll], deselected: [modelSharedWithSingleA] },
                    multiSelectCollectionA,
                    { foo: "bar", label: "selected"  }
                );
            } );

            it( 'the custom option is passed on to the joint select:some event in a second multi-select collection', function () {
                expect( events.get( multiSelectCollectionB, "select:some" ) ).toHaveBeenCalledWith(
                    { selected: [modelSharedWithAll], deselected: [modelSharedWithSingleA, modelSharedWithSingleB] },
                    multiSelectCollectionB,
                    { foo: "bar", label: "selected"  }
                );
            } );
        } );

    } );

} );
