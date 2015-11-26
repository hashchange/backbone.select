describe( "multi-select collection: interaction with selectable models", function () {
    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var Collection = Backbone.Collection.extend( {
        initialize: function ( models, options ) {
            Backbone.Select.Many.applyTo( this, models, options );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( "select / deselect the model directly", function () {

        describe( "when 1 out of 2 models in a collection is being selected", function () {
            var m1, m2, collection, selectedEventState, selectSomeEventState;

            beforeEach( function () {
                selectedEventState = { model: {}, collection: {} };
                selectSomeEventState = { m1: {}, collection: {} };

                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                spyOn( collection, "trigger" ).and.callThrough();

                m1.on( 'selected', function ( model ) {
                    selectedEventState.model.selected = model.selected;
                    selectedEventState.collection.selected = _.clone( collection.selected );
                    selectedEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.on( 'select:some', function () {
                    selectSomeEventState.m1.selected = m1.selected;
                    selectSomeEventState.collection.selected = _.clone( collection.selected );
                    selectSomeEventState.collection.selectedLength = collection.selectedLength;
                } );

                m1.select();
            } );

            it( "should trigger a select:some event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [m1], deselected: [] }, collection, { label: "selected" } );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should have the selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should not have the unselected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBeUndefined();
            } );

            it( 'should trigger the model\'s selected event after the model status has been updated', function () {
                expect( selectedEventState.model.selected ).toEqual( true );
            } );

            it( 'should trigger the model\'s selected event after the collection\'s selected models have been updated', function () {
                expect( selectedEventState.collection.selected[m1.cid] ).toEqual( m1 );
            } );

            it( 'should trigger the model\'s selected event after the collection\'s selected length has been updated', function () {
                expect( selectedEventState.collection.selectedLength ).toBe( 1 );
            } );

            it( 'should trigger the collection\'s select:some event after the model status has been updated', function () {
                expect( selectSomeEventState.m1.selected ).toEqual( true );
            } );

            it( 'should trigger the collection\'s select:some event after the collection\'s selected models have been updated', function () {
                expect( selectSomeEventState.collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( 'should trigger the collection\'s select:some event after the collection\'s selected length has been updated', function () {
                expect( selectSomeEventState.collection.selectedLength ).toBe( 1 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is being selected, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {silent: true} );
            } );

            it( "should not trigger a select:some event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should have the selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should not have the unselected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBeUndefined();
            } );
        } );

        describe( "when 2 out of 2 models in a collection are being selected", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m2.select();
            } );

            it( "should trigger a select:all event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m2], deselected: [] }, collection, { label: "selected" } );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when 2 out of 2 models in a collection are being selected, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {silent: true} );
                m2.select( {silent: true} );
            } );

            it( "should not trigger a select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when a model is being selected and then deselected", function () {
            var m1, collection, selectedEventState, selectNoneEventState;

            beforeEach( function () {
                selectedEventState = { model: {}, collection: {} };
                selectNoneEventState = { m1: {}, collection: {} };

                m1 = new Model();

                collection = new Collection( [m1] );
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select();

                m1.on( 'deselected', function ( model ) {
                    selectedEventState.model.selected = model && model.selected;
                    selectedEventState.collection.selected = _.clone( collection.selected );
                    selectedEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.on( 'select:none', function () {
                    selectNoneEventState.m1.selected = m1.selected;
                    selectNoneEventState.collection.selected = _.clone( collection.selected );
                    selectNoneEventState.collection.selectedLength = collection.selectedLength;
                } );

                m1.deselect();
            } );

            it( "should trigger a select:none event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [m1] }, collection, { label: "selected" } );
            } );

            it( "should trigger a 'selected' event with the selected model", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "selected", m1, { label: "selected" } );
            } );

            it( "should trigger a 'deselected' event with the deselected model", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "deselected", m1, { label: "selected" } );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have the model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );

            it( 'should trigger the model\'s deselected event after the model status has been updated', function () {
                expect( selectedEventState.model.selected ).toEqual( false );
            } );

            it( 'should trigger the model\'s deselected event after the collection\'s selected models have been updated', function () {
                expect( selectedEventState.collection.selected ).toEqual( {} );
            } );

            it( 'should trigger the model\'s deselected event after the collection\'s selected length has been updated', function () {
                expect( selectedEventState.collection.selectedLength ).toBe( 0 );
            } );

            it( 'should trigger the collection\'s select:none event after the model status has been updated', function () {
                expect( selectNoneEventState.m1.selected ).toEqual( false );
            } );

            it( 'should trigger the collection\'s select:none event after the collection\'s selected models have been updated', function () {
                expect( selectNoneEventState.collection.selected ).toEqual( {} );
            } );

            it( 'should trigger the collection\'s select:none event after the collection\'s selected length has been updated', function () {
                expect( selectNoneEventState.collection.selectedLength ).toBe( 0 );
            } );
        } );

        describe( "when a model is being selected and then deselected, with options.silent enabled", function () {
            var m1, collection;

            beforeEach( function () {
                m1 = new Model();

                collection = new Collection( [m1] );
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {silent: true} );
                m1.deselect( {silent: true} );
            } );

            it( "should not trigger a select:none event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            } );

            it( "should not trigger a 'selected' event with the selected model", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
            } );

            it( "should not trigger a 'deselected' event with the deselected model", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have the model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );
        } );

        describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the model's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m2.select();
            } );

            it( "should trigger a select:all event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m2], deselected: [] }, collection, { label: "selected" } );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the model's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m2.select( {silent: true} );
            } );

            it( "should not trigger a select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when all models are selected and deselecting one via the model's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.deselect();
            } );

            it( "should trigger a select:some event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [m1] }, collection, { label: "selected" } );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should not have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when all models are selected and deselecting one via the model's deselect, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.deselect( {silent: true} );
            } );

            it( "should not trigger a select:some event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should not have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and deselecting the last one via the model's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.deselect();
            } );

            it( "should trigger a select:none event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [m1] }, collection, { label: "selected" } );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have any models in the selected list", function () {
                var size = _.size( collection.selected );
                expect( size ).toBe( 0 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and deselecting the last one via the model's deselect, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.deselect( {silent: true} );
            } );

            it( "should not trigger a select:none event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have any models in the selected list", function () {
                var size = _.size( collection.selected );
                expect( size ).toBe( 0 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and re-selecting a model via the model's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.select();
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should trigger a reselect:any event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { label: "selected" } );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and re-selecting a model via the model's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {silent: true} );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when all models are selected, and re-selecting a model via the model's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.select();
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should trigger a reselect:any event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { label: "selected" } );
            } );
        } );

        describe( "when all models are selected, and re-selecting a model via the model's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select();

                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {silent: true} );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and deselecting the one which hadn't been selected, via the model's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                m2.deselect();
            } );

            it( "should not trigger a select:some or select:none event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

    } );

    describe( "select / deselect through the collection", function () {

        describe( "when selecting a model through the collection's select method", function () {
            var m1, collection, selectedEventState, selectAllEventState;

            beforeEach( function () {
                selectedEventState = { model: {}, collection: {} };
                selectAllEventState = { m1: {}, collection: {} };

                m1 = new Model();
                spyOn( m1, "select" ).and.callThrough();
                collection = new Collection( [m1] );

                spyOn( collection, "trigger" ).and.callThrough();

                m1.on( 'selected', function ( model ) {
                    selectedEventState.model.selected = model && model.selected;
                    selectedEventState.collection.selected = _.clone( collection.selected );
                    selectedEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.on( 'select:all', function () {
                    selectAllEventState.m1.selected = m1.selected;
                    selectAllEventState.collection.selected = _.clone( collection.selected );
                    selectAllEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.select( m1 );
            } );

            it( "should select the model", function () {
                expect( m1.select ).toHaveBeenCalled();
            } );

            it( 'should trigger the model\'s selected event after the model status has been updated', function () {
                expect( selectedEventState.model.selected ).toEqual( true );
            } );

            it( 'should trigger the model\'s selected event after the collection\'s selected models have been updated', function () {
                expect( selectedEventState.collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( 'should trigger the model\'s selected event after the collection\'s selected length has been updated', function () {
                expect( selectedEventState.collection.selectedLength ).toBe( 1 );
            } );

            it( 'should trigger the collection\'s select:all event after the model status has been updated', function () {
                expect( selectAllEventState.m1.selected ).toEqual( true );
            } );

            it( 'should trigger the collection\'s select:all event after the collection\'s selected models have been updated', function () {
                expect( selectAllEventState.collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( 'should trigger the collection\'s select:all event after the collection\'s selected length has been updated', function () {
                expect( selectAllEventState.collection.selectedLength ).toBe( 1 );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when deselecting a model through the collection's select method", function () {
            var m1, collection, selectedEventState, selectNoneEventState;

            beforeEach( function () {
                selectedEventState = { model: {}, collection: {} };
                selectNoneEventState = { m1: {}, collection: {} };

                m1 = new Model();
                spyOn( m1, "deselect" ).and.callThrough();

                collection = new Collection( [m1] );
                m1.select();

                m1.on( 'deselected', function ( model ) {
                    selectedEventState.model.selected = model && model.selected;
                    selectedEventState.collection.selected = _.clone( collection.selected );
                    selectedEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.on( 'select:none', function () {
                    selectNoneEventState.m1.selected = m1.selected;
                    selectNoneEventState.collection.selected = _.clone( collection.selected );
                    selectNoneEventState.collection.selectedLength = collection.selectedLength;
                } );

                collection.deselect( m1 );
            } );

            it( "should deselect the model", function () {
                expect( m1.deselect ).toHaveBeenCalled();
            } );

            it( 'should trigger the model\'s deselected event after the model status has been updated', function () {
                expect( selectedEventState.model.selected ).toEqual( false );
            } );

            it( 'should trigger the model\'s deselected event after the collection\'s selected models have been updated', function () {
                expect( selectedEventState.collection.selected ).toEqual( {} );
            } );

            it( 'should trigger the model\'s deselected event after the collection\'s selected length has been updated', function () {
                expect( selectedEventState.collection.selectedLength ).toBe( 0 );
            } );

            it( 'should trigger the collection\'s select:none event after the model status has been updated', function () {
                expect( selectNoneEventState.m1.selected ).toEqual( false );
            } );

            it( 'should trigger the collection\'s select:none event after the collection\'s selected models have been updated', function () {
                expect( selectNoneEventState.collection.selected ).toEqual( {} );
            } );

            it( 'should trigger the collection\'s select:none event after the collection\'s selected length has been updated', function () {
                expect( selectNoneEventState.collection.selectedLength ).toBe( 0 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the collection's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m2 );
            } );

            it( "should trigger a select:all event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m2], deselected: [] }, collection, { label: "selected" } );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the collection's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m2, {silent: true} );
            } );

            it( "should not trigger a select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should have a selected count of 2", function () {
                expect( collection.selectedLength ).toBe( 2 );
            } );

            it( "should have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBe( m1 );
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when all models are selected and deselecting one via the collection's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m1 );
            } );

            it( "should trigger a select:some event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [m1] }, collection, { label: "selected" } );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should not have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when all models are selected and deselecting one via the collection's deselect, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m1, {silent: true} );
            } );

            it( "should not trigger a select:some event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
            } );

            it( "should have a selected count of 1", function () {
                expect( collection.selectedLength ).toBe( 1 );
            } );

            it( "should not have the first selected model in the selected list", function () {
                expect( collection.selected[m1.cid] ).toBeUndefined();
            } );

            it( "should have the second selected model in the selected list", function () {
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and it is being deselected via the collection's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m1 );
            } );

            it( "should trigger a select:none event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [m1] }, collection, { label: "selected" } );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have any models in the selected list", function () {
                var size = _.size( collection.selected );
                expect( size ).toBe( 0 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and it is being deselected via the collection's deselect, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m1, {silent: true} );
            } );

            it( "should not trigger a select:none event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            } );

            it( "should have a selected count of 0", function () {
                expect( collection.selectedLength ).toBe( 0 );
            } );

            it( "should not have any models in the selected list", function () {
                var size = _.size( collection.selected );
                expect( size ).toBe( 0 );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and it is being re-selected via the collection's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1 );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should trigger a reselect:any event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { label: "selected" } );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and it is being re-selected via the collection's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1, {silent: true} );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when all models are selected, and re-selecting a model via the collection's select", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1 );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should trigger a reselect:any event", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { label: "selected" } );
            } );
        } );

        describe( "when all models are selected, and re-selecting a model via the collection's select, with options.silent enabled", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1, {silent: true} );
            } );

            it( "should not trigger a select:some or select:all event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is selected, and deselecting the one which hadn't been selected, via the collection's deselect", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );

                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m2 );
            } );

            it( "should not trigger a select:some or select:none event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:some" );
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
            } );

            it( "should not trigger a reselect:any event", function () {
                expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:any" );
            } );
        } );

    } );

    describe( 'custom options', function () {

        describe( "when 1 out of 2 models in a collection is being selected via the model's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "selected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:some event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [m1], deselected: [] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when 1 out of 2 models in a collection is being selected via the collection's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1, {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "selected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:some event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [m1], deselected: [] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a model is being re-selected via the model's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                m1.select( {foo: "bar"} );
            } );

            it( "should trigger a reselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "reselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a model is being re-selected via the collection's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m1, {foo: "bar"} );
            } );

            it( "should trigger a reselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "reselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when all models are selected and deselecting one via the model's deselect, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                m1.deselect( {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:some event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [m1] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when all models are selected and deselecting one via the collection's deselect, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.select( m1 );
                collection.select( m2 );

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( m1, {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:some event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [m1] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

    } );

    describe( '_silentLocally option', function () {
        var model, collection, otherCollection, events;

        beforeEach( function () {
            var SelectOneCollection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
                }
            } );

            model = new Model();
            collection = new Collection( [model], { enableModelSharing: true } );
            otherCollection = new SelectOneCollection( [model] );
        } );

        describe( 'When a model is selected with the _silentLocally option', function () {

            beforeEach( function () {
                events = getEventSpies( [model, collection, otherCollection] );
                collection.select( model, { _silentLocally: true } );
            } );

            it( 'should not trigger any select:* event on the collection', function () {
                expect( events.get( collection, "select:none" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:some" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a "selected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "selected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a "selected" event on the model', function () {
                expect( events.get( model, "selected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a select:one event in a Select.One collection sharing the model', function () {
                expect( events.get( otherCollection, "select:one" ) ).toHaveBeenCalledOnce();
            } );

        } );

        describe( 'When a model is deselected with the _silentLocally option', function () {

            beforeEach( function () {
                model.select();
                events = getEventSpies( [model, collection, otherCollection] );
                collection.deselect( model, { _silentLocally: true } );
            } );

            it( 'should not trigger any select:* event on the collection', function () {
                expect( events.get( collection, "select:none" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:some" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a "deselected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "deselected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a "deselected" event on the model', function () {
                expect( events.get( model, "deselected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a deselect:one event in a Select.One collection sharing the model', function () {
                expect( events.get( otherCollection, "deselect:one" ) ).toHaveBeenCalledOnce();
            } );

        } );

        describe( 'When a model is reselected with the _silentLocally option', function () {

            beforeEach( function () {
                model.select();
                events = getEventSpies( [model, collection, otherCollection] );
                collection.select( model, { _silentLocally: true } );
            } );

            it( 'should not trigger a reselect:any event or any select:* event on the collection', function () {
                expect( events.get( collection, "select:none" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:some" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a "reselected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "reselected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a "reselected" event on the model', function () {
                expect( events.get( model, "reselected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a reselect:one event in a Select.One collection sharing the model', function () {
                expect( events.get( otherCollection, "reselect:one" ) ).toHaveBeenCalledOnce();
            } );

        } );

    } );

} );
