describe( 'Automatic creation of Select.Me models', function () {

    var /** @type {AutoCreationFixture} */ f,

        SelectMeModel = Backbone.Model.extend( {
            tellType: "SelectMeModel",
            initialize: function ( attributes, options ) {
                Backbone.Select.Me.applyTo( this, options );
            }
        } ),

        SelectOneCollection = Backbone.Collection.extend( {
            initialize: function ( models, options ) {
                Backbone.Select.One.applyTo( this, models, options );
            }
        } ),

        SelectManyCollection = Backbone.Collection.extend( {
            initialize: function ( models, options ) {
                Backbone.Select.Many.applyTo( this, models, options );
            }
        } ),


        collectionTypeScenarios = {
            "Select.One collection": function ( fixture ) { fixture.setBaseCollectionType( SelectOneCollection ); },
            "Select.Many collection": function ( fixture ) { fixture.Collection = SelectManyCollection; }
        },

        eventedPopulationScenarios = {
            "Populating the collection during instantiation": pickTests( { optOut: "singularItemTests", optIn: "defaultLabelTest" }, function ( fixture ) {
                fixture.creationMethod = "new";
            } ),
            "Populating the collection with add": pickTests( "default", function ( fixture ) {
                fixture.creationMethod = "add";
            } ),
            "Populating the collection with reset": pickTests( { optOut: "singularItemTests" }, function ( fixture ) {
                fixture.creationMethod = "reset";
            } ),
            "Populating the collection with set": pickTests( "default", function ( fixture ) {
                fixture.creationMethod = "set";
            } )
        },

        silentPopulationScenarios = {
            "Populating the collection with add, with options.silent enabled": pickTests( "default", function ( fixture ) {
                fixture.creationMethod = "add";
                fixture.options.silent = true;
            } ),
            "Populating the collection with reset, with options.silent enabled": pickTests( { optOut: "singularItemTests" }, function ( fixture ) {
                fixture.creationMethod = "reset";
                fixture.options.silent = true;
            } ),
            "Populating the collection with set, with options.silent enabled": pickTests( "default", function ( fixture ) {
                fixture.creationMethod = "set";
                fixture.options.silent = true;
            } )
        },

        populationScenarios = _.extend( {}, eventedPopulationScenarios, silentPopulationScenarios ),

        parseScenarios = {
            "models are created from an attributes hash": function ( fixture ) {
                fixture.modelDataSets = fixture.attributeSets;
            },
            "models are created from parsed input, with options.parse set": function ( fixture ) {
                fixture.options.parse = true;

                fixture.Collection = fixture.Collection.extend( {
                    parse: function ( inputModelData ) {
                        return _.isArray( inputModelData ) ? _.pluck( inputModelData, "nested" ) : inputModelData.nested;
                    }
                } );

                fixture.modelDataSets = _.map( fixture.attributeSets, function ( attributeSet ) {
                    return { nested: attributeSet };
                } );
            }
        },

        modelTemplateScenarios = {
            "collection.model is not set, models are created from Backbone.Model": function ( fixture ) {
                fixture.modelTemplate = Backbone.Model;
            },
            "collection.model is set to a custom type, which does not have the Select.Me mixin applied": function ( fixture ) {
                fixture.modelTemplate = Backbone.Model.extend( { tellType: "custom" } );
                fixture.Collection = fixture.Collection.extend( { model: fixture.modelTemplate } );
            },
            "collection.model is set to a custom type, which has the Select.Me mixin applied": function ( fixture ) {
                fixture.modelTemplate = SelectMeModel;
                fixture.Collection = fixture.Collection.extend( { model: SelectMeModel } );
            }
        };


    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'Creating models on the fly, from raw data', function () {

        beforeEach( function () {

            f = new AutoCreationFixture( [
                { number: 1 },
                { number: 2 },
                { number: 3 }
            ] );

        } );

        describeWithData( collectionTypeScenarios, function ( configureCollectionType ) {

            beforeEach( function () {
                configureCollectionType( f );
            } );

            describeWithData( populationScenarios, function ( configurePopulation ) {

                beforeEach( function () {
                    configurePopulation( f );
                } );

                describeWithData( parseScenarios, function ( configureParsing ) {

                    beforeEach( function () {
                        configureParsing( f );
                    } );

                    describeWithData( modelTemplateScenarios, function ( configureModelTemplate ) {

                        beforeEach( function () {
                            configureModelTemplate( f );
                        } );

                        if( !hasOptedOut( configurePopulation, "singularItemTests" ) ) {

                            describe( 'data for single item, not wrapped in an array, is passed in', function () {

                                var modelDataSet, collection, model;

                                beforeEach( function () {
                                    modelDataSet = f.modelDataSets[0];
                                    collection = f.createPopulatedCollection( modelDataSet );
                                    model = collection.at( 0 );
                                } );

                                afterEach( function () {
                                    collection.close();
                                } );

                                it( 'the collection has the expected number of models', function () {
                                    expect( collection.length ).toEqual( 1 );
                                } );

                                it( 'the model is of the expected type', function () {
                                    expect( model ).toEqual( jasmine.any( f.modelTemplate ) );
                                } );

                                it( 'the model has the expected attributes', function () {
                                    expect( model.attributes ).toEqual( f.attributeSets[0] );
                                    expect( model.get( "number" ) ).toEqual( 1 );
                                } );

                                it( 'the model has the Select.Me mixin applied', function () {
                                    expect( model._pickyType ).toEqual( "Backbone.Select.Me" );
                                } );

                                if ( hasOptedIn( configurePopulation, "defaultLabelTest" ) ) {

                                    it( 'the model shares the defaultLabel setting of the collection', function () {
                                        // Only happens when creating the collection. Then, collection and models are
                                        // created in a single process, and the options passed to the collection are
                                        // used for both.
                                        collection.close();
                                        collection = f.createPopulatedCollection( modelDataSet, { defaultLabel: "foo" } );
                                        expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                                    } );

                                }

                            } );

                        }

                        describe( 'an array of item data is passed in', function () {

                            var collection, models;

                            beforeEach( function () {
                                collection = f.createPopulatedCollection( f.modelDataSets );
                                models = collection.models;
                            } );

                            afterEach( function () {
                                collection.close();
                            } );

                            it( 'the collection has the expected number of models', function () {
                                expect( collection.length ).toEqual( 3 );
                            } );

                            it( 'the models are of the expected type', function () {
                                expect( models[0] ).toEqual( jasmine.any( f.modelTemplate ) );
                                expect( models[1] ).toEqual( jasmine.any( f.modelTemplate ) );
                                expect( models[2] ).toEqual( jasmine.any( f.modelTemplate ) );
                            } );

                            it( 'the models have the expected attributes', function () {
                                expect( models[0].attributes ).toEqual( f.attributeSets[0] );
                                expect( models[1].attributes ).toEqual( f.attributeSets[1] );
                                expect( models[2].attributes ).toEqual( f.attributeSets[2] );
                                expect( models[0].get( "number" ) ).toEqual( 1 );
                                expect( models[1].get( "number" ) ).toEqual( 2 );
                                expect( models[2].get( "number" ) ).toEqual( 3 );

                            } );

                            it( 'the models have the Select.Me mixin applied', function () {
                                expect( models[0]._pickyType ).toEqual( "Backbone.Select.Me" );
                                expect( models[1]._pickyType ).toEqual( "Backbone.Select.Me" );
                                expect( models[2]._pickyType ).toEqual( "Backbone.Select.Me" );
                            } );

                            if ( hasOptedIn( configurePopulation, "defaultLabelTest" ) ) {

                                it( 'the models share the defaultLabel setting of the collection', function () {
                                    // Only happens when creating the collection. Then, collection and models are
                                    // created in a single process, and the options passed to the collection are
                                    // used for both.
                                    collection.close();
                                    collection = f.createPopulatedCollection( f.modelDataSets, { defaultLabel: "foo" } );
                                    expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                                    expect( collection.at( 1 )._pickyDefaultLabel ).toEqual( "foo" );
                                    expect( collection.at( 2 )._pickyDefaultLabel ).toEqual( "foo" );
                                } );

                            }

                        } );

                    } );

                } );

            } );

        } );

    } );

    describe( 'Auto-Applying the Select.Me mixin on the fly, to Backbone models', function () {

        beforeEach( function () {

            f = new AutoCreationFixture( [
                { number: 1 },
                { number: 2 },
                { number: 3 }
            ] );

        } );

        describeWithData( collectionTypeScenarios, function ( configureCollectionType ) {

            beforeEach( function () {
                configureCollectionType( f );
            } );

            describeWithData( populationScenarios, function ( configurePopulation ) {

                beforeEach( function () {
                    configurePopulation( f );
                } );

                if( !hasOptedOut( configurePopulation, "singularItemTests" ) ) {

                    describe( 'data for single item, not wrapped in an array, is passed in', function () {

                        var collection, model;

                        beforeEach( function () {
                            var inputModel = f.createPlainModels()[0];
                            collection = f.createPopulatedCollection( inputModel );
                            model = collection.at( 0 );
                        } );

                        afterEach( function () {
                            collection.close();
                        } );

                        it( 'the collection has the expected number of models', function () {
                            expect( collection.length ).toEqual( 1 );
                        } );

                        it( 'the model is of the expected type', function () {
                            expect( model ).toEqual( jasmine.any( Backbone.Model ) );
                        } );

                        it( 'the model has the expected attributes', function () {
                            expect( model.attributes ).toEqual( f.attributeSets[0] );
                            expect( model.get( "number" ) ).toEqual( 1 );
                        } );

                        it( 'the model has the Select.Me mixin applied', function () {
                            expect( model._pickyType ).toEqual( "Backbone.Select.Me" );
                        } );

                        it( 'the model is selectable immediately after the collection mixin has been applied', function () {
                            var firstSelectedItemInCollection,
                                originalInitialize = collection.initialize,
                                inputModel = f.createPlainModels()[0];

                            f.Collection = f.Collection.extend( {
                                initialize: function ( models, options ) {
                                    originalInitialize.apply( this, arguments );

                                    // When testing with models which are passed in during instantiation
                                    if ( models ) models[0].select();

                                    // When testing with models which are passed in during add, set or reset
                                    this.listenTo( this, "add", function () { this.at(0).select() } );
                                    this.listenTo( this, "set", function () { this.at(0).select() } );
                                    this.listenTo( this, "reset", function () { this.at(0).select() } );
                                }
                            } );

                            collection.close();
                            collection = f.createPopulatedCollection( inputModel );

                            if ( f.options.silent ) {
                                // With options silent, we haven't been able to trigger an automatic selection after
                                // "add"/"set"/"reset". We do it manually here, so see if things work, even though it is
                                // stretching the concept of "immediately after the mixin is applied".
                                collection.at( 0 ).select();
                            }

                            firstSelectedItemInCollection = collection._pickyType === "Backbone.Select.One" ? collection.selected : _.values( collection.selected )[0];

                            expect( inputModel.selected ).toBe( true );
                            expect( firstSelectedItemInCollection ).toBe( inputModel );
                        } );

                        if ( hasOptedIn( configurePopulation, "defaultLabelTest" ) ) {

                            it( 'the model shares the defaultLabel setting of the collection', function () {
                                // Only happens when creating the collection. Then, collection and models are
                                // created in a single process, and the options passed to the collection are
                                // used for both.
                                var inputModel = f.createPlainModels()[0];
                                collection.close();
                                collection = f.createPopulatedCollection( inputModel, { defaultLabel: "foo" } );

                                expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                            } );

                        }

                        it( 'options are passed on to the the Select.Me mixin as it is applied', function () {
                            // Testing with the defaultLabel option, the only option recognized by Select.Me.applyTo().
                            var inputModel = f.createPlainModels()[0];

                            _.extend( f.options, { defaultLabel: "foo" } );
                            collection.close();
                            collection = f.createPopulatedCollection( inputModel );

                            expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                        } );

                    } );

                }

                describe( 'an array of item data is passed in', function () {

                    var collection, models;

                    beforeEach( function () {
                        collection = f.createPopulatedCollection( f.createPlainModels() );
                        models = collection.models;
                    } );

                    afterEach( function () {
                        collection.close();
                    } );

                    it( 'the collection has the expected number of models', function () {
                        expect( collection.length ).toEqual( 3 );
                    } );

                    it( 'the models are of the expected type', function () {
                        expect( models[0] ).toEqual( jasmine.any( Backbone.Model ) );
                        expect( models[1] ).toEqual( jasmine.any( Backbone.Model ) );
                        expect( models[2] ).toEqual( jasmine.any( Backbone.Model ) );
                    } );

                    it( 'the models have the expected attributes', function () {
                        expect( models[0].attributes ).toEqual( f.attributeSets[0] );
                        expect( models[1].attributes ).toEqual( f.attributeSets[1] );
                        expect( models[2].attributes ).toEqual( f.attributeSets[2] );
                        expect( models[0].get( "number" ) ).toEqual( 1 );
                        expect( models[1].get( "number" ) ).toEqual( 2 );
                        expect( models[2].get( "number" ) ).toEqual( 3 );

                    } );

                    it( 'the models are selectable immediately after the collection mixin has been applied', function () {
                        var firstSelectedItemInCollection,
                            originalInitialize = collection.initialize,
                            inputModels = f.createPlainModels();

                        f.Collection = f.Collection.extend( {
                            initialize: function ( models, options ) {
                                originalInitialize.apply( this, arguments );

                                // When testing with models which are passed in during instantiation
                                if ( models ) models[0].select();

                                // When testing with models which are passed in during add, set or reset
                                this.listenTo( this, "add", function () { this.at(0).select() } );
                                this.listenTo( this, "set", function () { this.at(0).select() } );
                                this.listenTo( this, "reset", function () { this.at(0).select() } );
                            }
                        } );

                        collection.close();
                        collection = f.createPopulatedCollection( inputModels );

                        if ( f.options.silent ) {
                            // With options silent, we haven't been able to trigger an automatic selection after
                            // "add"/"set"/"reset". We do it manually here, so see if things work, even though it is
                            // stretching the concept of "immediately after the mixin is applied".
                            collection.at( 0 ).select();
                        }

                        firstSelectedItemInCollection = collection._pickyType === "Backbone.Select.One" ? collection.selected : _.values( collection.selected )[0];

                        expect( inputModels[0].selected ).toBe( true );
                        expect( firstSelectedItemInCollection ).toBe( inputModels[0] );
                    } );

                    it( 'the models have the Select.Me mixin applied', function () {
                        expect( models[0]._pickyType ).toEqual( "Backbone.Select.Me" );
                        expect( models[1]._pickyType ).toEqual( "Backbone.Select.Me" );
                        expect( models[2]._pickyType ).toEqual( "Backbone.Select.Me" );
                    } );

                    if ( hasOptedIn( configurePopulation, "defaultLabelTest" ) ) {

                        it( 'the models share the defaultLabel setting of the collection', function () {
                            // Only happens when creating the collection. Then, collection and models are
                            // created in a single process, and the options passed to the collection are
                            // used for both.
                            collection.close();
                            collection = f.createPopulatedCollection( f.createPlainModels(), { defaultLabel: "foo" } );
                            expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                            expect( collection.at( 1 )._pickyDefaultLabel ).toEqual( "foo" );
                            expect( collection.at( 2 )._pickyDefaultLabel ).toEqual( "foo" );
                        } );

                    }

                    it( 'options are passed on to the the Select.Me mixin as it is applied', function () {
                        // Testing with the defaultLabel option, the only option recognized by Select.Me.applyTo().
                        _.extend( f.options, { defaultLabel: "foo" } );

                        collection.close();
                        collection = f.createPopulatedCollection( f.createPlainModels() );

                        expect( collection.at( 0 )._pickyDefaultLabel ).toEqual( "foo" );
                        expect( collection.at( 1 )._pickyDefaultLabel ).toEqual( "foo" );
                        expect( collection.at( 2 )._pickyDefaultLabel ).toEqual( "foo" );
                    } );

                } );

            } );

        } );

    } );

    describe( 'Creating models on the fly, special case: one item is undefined, in an array of otherwise valid data', function () {

        beforeEach( function () {

            f = new AutoCreationFixture( [
                { number: 1 },
                undefined,
                { number: 3 }
            ] );

        } );

        describeWithData( collectionTypeScenarios, function ( configureCollectionType ) {

            beforeEach( function () {
                configureCollectionType( f );
            } );

            describeWithData( eventedPopulationScenarios, function ( configurePopulation ) {

                beforeEach( function () {
                    configurePopulation( f );
                } );

                describeWithData( modelTemplateScenarios, function ( configureModelTemplate ) {

                    var collection, models;

                    beforeEach( function () {
                        configureModelTemplate( f );

                        collection = f.createPopulatedCollection( f.attributeSets );
                        models = collection.models;
                    } );

                    afterEach( function () {
                        collection.close();
                    } );

                    it( 'the collection has the expected number of models, including one for the undefined data', function () {
                        expect( collection.length ).toEqual( 3 );
                        expect( collection.models.length ).toEqual( 3 );
                    } );

                    it( 'the entry corresponding to the undefined input data has been turned into a model without attributes', function () {
                        expect( models[1] ).toEqual( jasmine.any( f.modelTemplate ) );
                        expect( models[1].attributes ).toEqual( {} );
                    } );

                    it( 'the other models are of the expected type', function () {
                        expect( models[0] ).toEqual( jasmine.any( f.modelTemplate ) );
                        expect( models[2] ).toEqual( jasmine.any( f.modelTemplate ) );
                    } );

                    it( 'the other models have the expected attributes', function () {
                        expect( models[0].attributes ).toEqual( f.attributeSets[0] );
                        expect( models[2].attributes ).toEqual( f.attributeSets[2] );
                        expect( models[0].get( "number" ) ).toEqual( 1 );
                        expect( models[2].get( "number" ) ).toEqual( 3 );

                    } );

                    it( 'all models, including the one created from undefined data, have the Select.Me mixin applied', function () {
                        expect( models[0]._pickyType ).toEqual( "Backbone.Select.Me" );
                        expect( models[1]._pickyType ).toEqual( "Backbone.Select.Me" );
                        expect( models[2]._pickyType ).toEqual( "Backbone.Select.Me" );
                    } );

                } );

            } );

        } );

    } );

} );