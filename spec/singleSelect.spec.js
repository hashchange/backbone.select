describe( "single-select collection", function () {

    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var Collection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.One.applyTo( this, models );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'A Select.One collection instance should identify itself', function () {
        var collection;

        beforeEach( function () {
            collection = new Collection();
        } );

        it( "as an instance of Backbone.Collection", function () {
            expect( collection instanceof Backbone.Collection ).toBe( true );
        } );

        it( "as 'Backbone.Select.One' with the _pickyType property", function () {
            expect( collection._pickyType ).toBe( "Backbone.Select.One" );
        } );
    } );

    describe( "when selecting a model via the model's select", function () {
        var model, collection, selectedEventState, selectOneEventState;

        beforeEach( function () {
            selectedEventState = { model: {}, collection: {} };
            selectOneEventState = { model: {}, collection: {} };

            model = new Model();
            collection = new Collection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            model.on( 'selected', function ( model ) {
                selectedEventState.model.selected = model && model.selected;
                selectedEventState.collection.selected = collection.selected;
            } );

            collection.on( 'select:one', function ( model ) {
                selectOneEventState.model.selected = model && model.selected;
                selectOneEventState.collection.selected = collection.selected;
            } );

            model.select();
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( model );
        } );

        it( "should trigger a selected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should trigger a collection select:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:one", model, collection, { label: "selected" } );
        } );

        it( 'should trigger the model\'s selected event after the model status has been updated', function () {
            expect( selectedEventState.model.selected ).toEqual( true );
        } );

        it( 'should trigger the model\'s selected event after the collection status has been updated', function () {
            expect( selectedEventState.collection.selected ).toBe( model );
        } );

        it( 'should trigger the collection\'s select:one event after the model status has been updated', function () {
            expect( selectOneEventState.model.selected ).toEqual( true );
        } );

        it( 'should trigger the collection\'s select:one event after the collection status has been updated', function () {
            expect( selectOneEventState.collection.selected ).toBe( model );
        } );

        it( "should not trigger a collection reselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );
    } );

    describe( "when selecting a model via the model's select, with options.silent enabled", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            model.select( {silent: true} );
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( model );
        } );

        it( "should not trigger a selected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( "should not trigger a collection select:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );
    } );

    describe( "when selecting a model via the collection's select", function () {
        var model, collection, selectedEventState, selectOneEventState;

        beforeEach( function () {
            selectedEventState = { model: {}, collection: {} };
            selectOneEventState = { model: {}, collection: {} };

            model = new Model();
            collection = new Collection( [model] );

            spyOn( collection, "trigger" ).and.callThrough();
            spyOn( model, "trigger" ).and.callThrough();
            spyOn( model, "select" ).and.callThrough();

            model.on( 'selected', function ( model ) {
                selectedEventState.model.selected = model && model.selected;
                selectedEventState.collection.selected = collection.selected;
            } );

            collection.on( 'select:one', function ( model ) {
                selectOneEventState.model.selected = model && model.selected;
                selectOneEventState.collection.selected = collection.selected;
            } );

            collection.select( model );
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( model );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should trigger a select:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:one", model, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should tell the model to select itself", function () {
            expect( model.select ).toHaveBeenCalled();
        } );

        it( 'should trigger the model\'s selected event after the model status has been updated', function () {
            expect( selectedEventState.model.selected ).toEqual( true );
        } );

        it( 'should trigger the model\'s selected event after the collection status has been updated', function () {
            expect( selectedEventState.collection.selected ).toBe( model );
        } );

        it( 'should trigger the collection\'s select:one event after the model status has been updated', function () {
            expect( selectOneEventState.model.selected ).toEqual( true );
        } );

        it( 'should trigger the collection\'s select:one event after the collection status has been updated', function () {
            expect( selectOneEventState.collection.selected ).toBe( model );
        } );
    } );

    describe( "when selecting a model via the collection's select, with options.silent enabled", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );

            spyOn( collection, "trigger" ).and.callThrough();
            spyOn( model, "select" ).and.callThrough();

            collection.select( model, {silent: true} );
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( model );
        } );

        it( "should not trigger a select:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( "should tell the model to select itself", function () {
            expect( model.select ).toHaveBeenCalled();
        } );
    } );

    describe( "when selecting a model that is already selected", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );

            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.select( model );
        } );

        it( "should not trigger a select:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( "should trigger a reselected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { label: "selected" } );
        } );

        it( "should trigger a reselect:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "reselect:one", model, collection, { label: "selected" } );
        } );
    } );

    describe( "when selecting a model that is already selected, with options.silent enabled", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );

            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.select( model, {silent: true} );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );

        it( "should not trigger a reselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );
    } );

    describe( "when a model is already selected and selecting a different model", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            collection = new Collection( [m1, m2] );
            m1.select();

            spyOn( collection, "trigger" ).and.callThrough();
            spyOn( m1, "deselect" ).and.callThrough();

            m2.select();
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( m2 );
        } );

        it( "should trigger a select:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:one", m2, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "reselect:one" );
        } );

        it( "should deselect the first model", function () {
            expect( m1.deselect ).toHaveBeenCalled();
        } );

        it( "should fire a deselect:one event for the first model", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", m1, collection, { label: "selected" } );
        } );
    } );

    describe( "when a model is already selected and selecting a different model, with options.silent enabled", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            collection = new Collection( [m1, m2] );
            m1.select();

            spyOn( collection, "trigger" ).and.callThrough();
            spyOn( m1, "deselect" ).and.callThrough();

            m2.select( {silent: true} );
        } );

        it( "should hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( m2 );
        } );

        it( "should not trigger a select:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:one" );
        } );

        it( "should deselect the first model", function () {
            expect( m1.deselect ).toHaveBeenCalled();
        } );

        it( "should not fire a deselect:one event for the first model", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );
    } );

    describe( "when no model is selected and deselecting", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.deselect();
        } );

        it( "should not trigger a selected, reselected or deselected event on the model", function () {
            expect( model.trigger ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a select:one, reselect:one or deselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalled();
        } );
    } );

    describe( "when a model is selected and deselecting the model through the model's deselect", function () {
        var model, collection, deselectedEventState, deselectOneEventState;

        beforeEach( function () {
            deselectedEventState = { model: {}, collection: {} };
            deselectOneEventState = { model: {}, collection: {} };

            model = new Model();
            collection = new Collection( [model] );
            model.select();

            spyOn( collection, "trigger" ).and.callThrough();

            model.on( 'deselected', function ( model ) {
                deselectedEventState.model.selected = model && model.selected;
                deselectedEventState.collection.selected = collection.selected;
            } );

            collection.on( 'deselect:one', function ( model ) {
                deselectOneEventState.model.selected = model && model.selected;
                deselectOneEventState.collection.selected = collection.selected;
            } );

            model.deselect();
        } );

        it( "should not hang on to the currently selected model", function () {
            expect( collection.selected ).toBeUndefined();
        } );

        it( "should trigger a deselect:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", model, collection, { label: "selected" } );
        } );

        it( 'should trigger the model\'s deselected event after the model status has been updated', function () {
            expect( deselectedEventState.model.selected ).toEqual( false );
        } );

        it( 'should trigger the model\'s deselected event after the collection status has been updated', function () {
            expect( deselectedEventState.collection.selected ).toBeUndefined();
        } );

        it( 'should trigger the collection\'s deselect:one event after the model status has been updated', function () {
            expect( deselectOneEventState.model.selected ).toEqual( false );
        } );

        it( 'should trigger the collection\'s deselect:one event after the collection status has been updated', function () {
            expect( deselectOneEventState.collection.selected ).toBeUndefined();
        } );
    } );

    describe( "when a model is selected and deselecting the model through the collection's deselect", function () {
        var model, collection, deselectedEventState, deselectOneEventState;

        beforeEach( function () {
            deselectedEventState = { model: {}, collection: {} };
            deselectOneEventState = { model: {}, collection: {} };

            model = new Model();
            collection = new Collection( [model] );
            model.select();

            spyOn( collection, "trigger" ).and.callThrough();

            model.on( 'deselected', function ( model ) {
                deselectedEventState.model.selected = model && model.selected;
                deselectedEventState.collection.selected = collection.selected;
            } );

            collection.on( 'deselect:one', function ( model ) {
                deselectOneEventState.model.selected = model && model.selected;
                deselectOneEventState.collection.selected = collection.selected;
            } );

            collection.deselect( model );
        } );

        it( "should not hang on to the currently selected model", function () {
            expect( collection.selected ).toBeUndefined();
        } );

        it( "should trigger a deselect:one event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", model, collection, { label: "selected" } );
        } );

        it( 'should trigger the model\'s deselected event after the model status has been updated', function () {
            expect( deselectedEventState.model.selected ).toEqual( false );
        } );

        it( 'should trigger the model\'s deselected event after the collection status has been updated', function () {
            expect( deselectedEventState.collection.selected ).toBeUndefined();
        } );

        it( 'should trigger the collection\'s deselect:one event after the model status has been updated', function () {
            expect( deselectOneEventState.model.selected ).toEqual( false );
        } );

        it( 'should trigger the collection\'s deselect:one event after the collection status has been updated', function () {
            expect( deselectOneEventState.collection.selected ).toBeUndefined();
        } );
    } );

    describe( "when a model is selected and deselecting the model, with options.silent enabled", function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.deselect( undefined, {silent: true} );
        } );

        it( "should not hang on to the currently selected model", function () {
            expect( collection.selected ).toBeUndefined();
        } );

        it( "should not trigger a deselected event on the model", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( "should not trigger a deselect:one event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );
    } );

    describe( "when one model is selected and deselecting another model through the collection's deselect", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            collection = new Collection( [m1, m2] );
            collection.select( m1 );

            spyOn( m1, "deselect" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.deselect( m2 );
        } );

        it( "should still hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( m1 );
        } );

        it( "should keep the selected model selected", function () {
            expect( m1.selected ).toBe( true );
        } );

        it( "should not deselect the selected model", function () {
            expect( m1.deselect ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a deselect:one event for the selected model", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( "should not trigger a deselect:one event for the non-selected model", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );
    } );

    describe( "when one model is selected and deselecting another model through the model's deselect", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            collection = new Collection( [m1, m2] );
            collection.select( m1 );

            spyOn( m1, "deselect" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            m2.deselect();
        } );

        it( "should still hang on to the currently selected model", function () {
            expect( collection.selected ).toBe( m1 );
        } );

        it( "should keep the selected model selected", function () {
            expect( m1.selected ).toBe( true );
        } );

        it( "should not deselect the selected model", function () {
            expect( m1.deselect ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a deselect:one event for the selected model", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "deselect:one" );
        } );

        it( "should not trigger a deselect:one event for the non-selected model", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWith( "deselect:one" );
        } );
    } );

    describe( 'custom options', function () {

        describe( "when selecting a model via the model's select, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                model.select( {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection select:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when selecting a model via the collection's select, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( model, {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection select:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when re-selecting a model via the model's select, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                model.select( {foo: "bar"} );
            } );

            it( "should trigger a reselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection reselect:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when re-selecting a model via the collection's select, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( model, {foo: "bar"} );
            } );

            it( "should trigger a reselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection reselect:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a model is already selected and selecting a different model via the model's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                m2.select( {foo: "bar"} );
            } );

            it( "should trigger a deselected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a selected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "selected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:one", m2, collection, { foo: "bar", label: "selected" } );
            } );

            it( "should fire a deselect:one event for the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", m1, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when a model is already selected and selecting a different model via the collection's select, with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.select( m2, {foo: "bar"} );
            } );

            it( "should trigger a deselected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a selected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "selected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:one", m2, collection, { foo: "bar", label: "selected" } );
            } );

            it( "should fire a deselect:one event for the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", m1, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when deselecting a model via the model's deselect, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                model.deselect( {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection deselect:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when deselecting a model via the collection's select, with a custom option", function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.deselect( model, {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a collection deselect:one event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "deselect:one", model, collection, { foo: "bar", label: "selected" } );
            } );
        } );

    } );

    describe( 'automatic invocation of onSelect, onDeselect, onReselect handlers', function () {
        var EventHandlingCollection, model, collection;

        beforeEach( function () {

            EventHandlingCollection = Collection.extend( {
                onSelect: function () {},
                onDeselect: function () {},
                onReselect: function () {},

                // Pseudo event handlers modeled on internal events `_selected`,
                // `_deselected`; should not be invoked automatically
                on_select: function () {},
                on_deselect: function () {},

                // Pseudo event handlers modeled on standard Backbone events `add`,
                // `remove`, `reset`, `all` (as stand-ins for all others) ; should
                // not be invoked automatically
                onAdd: function () {},
                onRemove: function () {},
                onReset: function () {},
                onAll: function () {}
            } );

            model = new Model();
            collection = new EventHandlingCollection( [model] );

            spyOn( collection, "onSelect" ).and.callThrough();
            spyOn( collection, "onDeselect" ).and.callThrough();
            spyOn( collection, "onReselect" ).and.callThrough();

            spyOn( collection, "on_select" ).and.callThrough();
            spyOn( collection, "on_deselect" ).and.callThrough();

            spyOn( collection, "onAdd" ).and.callThrough();
            spyOn( collection, "onRemove" ).and.callThrough();
            spyOn( collection, "onReset" ).and.callThrough();
            spyOn( collection, "onAll" ).and.callThrough();
        } );

        it( 'calls the onSelect handler when triggering a select:one event', function () {
            collection.trigger( "select:one", model, collection, {foo: "bar"} );
            expect( collection.onSelect ).toHaveBeenCalledWith( model, collection, {foo: "bar"} );
        } );

        it( 'calls the onDeselect handler when triggering a deselect:one event', function () {
            collection.trigger( "deselect:one", model, collection, {foo: "bar"} );
            expect( collection.onDeselect ).toHaveBeenCalledWith( model, collection, {foo: "bar"} );
        } );

        it( 'calls the onReselect handler when triggering a reselect:one event', function () {
            collection.trigger( "reselect:one", model, collection, {foo: "bar"} );
            expect( collection.onReselect ).toHaveBeenCalledWith( model, collection, {foo: "bar"} );
        } );

        it( 'does not call an event handler accidentally named after the internal _selected event', function () {
            model.trigger( "_selected", model );
            expect( collection.on_select ).not.toHaveBeenCalled();
        } );

        it( 'does not call an event handler accidentally named after the internal _deselected event', function () {
            model.trigger( "_deselected", model );
            expect( collection.on_deselect ).not.toHaveBeenCalled();
        } );

        it( 'does not automatically call an event handler named after a standard Backbone event (e.g. onAdd)', function () {
            collection.trigger( "add", model );
            collection.trigger( "remove", model );
            collection.trigger( "reset" );
            collection.trigger( "all", model );
            expect( collection.onAdd ).not.toHaveBeenCalled();
            expect( collection.onRemove ).not.toHaveBeenCalled();
            expect( collection.onReset ).not.toHaveBeenCalled();
            expect( collection.onAll ).not.toHaveBeenCalled();
        } );
    } );

    describe( 'Model-sharing status flag', function () {

        describe( 'when model sharing is disabled', function () {
            var collection;

            it( 'with no models being passed in during construction, the _modelSharingEnabled property is not set to true', function () {
                // Ie, the property must not exist, or be false.
                collection = new Collection();
                expect( collection._modelSharingEnabled ).not.toBe( true );
            } );

            it( 'with models being passed in during construction, the _modelSharingEnabled property is not set to true', function () {
                // Ie, the property must not exist, or be false.
                collection = new Collection( [new Model()] );
                expect( collection._modelSharingEnabled ).not.toBe( true );
            } );
        } );

        describe( 'when model sharing is enabled', function () {
            var SharingCollection, collection;

            beforeEach( function () {
                SharingCollection = Backbone.Collection.extend( {
                    initialize: function ( models ) {
                        Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
                    }
                } );
            } );

            it( 'with no models being passed in during construction, the _modelSharingEnabled property is true', function () {
                collection = new SharingCollection();
                expect( collection._modelSharingEnabled ).toBe( true );
            } );

            it( 'with models being passed in during construction, the _modelSharingEnabled property is true', function () {
                collection = new SharingCollection( [new Model()] );
                expect( collection._modelSharingEnabled ).toBe( true );
            } );
        } );

    } );

    describe( 'Compatibility with Backbone.Collection.select', function () {

        describe( "The collection's select is called without a model as first argument", function () {

            describe( 'when Backbone.Collection.select has not been modified or overridden on the base type', function () {

                var model0, model1, model2, models, filter, filterWithContext, collection;

                beforeEach( function () {
                    filter = function ( model ) {
                        // Arbitrary filter function, here returning the models with an even ID.
                        return model.id % 2 === 0;
                    };

                    filterWithContext = function ( model ) {
                        // Arbitrary filter function, relying on a this argument representing the collection. Returns
                        // models at an even index in the collection, given the default sort order.
                        return this.indexOf( model ) % 2 === 0;
                    };


                    model0 = new Model( {id: 0} );
                    model1 = new Model( {id: 1} );
                    model2 = new Model( {id: 2} );

                    models = [ model0, model1, model2 ];

                    collection = new Collection( models );
                } );

                it( 'returns the same array of models as Backbone.Collection.filter', function () {
                    var result = collection.select( filter );
                    expect( result ).toEqual( [ model0, model2 ] );
                    expect( result ).toEqual( collection.filter( filter ) );
                } );

                it( 'honours the context argument of the Backbone filter/select method if it is provided', function () {
                    var result = collection.select( filterWithContext, collection );
                    expect( result ).toEqual( [ model0, model2 ] );
                    expect( result ).toEqual( collection.filter( filterWithContext, collection ) );
                } );
            } );

            describe( 'when Backbone.Collection.select has been overridden in the prototype chain', function () {

                var model, CollectionWithCustomSelectFoo, CollectionWithCustomSelectBar;

                beforeEach( function () {

                    CollectionWithCustomSelectFoo = Backbone.Collection.extend( {
                        initialize: function ( models ) {
                            Backbone.Select.One.applyTo( this, models );
                        },
                        select: function ( arg1, arg2 ) {
                            return "foo:" + arg1 + ":" + arg2;
                        }
                    } );

                    CollectionWithCustomSelectBar = CollectionWithCustomSelectFoo.extend( {
                        select: function ( arg1, arg2 ) {
                            return "bar:" + arg1 + ":" + arg2;
                        }
                    } );

                    model = new Model();
                } );

                it( 'returns the result of the modified select method', function () {
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionFoo.select( "arg1", "arg2" ) ).toEqual( "foo:arg1:arg2" );
                } );

                // Now checking that the modified select methods are kept around independently, without e.g. the last
                // modification overwriting the others.

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated after the original one', function () {
                    //noinspection JSUnusedLocalSymbols
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    var collectionBar = new CollectionWithCustomSelectBar( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated before the original one', function () {
                    var collectionBar = new CollectionWithCustomSelectBar( [model] );
                    //noinspection JSUnusedLocalSymbols
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );
            } );

        } );

    } );
    
    describe( 'Checking for memory leaks', function () {

        describe( 'when a collection is replaced by another one and is not referenced by a variable any more, with model sharing disabled', function () {
            var logger, LoggedCollection, m1, m2, collection;

            beforeEach( function () {
                logger = new Logger();

                LoggedCollection = Collection.extend( {
                    initialize: function ( models ) {
                        this.on( "select:one", function ( model ) {
                            logger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                        } );
                        this.on( "deselect:one", function ( model ) {
                            logger.log( "deselect:one event: Model " + model.cid + " deselected in collection " + this._pickyCid );
                        } );

                        Collection.prototype.initialize.call( this, models );
                    }
                } );

                m1 = new Model();
                m2 = new Model();
            } );

            it( 'should no longer respond to model events', function () {
                // With only variable holding a collection, only one 'select:*' event
                // should be logged.

                //noinspection JSUnusedAssignment
                collection = new LoggedCollection( [m1, m2] );
                collection = new LoggedCollection( [m1, m2] );

                m2.select();
                expect( logger.entries.length ).toBe( 1 );
            } );
        } );

        describe( 'when a collection is replaced by another one and is not referenced by a variable any more, with model sharing enabled', function () {
            var logger, Collection, LoggedCollection, m1, m2, collection;

            beforeEach( function () {
                logger = new Logger();
                Collection = Backbone.Collection.extend( {
                    model: Model,

                    initialize: function ( models ) {
                        Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
                    }
                } );

                LoggedCollection = Collection.extend( {
                    initialize: function ( models ) {
                        this.on( "select:one", function ( model ) {
                            logger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                        } );
                        this.on( "deselect:one", function ( model ) {
                            logger.log( "deselect:one event: Model " + model.cid + " deselected in collection " + this._pickyCid );
                        } );

                        Collection.prototype.initialize.call( this, models );
                    }
                } );

                m1 = new Model();
                m2 = new Model();
            } );

            it( 'should no longer respond to model events after calling close on it', function () {
                // With only variable holding a collection, only one 'select:*' event
                // should be logged.
                collection = new LoggedCollection( [m1, m2] );
                collection.close();
                collection = new LoggedCollection( [m1, m2] );

                m2.select();
                expect( logger.entries.length ).toBe( 1 );
            } );
        } );

    } );

    describe( 'Mixin is protected from modification', function () {
        var m1, m2, c1, c2;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            c1 = new Collection( [ m1 ] );
            c2 = new Collection( [ m2 ] );
        } );

        it( 'when overwriting the select() method on one collection, the select method of another collection stays intact', function () {
            c1.select = function () {};
            c2.select( m2 );
            expect( c2.selected ).toBe( m2 );
        } );
    } );

} );
