# Backbone.Select

<small>[Outline][outline] – [Example][intro-example] – [Setup][setup] – [Select.Me][Backbone.Select.Me] – [Select.One][Backbone.Select.One] – [Select.Many][Backbone.Select.Many] – [Guidelines][guidelines] – [Labels][custom-labels] – [Compatibility][select-compatibility]</small>

Backbone.Select is a set of mixins for Backbone models and collections. Models gain the ability to be selected, and collections handle those selections.

Collections either allow [only a single model][Backbone.Select.One] to be selected, or cater for [multiple selections][Backbone.Select.Many]. Events communicate selections and deselections to other parts of your application. If you wish, you can use different types of selections (e.g. "picked" and "rejected") in parallel, with [labels][custom-labels].

Models can be part of [more than one collection][interaction-guidelines]. Backbone.Select will keep selections of shared models in sync and guarantee consistency in even the most complex scenarios.

In a nutshell, Backbone.Select provides you with an almost deceptively simple, but surprisingly powerful mechanism to pick, group or segment items into different buckets. A number of stripped-down [demos][] might help to get you started, and serve as inspiration. 

For a superset of Backbone.Select with additional features, have a look at [Backbone.Cycle][].

#### Outline

- [Introductory example](#an-introductory-example)
    * [Demos](#demos)
- [Dependencies and setup](#dependencies-and-setup)
- [Basic model and collection interaction](#basic-model-and-collection-interaction)
- [Backbone.Select.Me: Making models selectable](#backboneselectme-making-models-selectable)
    * [Creating a Select.Me model](#creating-a-selectme-model)
    * [Applying the Select.Me model mixin automatically](#applying-the-selectme-model-mixin-automatically)
    * [Methods](#backboneselectme-methods): [`select`](#modelselect-options-), [`deselect`](#modeldeselect-options-), [`toggleSelected`](#modeltoggleselected-options-)
    * [Property](#backboneselectme-properties): [`selected`](#modelselected)
    * [Events](#backboneselectme-events): ["selected"](#selected), ["deselected"](#deselected), ["reselected"](#reselected)
- [Backbone.Select.One: a single-select collection](#backboneselectone-a-single-select-collection)
    * [Creating and closing a Select.One collection](#creating-and-closing-a-selectone-collection)
    * [Methods](#backboneselectone-methods): [`select`](#collectionselect-model-options-), [`deselect`](#collectiondeselect-model-options-)
    * [Property](#backboneselectone-properties): [`selected`](#collectionselected)
    * [Events](#backboneselectone-events): ["select:one"](#selectone), ["deselect:one"](#deselectone), ["reselect:one"](#reselectone)
- [Backbone.Select.Many: a multi-select collection](#backboneselectmany-a-multi-select-collection)
    * [Creating and closing a Select.Many collection](#creating-and-closing-a-selectmany-collection)
    * [Methods](#backboneselectmany-methods): [`select`](#collectionselect-model-options--1), [`deselect`](#collectiondeselect-model-options--1), [`selectAll`](#collectionselectall-options-), [`deselectAll`](#collectiondeselectall-options-), [`invertSelection`](#collectioninvertselection-options-), [`toggleSelectAll`](#collectiontoggleselectall-options-)
    * [Properties](#backboneselectmany-properties): [`selected`](#collectionselected-1), [`selectedLength`](#collectionselectedlength)
    * [Events](#backboneselectmany-events): ["select:all"](#selectall), ["select:none"](#selectnone), ["select:some"](#selectsome), ["reselect:any"](#reselectany)
- [Custom labels](#custom-labels)
    * [Using the `label` option](#using-the-label-option)
    * [`label` in events](#the-label-in-events)
    * [`defaultLabel`](#the-defaultlabel-setup-option), [`ignoreLabel`](#the-ignorelabel-setup-option)
- [Custom options](#custom-options)
- [Guidelines](#guidelines)
    * [Call `close()` when discarding a collection](#call-close-when-discarding-a-collection)
    * [Interaction of collections and models](#interaction-of-collections-and-models)
    * [Events](#events)
    * [Special considerations when calling `set()`](#special-considerations-when-calling-set)
- [Compatibility with Backbone's own select method](#compatibility-with-backbones-own-select-method)
- [Compatibility with Backbone.Picky](#compatibility-with-backbonepicky)
- [Extension API](#extension-api)
- [Build process and tests](#build-process-and-tests), [release notes](#release-notes), [credits, copyright, MIT license](#credits-copyright-mit-license)

## An introductory example

Perhaps the best way to explain what Backbone.Select does, before getting into the details, is an example.

```javascript
// --- (1) Setup ---

var Model = Backbone.Model.extend({
  initialize: function () {
    // Applies the mixin:
    Backbone.Select.Me.applyTo( this );
  }
});

// A collection type allowing only one selection at a time
var Collection = Backbone.Collection.extend({
  initialize: function ( models, options ) {
    // Applies the mixin:
    Backbone.Select.One.applyTo( this, models, options );
  }
});

var m1 = new Model( {id: "m1"} ),
    m2 = new Model( {id: "m2"} ),
    m3 = new Model( {id: "m3"} );

var collection = new Collection( [m1, m2, m3] );

// --- (2) Selecting a model ---

collection.select( m1 );

console.log( collection.selected.id ); // prints "m1"
console.log( m1.selected );            // prints true

// --- (3) Events ---

collection.on( "select:one", function ( model ) {
  console.log( model.id + " has been selected." );
});
collection.on( "deselect:one", function ( model ) {
  console.log( model.id + " has been deselected." );
});

m2.select();
// prints "m1 has been deselected."
// prints "m2 has been selected."
```

###### Demos

There are a couple of interactive demos you can play around with. The demos are kept simple, and are a good way to explore the various features of Backbone.Select.

- Basic functionality, sharing models among multiple collections: [JSBin][demo-basic-jsbin], [Codepen][demo-basic-codepen]
- Delayed animation. Using custom labels in a Select.One collection: [JSBin][demo-label-select.one-jsbin], [Codepen][demo-label-select.one-codepen]
- Selecting, starring, loving. Using custom labels in a Select.Many collection: [JSBin][demo-label-select.many-jsbin], [Codepen][demo-label-select.many-codepen]
- Focusing on one selected item in a Select.Many collection, using custom labels: [JSBin][demo-focus-with-label-jsbin], [Codepen][demo-focus-with-label-codepen]
- Focusing on one selected item in a Select.Many collection, using the `exclusive` option: [JSBin][demo-focus-with-exclusive-jsbin], [Codepen][demo-focus-with-exclusive-codepen]

## Dependencies and setup

[Backbone][] and [Underscore][] are the only dependencies. Include backbone.select.js after [Backbone][].

The stable version of Backbone.Select is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]). If you use Bower, fetch the files with `bower install backbone.select`. With npm, it is `npm install backbone.select`.

When loaded as a module (e.g. AMD, Node), Backbone.Select does not export a meaningful value. It solely lives in the Backbone namespace.

## Basic model and collection interaction

In theory, a selectable model could be used on its own, but what purpose would it serve? Models are selected in the context of a collection.

So the mixins are used in tandem: Models are augmented with the [Backbone.Select.Me][] mixin, and stored in [Backbone.Select.One][] or [Backbone.Select.Many][] collections. All models in a Backbone.Select collection must have the Backbone.Select.Me mixin applied to them. If you don't take care of that yourself, it [happens automatically][select.me-auto-applied] when models, or sets of raw model data, are added to a Select.One or Select.Many collection.

Selections can be made with model or collection methods. Model and collection will keep each other in sync. Thus, if `model` is part of `collection`, `model.select()` and `collection.select( model )` are equivalent.

## Backbone.Select.Me: Making models selectable

Adds methods for selecting and deselecting a model. Tracks whether or not the model is selected, and triggers events when the selection changes.

### Creating a Select.Me model

To create a selectable model type, apply the mixin in its `initialize` method. Assuming your base type is `Backbone.Model`, augment it with

```js
var SelectableModel = Backbone.Model.extend({
  initialize: function () {
    Backbone.Select.Me.applyTo( this );
  }
});
```

Replace `Backbone.Model` in the example above with whatever base type you work with.

###### Signature, options

The Select.Me `applyTo()` signature is: 

```js
Backbone.Select.Me.applyTo( model, [options] );
```

You can pass an options hash as the second parameter to `.applyTo()`. Select.Me models recognize the [`defaultLabel` setup option][default-label].

### Applying the Select.Me model mixin automatically

You don't necessarily have to apply the Select.Me mixin to the models yourself. If you don't, it gets applied on the fly when you add models to a Select.One or Select.Many collection.

#### No setup, works everywhere

That works no matter how you add models to a collection. You can pass them in with `add()`, `set()`, `reset()`, or `create()`, or during instantiation. It also works when you pass in an array of attribute hashes, or some other data structure which still needs to be parsed (using `options.parse`). 

Likewise, if you set the `collection.model` property to a model class, there is no need to apply the Select.Me mixin in the `initialize()` method of that class.

#### When to apply the model mixin manually

In some cases, you have to [apply the Select.Me model mixin yourself][select.me-init], in the `initialize()` method of a dedicated model class.

- If you want to select models even before they become part of a collection, you obviously have to set them up with the Select.Me mixin applied.

- When the mixin is applied to models automatically while a collection is being created, the options passed to `Backbone.Select.Me.applyTo()` are inherited from the collection. You don't want that to happen if you [define a `defaultLabel`][default-label]. You should apply the Select.Me mixin explicitly then, and not rely on automatic application. [See below.][default-label-explicit-select.me]

### Backbone.Select.Me methods

The following methods are added to a model by the `Select.Me` mixin.

#### model.select( [options] )

Selects a model. It sets the model's `selected` property to true and triggers a [`"selected"`][selected-event] event.

```js
var model = new SelectableModel( { id: "foo" } );

model.on( "selected", function ( selectedModel ) {
  console.log( "I am model " + selectedModel.id + " and just got selected." );
});

model.select(); // => prints "I am model foo and just got selected."
model.selected; // => true
```

###### Reselecting a model

If the model has already been selected, selecting it again does not affect its state, and a `"selected"` event is not triggered. A [`"reselected"`][reselected-event] event is triggered instead.

###### Options

The `select` method supports the following options: [`silent`][select.me-silent], [`label`][custom-labels] and [`exclusive`][option-exclusive]. The `exclusive` option only affects [Select.Many][Backbone.Select.Many] collections – [see there][option-exclusive] for more.

###### Chaining

The method returns the model, and allows chaining.

#### model.deselect( [options] )

Deselects a model. It sets the model's `selected` property to false and triggers a [`"deselected"`][deselected-event] event.

```js
var model = new SelectableModel( { id: "foo" } );

model.on( "deselected", function ( deselectedModel ) {
  console.log( "I am model " + deselectedModel.id + " and just got deselected." );
});

// A model must be selected for `deselect` to have any effect.
model.select();

model.deselect(); // => prints "I am model foo and just got deselected."
model.selected;   // => false
```

If a model is not selected, deselecting it is a no-op and does not trigger a `"deselected"` event.

The `deselect` method supports the following options: [`silent`][select.me-silent], [`label`][custom-labels].

The method returns the model, and allows chaining.

#### model.toggleSelected( [options] )

Toggles the selection state between selected and deselected. Calls either the `select` or `deselect` method, which does the actual work.

```js
var model = new SelectableModel();

model.on( "selected", function () {
  console.log( "I am selected." );
});

model.on( "deselected", function () {
  console.log( "I am no longer selected." );
});

model.toggleSelected(); // => prints "I am selected."
model.toggleSelected(); // => prints "I am no longer selected."
```

The `toggleSelected` method supports the following options: [`silent`][select.me-silent], [`label`][custom-labels].

The method returns the model, and allows chaining.

### Backbone.Select.Me properties

The following property is managed by the Select.Me mixin.

#### model.selected

Returns a boolean value indicating whether or not the model is currently selected. May be `undefined` instead of false if a model has never been selected.

Use this property read-only, never set it directly. For changing its state, call the appropriate method: `.select()` or `.deselect()`.

### Backbone.Select.Me events

The events listed below are are triggered from Select.Me models. They bubble up to the collection, too. 

###### Silent option

Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in 

```js
model.select( { silent: true } )
```

###### Options hash

Event handlers receive an options hash as the last parameter. It contains the options which were used for the method call.

A `label` property is always part of that hash. It contains the [label][custom-labels] used for the action, regardless of whether it was set with the `label` option or left at its default.

Finally, custom options can be used when invoking any method. They are simply passed through to the event handler, merged into the options hash. See the [section on custom options][custom-options], below.

###### Predefined handlers

Event handlers with standard names are invoked automatically. Standard names are `onSelect`, `onDeselect`, and `onReselect`. If these methods exist on the model, they are run without having to be wired up with the event manually.

#### "selected"

Triggered when a model has been selected. Event handlers are called with the following arguments: _selected model, [options][select.me-event-options]_.

Runs the `onSelect` event handler if the method exists on the model.

Is not triggered when the model had already been selected and is selected again (without any change in status). That results in a `"reselected"` event.

#### "deselected"

Triggered when a model has been deselected. Event handlers are called with the following arguments: _deselected model, [options][select.me-event-options]_.

Runs the `onDeselect` event handler if the method exists on the model.

#### "reselected"

Triggered when a model, which is already selected, is selected again. Event handlers are called with the following arguments: _reselected model, [options][select.me-event-options]_.

Runs the `onReselect` event handler if the method exists on the model.

## Backbone.Select.One: a single-select collection

Adds methods for selecting and deselecting models to a collection. Tracks which model is selected, and triggers events when the selection changes.

Allows only a single model to be selected within the collection. Selecting another model will cause the first one to be deselected.

Models in a Backbone.Select.One collection must have the `Backbone.Select.Me` mixin applied to them. If you don't take care of that yourself, it [happens automatically][select.me-auto-applied] when models, or sets of raw model data, are added to a Select.One collection.

### Creating and closing a Select.One collection

To create a single-select collection type, apply the mixin in the `initialize` method. Assuming your base type is `Backbone.Collection`, augment it with

```js
var SelectOneCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models );
  }
});
```

Replace `Backbone.Collection` in the example above with whatever base type you work with.

###### Calling `close()`

If you no longer use a collection, call `collection.close()`. [See below][close-collection] for more.

###### Signature, options

The Select.One `applyTo()` signature is: 

```js
Backbone.Select.One.applyTo( collection, models, [options] );
```

You can pass an options hash as the third argument to `.applyTo()`, as seen in the model sharing example above. Select.One collections recognize the following setup options: [`defaultLabel`][default-label], [`ignoreLabel`][ignore-label].

###### `models` argument

You have to provide the `models` argument, but it doesn't have to be an array of models. Use whatever has been passed to `initialize()` as the models argument. That may indeed be an array of models, but it could also be an array of attribute hashes, or some other structure which still needs to be parsed (using Backbone's `options.parse`). The `models` argument may even be `null` or `undefined`. No matter what it is, pass it on. The Backbone.Select mixin needs to examine it, and it can handle it all.

There are differences, though, in what you are able to do next. If full-fledged models are passed to a collection, they can be selected as soon as the Select.One mixin has been applied to the collection. In other words, you can select a model as part of the setup process in `initialize()`:

```js
var Collection = Backbone.Collection.extend( {
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models );
    
    // We can select the first model right here, provided that actual 
    // models have been passed in. (But we better guard against all the 
    // other stuff which can be passed to a collection.)
    if ( models && models[0] && models[0].select ) models[0].select();
  }
} );
```

However, when raw attribute data is passed in, or data in need of parsing, the corresponding models can only be selected _after_ the instantiation is complete, not in `initialize()`. This is a limitation of Backbone itself. Raw data is parsed and converted into models eventually, but only after `initialize()` has run its course.

(If you need to make selections like the one above, choosing an item while you create and populate the collection, you are probably better off with the [`autoSelect` option][Backbone.Cycle-autoselect] offered by [Backbone.Cycle][]. Backbone.Cycle is built on top of Backbone.Select.)

If the models don't have the [Select.Me mixin][Backbone.Select.Me] applied to them out of the box, it is applied to them [as they are processed by the collection mixin][select.me-auto-applied].

### Backbone.Select.One methods

The following methods are added to a collection by the `Select.One` mixin.

#### collection.select( model, [options] )

Selects a model. It stores the selected model in the `selected` property of the collection, and updates the `selected` property of the model as well. Both collection and model fire their respective events for a selection.

```js
var model = new SelectableModel();
var collection = new SelectOneCollection( [model] );

collection.select( model );
```

As [mentioned before][model-collection-interaction], calling `collection.select( model )` is equivalent in every way to calling `model.select()`.

###### Automatic deselection

If another model had already been selected, that model is deselected in the process. The events indicating a deselection are also triggered. 

Combined select-deselect actions are treated as atomic, so all related events – for the selection as well as the deselection – are fired only after the selection and the deselection have already taken place.

###### Reselecting models

Reselecting the same model again does not affect the state of the model or the collection, and events indicating a selection won't be triggered – no [`"select:one"`][select:one-event] event for the collection, no [`"selected"`][selected-event] event for the model.

Instead, a [`"reselect:one"`][reselect:one-event] event (collection) and a [`"reselected"`][reselected-event] event (model) indicate the action.

###### Options 

The `select` method supports the following options: [`silent`][select.one-silent], [`label`][custom-labels].

###### Chaining

The method returns the collection, and allows chaining.

###### Compatibility

Backbone collections have a `select` method out of the box, an alias of `filter`. It continues to be accessible, based on its different signature. [See below][select-compatibility].

#### collection.deselect( [model], [options] )

Deselects a model if it had been selected. It removes the model from the `selected` property of the collection, and sets the `selected` property of the model to false as well. Both collection and model fire their respective events for a deselection.

```js
var model = new SelectableModel();
var collection = new SelectOneCollection( [model] );

collection.deselect( model );
```

Again, as [mentioned before][model-collection-interaction], calling `collection.deselect( model )` is equivalent in every way to calling `model.deselect()`.

If the model is not currently selected, this action is a no-op. If you try to deselect a model which is not the currently selected model of the collection, the actual selected model will not be deselected.

You can call `deselect` without a model argument. The currently selected model, if any, will be deselected in that case.

The `deselect` method supports the following options: [`silent`][select.one-silent], [`label`][custom-labels].

The method returns the collection, and allows chaining.

### Backbone.Select.One properties

The following property is managed by the Select.One mixin.

#### collection.selected

Returns the model which is currently selected in the collection, or `undefined` if no model is selected.

```js
var collection = new SelectOneCollection();
collection.select( model );

collection.selected; // => model
```

### Backbone.Select.One events

The events listed below are triggered by Backbone.Select.One based on changes of the selection. 

###### Silent option

Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in 

```js
collection.select( model, { silent: true } )
```

###### Options hash

Event handlers receive an options hash as the last parameter. It contains the options which were used for the method call.

A `label` property is always part of that hash. It contains the [label][custom-labels] used for the action, regardless of whether it was set with the `label` option or left at its default.

Another property in the hash might be [`_externalEvent`][external-event]. It appears when the selection or deselection was initiated indirectly, e.g. by an `add()` or `remove()` action, and [contains the name][external-event] of the corresponding event.

Finally, custom options can be used when invoking any method. They are simply passed through to the event handler, merged into the options hash. See the [section on custom options][custom-options], below.

###### Predefined handlers

Event handlers with standard names are invoked automatically. Standard names are `onSelect`, `onDeselect`, and `onReselect`. If these methods exist on the collection, they are run without having to be wired up with the event manually.

#### "select:one"

Triggered when a model has been selected. Event handlers are called with the following arguments: _selected model, collection, [options][select.one-event-options]_.

Runs the `onSelect` event handler if the method exists on the collection.

Is not triggered when the model had already been selected and is selected again (without any change in status). That results in a `"reselect:one"` event.

#### "deselect:one"

Triggered when a model has been deselected. Event handlers are called with the following arguments: _deselected model, collection, [options][select.one-event-options]_.

Runs the `onDeselect` event handler if the method exists on the collection.

The event fires when `deselect` has been called explicitly, and also when a model is deselected by selecting another one.

Combined select-deselect actions are treated as atomic, so `"deselect:one"` fires after both the deselection and the selection have already taken place. That is also the case for any other events related to the transaction, such as the `"deselected"` and `"selected"` events on the models involved.

#### "reselect:one"

Triggered when a model, which is already selected, is selected again. Event handlers are called with the following arguments: _reselected model, collection, [options][select.one-event-options]_.

Runs the `onReselect` event handler if the method exists on the collection.

## Backbone.Select.Many: a multi-select collection

Adds methods for selecting and deselecting models to a collection. Tracks which models are selected, and triggers events when the selection changes.

Backbone.Select.Many allows multiple models to be selected in a collection at the same time.

Models in a Backbone.Select.Many collection must have the `Backbone.Select.Me` mixin applied to them. If you don't take care of that yourself, it [happens automatically][select.me-auto-applied] when models, or sets of raw model data, are added to a Select.Many collection.

### Creating and closing a Select.Many collection

To create a multi-select collection type, apply the mixin in the `initialize` method. Assuming your base type is `Backbone.Collection`, augment it with

```js
SelectManyCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.Many.applyTo( this, models );
  }
});
```

Replace `Backbone.Collection` in the example above with whatever base type you work with.

###### Calling `close()`

If you no longer use a collection, call `collection.close()`. [See below][close-collection] for more.

###### Signature, options

The Select.Many `applyTo()` signature is: 

```js
Backbone.Select.Many.applyTo( thisCollection, models, [options] );
```

You can pass an options hash as the third argument to `.applyTo()`, as seen in the model sharing example above. Select.Many collections recognize the following setup options: [`defaultLabel`][default-label], [`ignoreLabel`][ignore-label].

###### `models` argument

You have to provide the `models` argument. Pass on whatever has been passed to `initialize()` as the models argument.

If you pass in raw model data while you create the collection – e.g. a set of attribute hashes, or other data still needing to be parsed –, then you can't select a model in `initialize()`, or at any other point while creating the collection.

See the [corresponding section about the Select.One mixin, above][select.one-models-arg], for more details about the `models` argument.

### Backbone.Select.Many methods

The following methods are added to a collection by the `Select.Many` mixin.

#### collection.select( model, [options] )

Selects a model. It stores the selected model in the `selected` list of the collection, and updates the `selected` property of the model as well. Both collection and model fire their respective events for a selection.

```js
var model = new SelectableModel();
var collection = new SelectManyCollection( [model] );

collection.select( model );
```

As [mentioned before][model-collection-interaction], calling `collection.select( model )` is equivalent in every way to calling `model.select()`.

###### Reselecting models

Reselecting the same model again does not affect the state of the model or the collection, and events indicating a selection won't be triggered – no [`"select:some"`][select:some-event] or [`"select:all"`][select:all-event] event for the collection, no [`"selected"`][selected-event] event for the model.

Instead, a [`"reselect:any"`][reselect:any-event] event (collection) and a [`"reselected"`][reselected-event] event (model) indicate the action.

###### Options 

The `select` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels] and `exclusive`.

###### The `exclusive` option

The `exclusive` option makes a Select.Many collection work like a Select.One collection for just one action. By passing the option `{ exclusive: true }` to a `.select()` call, only the specified model is selected, and all others are deselected.

```js
var collection = new SelectManyCollection( [m1, m2, m3] );
m1.select();
m2.select();

collection.select( m3, { exclusive: true } );
collection.selected;    // => { "c3": model3 }
```

As one would expect, it also works when the model has already been selected before. The model stays selected, but all other models are deselected.

You can also use the `exclusive` option when calling `.select()` on a model, rather than the collection.

```js
m3.select( { exclusive: true } );
```

When models are shared among multiple collections, it makes a difference whether you call `.select()` with the `exclusive` option directly on a model, or on a collection. 

In the context of a collection, the effect of the `exclusive` option is limited to the collection where the selection took place. Other Select.Many collections don't inherit the "exclusivity" of the model, and don't deselect models unless they, too, are shared with the collection where the call was made. Consider this:

```js
var collectionA = new SelectManyCollection( [m1, m2] );
var collectionB = new SelectManyCollection( [mA, m2] );
m1.select();
mA.select();

collectionA.select( m2, { exclusive: true } );
collectionA.selected;    // stores only m2; `exclusive` at work here
collectionB.selected;    // stores mA, m2; `exclusive` not inherited
```

When you use the `exclusive` option for a `.select()` call on a model, however, its effect spreads to any collection sharing that particular model.

```js
var collectionA = new SelectManyCollection( [m1, m2] );
var collectionB = new SelectManyCollection( [mA, m2] );
m1.select();
mA.select();

m2.select( { exclusive: true } );
collectionA.selected;    // stores only m2; `exclusive` at work here
collectionB.selected;    // stores only m2; `exclusive` also at work here
```

Finally, combined select-deselect actions are treated as atomic, so all related events – for the selection as well as the deselections – are fired only after the selection and the deselections have already taken place.

###### Chaining

The method returns the collection, and allows chaining.

###### Compatibility 

Backbone collections have a `select` method out of the box, an alias of `filter`. It continues to be accessible, based on its different signature. [See below][select-compatibility].

#### collection.deselect( [model], [options] )

Deselects a model if it had been selected. It removes the model from the `selected` list of the collection, and sets the `selected` property of the model to false as well. Both collection and model fire their respective events for a deselection.

```js
var model = new SelectableModel();
var collection = new SelectManyCollection( [model] );

collection.deselect( model );
```

If the model is not currently selected, this action is a no-op.

You can call `deselect` without a model argument. All currently selected models, if any, will be deselected in that case. The method acts exactly like `deselectAll()` then.

The `deselect` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels].

The method returns the collection, and allows chaining.

#### collection.selectAll( [options] )

Selects all models in the collection. Fires collection and model events indicating the change, and separate events for any re-selections. See the [events section][select.many-events] below.

```js
collection.selectAll();
```

The `selectAll` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels].

The whole batch of select actions is treated as atomic. All related events – those of the collection as well as those of individual models – are fired only after the selections have been completed.

The method returns the collection, and allows chaining.

#### collection.deselectAll( [options] )

Deselects all models in the collection. Fires collection and model events indicating the change. See the [events section][select.many-events] below.

```js
collection.deselectAll();
```

The `deselectAll` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels].

The whole batch of deselect actions is treated as atomic. All related events – those of the collection as well as those of individual models – are fired only after the deselections have been completed.

The method returns the collection, and allows chaining.

#### collection.invertSelection( [options] )

Selects all models in the collection which haven't been selected, and deselects those which have been. Fires collection and model events indicating the change. See the [events section][select.many-events] below.

```js
collection.invertSelection();
```

The `invertSelection` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels].

The whole batch of select and deselect actions is treated as atomic. All related events – those of the collection as well as those of individual models – are fired only after the selections and deselections have been completed.

The method returns the collection, and allows chaining.

#### collection.toggleSelectAll( [options] )

Selects all models in the collection. If that is already the case and all models are selected, they are deselected instead. Fires collection and model events indicating the change, and separate events for any re-selections. See the [events section][select.many-events] below.

```js
var collection = new SelectManyCollection( models );

collection.toggleSelectAll(); // selects all models in the collection
collection.toggleSelectAll(); // deselects all models in the collection
```

The following rules apply when toggling:

* If no models are selected, select them all.
* If some models are selected, but not all of them, select them all.
* If all models are selected, deselect them all.

The `toggleSelectAll` method supports the following options: [`silent`][select.many-silent], [`label`][custom-labels].

The whole batch of select and deselect actions is treated as atomic. All related events – those of the collection as well as those of individual models – are fired only after the selections and deselections have been completed.

The method returns the collection, and allows chaining.

### Backbone.Select.Many properties

The following properties are managed by the Select.Many mixin.

#### collection.selected

Returns a hash of the selected models. The `cid` of the models serve as the keys. Returns an empty object, `{}`, if no models are selected.

```js
var collection = new SelectManyCollection( [model1, model2] );
collection.select( model1 );

collection.selected; // => { "c1": model1 }

// Select an additional model
collection.select( model2 );

collection.selected; // => { "c1": model1, "c2": model2 }
```

#### collection.selectedLength

Stores the number of selected items in the collection. Equivalent to calling `_.size( collection.selected )`.

```js
var collection = new SelectManyCollection( [model] );
collection.select( model );

collection.selectedLength; // => 1
```

### Backbone.Select.Many events

The events below are triggered by Backbone.Select.Many based on changes of the selection. 

###### Silent option

Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in 

```js
collection.select( model, { silent: true } )
```

###### Diff hash

Select.Many events, with the exception of `"reselect:any"`, pass a "diff" hash to event handlers as the first parameter: 

```js
{ selected: [...], deselected: [...] }
```

The `selected` array contains models which have been newly selected by the action triggering the event. Likewise, models in the `deselected` array have changed their status from selected to deselected.

###### Options hash

Event handlers receive an options hash as the last parameter. It contains the options which were used for the method call, such as [`exclusive`][option-exclusive].

A `label` property is always part of that hash. It contains the [label][custom-labels] used for the action, regardless of whether it was set with the `label` option or left at its default.

Another property in the hash might be [`_externalEvent`][external-event]. It appears when the selection or deselection was initiated indirectly, e.g. by an `add()` or `remove()` action, and [contains the name][external-event] of the corresponding event.

Finally, custom options can be used when invoking any method. They are simply passed through to the event handler, merged into the options hash. See the [section on custom options][custom-options], below.

###### Predefined handlers

Event handlers with standard names are invoked automatically. Standard names are `onSelectNone`, `onSelectSome`, `onSelectAll` and `onReselect`. If these methods exist on the collection, they are run without having to be wired up with the event manually.

#### "select:all"

Triggered when all models have been selected. Event handlers are called with the following arguments: _["diff" hash][diff-hash], collection, [options][select.many-event-options]_.

Runs the `onSelectAll` event handler if the method exists on the collection.

#### "select:none"

Triggered when all models have been deselected. Event handlers are called with the following arguments: _["diff" hash][diff-hash], collection, [options][select.many-event-options]_.

Runs the `onSelectNone` event handler if the method exists on the collection.

#### "select:some"

Triggered when some, but not all, models have been selected. Event handlers are called with the following arguments: _["diff" hash][diff-hash], collection, [options][select.many-event-options]_.

Runs the `onSelectSome` event handler if the method exists on the collection.

#### "reselect:any"

Triggered when at least one model, which is already selected, is selected again. Event handlers are called with the following arguments: _array of reselected models, collection, [options][select.many-event-options]_.

Runs the `onReselect` event handler if the method exists on the collection.

In contrast to the other events, this event fires even if there isn't any change in the resulting selection at all. Note that there is no separate reselect:all event; the re-selection of all items in the collection is also covered by `"reselect:any"`.


## Custom labels

By default, a selected model is labeled with the property `selected`. Select.One and Select.Many collections expose a `selected` property, too. You can change these names to ones of your choosing. And if you do, you can use different names alongside each other.

That may look like a trivial bit of syntactic sugar, but it isn't. It adds a whole new layer of flexibility, allowing different types of selections to coexist.

### Using the `label` option

Creating and using a custom label is easy. Just set it in the `label` option when selecting or deselecting.

```js
model.select( { label: "starred" } );

model.starred;     // => true
model.selected;    // => undefined
```

A selection made with a specific `label` acts on that label only, not on any others. The default label, `"selected"`, is not involved in the selection above, so `model.selected` remains unchanged. Different labels are independent of each other.

That is a key feature of labels. You can use any number of them in a given collection, at the same time. You can also use them across a whole bunch of collections, be they Select.One or Select.Many collections, or both.

But how exactly is a `label` used in the context of a collection?

```js
// A Select.One collection
collection.select( model, { label: "starred" } );

collection.starred;     // => model
collection.selected;    // => undefined
```

It works the same in a Select.Many collection, but have a look at retrieving the length:


```js
// A Select.Many collection
collection.select( model, { label: "starred" } );

collection.starred;          // => { "c1": model } assuming that model.cid = "c1"
collection.selected;         // => {}

collection.starredLength;    // => 1
collection.selectedLength;   // => 0
```

You already know that `selectedLength` stores the size of a selection made with the default label, `"selected"`. Likewise, when you make a selection  with `label: "starred"`, you retrieve its size from the property `starredLength`. If you were to use the label `"foo"`, you'd have to query `fooLength`.

You may have noticed that the collection has a `selected` property, and `selectedLength`, even though we haven't actually used that label in any call. These properties always exist because `"selected"` is the default label. (You can [change the default label][default-label], though.)

### The `label` in events

The label in use is also exposed in selection-related events. 

#### Event handler arguments: `label` property

Every event handler receives an options hash as the last argument, and that hash has a `label` property. It always contains the label name, whether you have passed in a custom label or not.

```js
model.on( "selected", function ( model, options ) {
  console.log( "Label: " + options.label );
});

// The event handler receives the custom label
model.select( { label: "starred" } );  // prints "Label: starred"

// The event handler also receives the default label
model.select();                        // prints "Label: selected"
```

#### Namespaced events

The generic events like `"selected"`, `"select:one"` etc fire regardless of the label you use. Besides, there are more specific events which are namespaced to the label. `"selected:starred"` fires when a model is selected using the custom `"starred"` label. The somewhat inelegant `"selected:selected"` event fires when a model is selected with the default label, `"selected"`.

Every event has these namespaced variants. The label is simply appended to the generic event name, in the format `:labelName`. For the label `"foo"`, event names would be `"select:one:foo"`, `"deselected:foo"`, `"reselect:any:foo"` etc.

#### Built-in event handlers

As mentioned elsewhere, predefined event handlers like `onSelect` are invoked automatically. They respond to generic events like `"selected"` and therefore run regardless of the label you use. If you need to differentiate, read the label from the options argument, which is the last argument the handler receives ([see above][label-event-args]).

Predefined event handlers are only available for generic events, not for their namespaced variants. So if you create a `onSelectStarred` method on a model, it will _not_ be invoked automatically when a `"selected:starred"` event occurs.

### The `defaultLabel` setup option

The default label for selections or deselections is `"selected"`. You can provide your own name for the default label when you apply the Select.Me, Select.One and Select.Many mixins:

```js
var Collection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models, { defaultLabel: "starred" } );  // <= HERE
  }
});

var collection = new Collection( [model] );

// Calling select() without specifying a label
collection.select( model );

collection.starred;     // => model
collection.selected;    // => undefined
```

Unless you have a specific dislike for the `"selected"` label, you probably won't need that option most of the time. But it becomes essential when you want to ignore the `"selected"` label. See the [`ignoreLabel` setup option, below][ignore-label], for more.

#### With a `defaultLabel`, apply Select.Me mixins to models explicitly

Selectable models need to have the Select.Me mixin applied to them, but you don't necessarily have to take care of that yourself. If the mixin is missing in some models, a Select.One or Select.Many collection [applies the mixin automatically][select.me-auto-applied] when the models are being added to the collection. That is convenient, but it has an undesirable effect when the `defaultLabel` option comes into play.

Suppose you create a new collection and pass models to it during instantiation. The Select.One or Select.Many mixin gets applied to the collection, and the models are automatically spruced up with Select.Me mixins. As a part of that process, the model mixins inherit the setup options of the collection mixin. And so, the `defaultLabel` of the collection becomes the `defaultLabel` of the models as well.

However, models you add to the collection later on, which also have the Select.Me mixin applied on the fly, do not automatically inherit the `defaultLabel` of the collection. You have to set the default label in the options of every call to `add()`, `reset()` or `set()`. If you forget, the models in the collection end up with varying default labels. 

Stay clear of that mess. If you use a `defaultLabel` anywhere, [apply the Select.Me mixin to the models explicitly][select.one-init], in the `initialize()` method of a dedicated model class. Do not rely on automatic mixin application then.

### The `ignoreLabel` setup option

There may be scenarios when you don't want a collection to respond to selections made with a specific label. Then, you'll need the `ignoreLabel` setup option.

#### Use case

Suppose you have a Select.One collection and a Select.Many collection, and both are sharing the same set of models. You want to select models, and also star them (using a custom `"starred"` label). Only one model should be selected at a time. But there should be no limit on how many models are starred.

In that scenario, selecting models works out of the box. The models are part of a Select.One collection, so only one model is selected at a time. But unfortunately, the same mechanism is at play when you use the `"starred"` label. Starring one model immediately un-stars another one, precisely because they are all in the same Select.One collection. 

To make things work and star multiple models, you have to make the Select.One collection ignore the `"starred"` label somehow. Then, you'd be able to manage your starred models in the Select.Many collection, without the Select.One collection interfering.

#### Using `ignoreLabel`

You can provide the name of a label to ignore, or an array of names, when you apply the Select.One and Select.Many mixins.

```js
var Collection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models, { ignoreLabel: "starred" } );  // <= HERE
  }
});

var collection = new Collection( [model] );

// Calling select() with the ignored label
collection.select( model, { label: "starred" } );
collection.starred;     // => undefined

// Calling select() with other labels continues to work
collection.select( model );
collection.selected;    // => model
```

Ignoring labels only works in the context of a collection. You can't ignore labels on the level of a model. Technical considerations aside, it just wouldn't make sense. Hence, the `ignoreLabel` option does not do anything in a Select.Me model setup.

#### `ignoreLabel` and the default label

Don't define a label as the default for a collection – which implies that you intend to use it – and then instruct the collection to ignore it. You can't ignore the default label.

That fact could potentially trip you up when you try to make a collection ignore the `"selected"` label. In order to ignore `"selected"`, you have to define a different default label at the same time.

```js
var Collection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models, { 
      defaultLabel: "starred", 
      ignoreLabel: "selected" 
    } );
  }
});

var collection = new Collection( [model] );

// Calling select() with the ignored label
collection.select( model, { label: "selected" } );
collection.selected;    // => undefined
```

## Custom options

With custom options, you can send additional information to event handlers. Just pass an arbitrary, custom option (or a whole bunch of them) to any method. Custom options don't affect the operation of Backbone.Select, but they are passed on to the event handlers as the last argument.

```js
var collection = new SelectOneCollection( [model] );
collection.on( "select:one", function ( model, collection, options ) {
  if ( options ) console.log( "Selected while foo=" + options.foo );
});

collection.select( model, { foo: "bar" } );    // prints "Selected while foo=bar"
```

Options get passed around to all event handlers which are running. In the example above, the event handler is set up for the collection. It will also pick up an option passed to the `select` method of the model, for instance.

```js
model.select( { foo: "baz" } );    // prints "Selected while foo=baz"
```


## Guidelines

There are a number of things you should know, or do, to work with selections successfully.

### Call `close()` when discarding a collection

When a collection is no longer in use, call `close()` on it. That avoids memory leaks and ensures proper selection handling when models [are shared][interaction-guidelines] between collections.

So don't just replace a collection like this:

```js
var collection = new SelectableCollection( [model] );
// ... do stuff
collection = new SelectableCollection( [model] );  // WRONG!
```

Instead, call `close()` before you let an obsolete collection fade away into oblivion:

```js
var collection = new SelectableCollection( [model] );
// ... do stuff
collection.close();
collection = new SelectableCollection( [model] );  // now OK
```

### Interaction of collections and models

A number of simple rules govern the interaction of collections and models.

- Models can be part of more than one collection. The collections don't have to be of the same type. A model can be part of single-select and multi-select collections at the same time.

  Selections carry over. If you select a model in one collection, it gets selected in all other collections it is part of. Likewise for deselections.

- The selections in a collection are updated as needed when models are added and removed.

  Suppose you have selected a model (or models) in one collection, and then you create another one with these models. The new collection will pick up the selections you have already made.

- A model loses its `selected` status when it is removed from the last collection holding it. 

  The concept of selecting a model only makes sense in relation to a group, ie a collection. When you remove a model from all collection contexts, its selection has lost its meaning and is cleared. If you reuse the model later on and add it to a collection, you start with a clean slate.

  Resetting a collection has the same effect. Suppose you reset a collection, with a set of models which has already been part of the collection before the reset. If the models are not part of another collection, they loose their `selected` status as they are removed, and are deselected by the time they are re-added.
  
  However, if the models also part of another collection, they retain their `selected` status even as they are removed, and nothing changes as a result of the reset.

- When adding multiple selected models to a Select.One collection in one go, the last selected model "wins".

  Suppose a number of models are selected in a Select.Many collection. You then also add them to a Select.One collection. Only one model can be selected there, so Backbone.Select will deselect all but one of them. And that winner is the last model added to the Select.One collection – it retains its `selected` status.

### Events

If you are working with events a lot, knowledge of the finer points can make a difference.

- Selections and deselections involving a number of collections and models are treated as atomic. Events are delayed until all collections and models have been updated, without select or deselect actions pending.

  To illustrate, suppose two models are part of two collections simultaneously: a Select.One collection, and a Select.Many collection. The first of the models is currently selected. Now if you go ahead in the Select.Many collection and select the second model there, it also gets selected in the Select.One collection, which in turn deselects the first model – in the Select.One collection, and eventually also in the Select.Many collection.
  
  Selection-related events do not fire until that process is complete, and all models and collections are in a consistent state.

- When a selection, or deselection, is made with the `silent` option enabled, selection-related events will be silenced in all of the collections sharing the model.

- When a selected model is added to a collection or removed from it, the collection is updated and the corresponding `"select:*"` event is fired. Event handlers receive an options object with related information. In the options object, the name of the underlying Backbone event, `"add"` or `"remove"`, is available as `options._externalEvent`, e.g. `{ _externalEvent: "add" }`.

- The `_externalEvent` property only appears in the event of the collection to which models are added, or from which they are removed. The `_externalEvent` property does not show up in events of other collections sharing the model, nor in events of the model itself.

  As the property name suggests, `_externalEvent` communicates the underlying _event_, not the action which has triggered it. Methods like `set()`, `create()` and `destroy()` trigger `"add"` and `"remove"` events. When such a method is called, `_externalEvent` is set to a value of either `"add"` or `"remove"` as each event happens.
  
  The options passed along with a `"select:*"` event also inherit the event options of the underlying Backbone event.

- A `reset()` does not trigger a `"select:*"` or `"deselect:one"` event in the collection which is reset. The command is meant to suppress individual notifications. It does so for Backbone's own collection events as well, and keeps `"add"` and `"remove"` events from firing. So for the collection being reset, only a `"reset"` event is fired in the end.

  That silence only affects the collection which is reset, however. And it is limited to collection events. Model events go ahead: the `"selected"` and `"deselected"` events of a model fire as usual, and they bubble up to the collection, too. In other collections sharing the models, the `"select:*"` and `"deselect:one"` events proceed as ever.
  
- When a selected model is added to a collection while the collection is instantiated, no collection event is fired: no `select:one` event in a Select.One collection, no `select:some` or `select:all` event in a Select.Many collection.
  
  Passing models to a collection during instantiation is pretty much the same as a reset. (In fact, internally, Backbone indeed handles it as a silent reset.) So no event is fired in the collection.
  
- The selection-related events in a Select.Many collection (and anywhere else, for that matter) fire when a selection or deselection is made. They do not fire merely because the status of the collection changes, e.g. from some models in a collection being selected to all models being selected.

  Suppose, for instance, that some models in a Select.Many collection are selected. Then the unselected models are removed from the collection, in one go. All remaining models in the collection are selected now. But that status change has not come about because of a selection. So there is no `"select:all"` event.
  
  Put differently, there never is a `select:none`, `select:some`, or `select:all` event with a [diff object][diff-hash] where both `diff.selected` and `diff.deselected` would be empty.

### Special considerations when calling `set()`

A `set()` call acts as a wrapper around three different actions:

- a `remove()` call, removing all existing models which are not passed in with `set()`
- a merge operation, updating the attributes of existing models which _are_ passed in with `set()`
- an  `add()` call, adding models which are not yet part of the collection.

The three actions take place in that exact order: `remove()`, merge, `add()`. Even though they all happen under the umbrella of a single `set()` call, they are independent of each other and fire their own events, as if called individually.

The implications of that process can be surprising.

#### Selection sequence with `set()`

Consider, for example, a Select.One collection in which `existingModel` is selected. You want to update the attributes of that model. At the same time, you want to add `newModel`, which is already selected as well – perhaps that happened in another collection.

When you call `collection.set( [existingModel, newModel] )`, the existing model gets deselected, and `newModel` becomes the selected model in the collection. In a Select.One collection, only one model can be selected, and it may seem that the last model "wins". 

And that would indeed be the case if the models were passed in with `add()` or `reset()`: with these commands, models are processed in order. But not with `set()`. If you provide the models in reverse order, and call `collection.set( [newModel, existingModel] )`, the last model does not win – `newModel` still comes out on top and is the selected one.

That's because the models are processed in separate `remove()`, merge, and `add()` actions, as described above. After removing any surplus models, the `set()` process enters the merge phase first, and updates the existing model, at which point it still is selected. Later, `set()` performs an independent `add( newModel )` action, which deselects `existingModel`.

#### Events with `set()`

Because `set()` is really just a wrapper around other operations, it fires the events belonging to these operations. The initial, implicit `remove()` call is accompanied by `remove` events, one for each model removed. Likewise, the `add()` action fires `add` events.

With each such event, the selections are brought up to date. So each `add` or `remove` event happens in tandem with a batch of selection events it may have caused. 

For instance, the removal of a selected model from a Select.One collection triggers the events `remove` and `deselect:one` in the collection, and perhaps a `deselected` event on the model as well (unless the model is also contained in other collections, and stays selected). Only after these related events have run their course, the next removal takes place – or, eventually, an addition.

In total, `set()` can cause a whole series of these event batches, each kicked off by the underlying `remove` or `add` action.


## Compatibility with Backbone's own select method

Out of the box, Backbone collections have their own `select` method – an alias of `filter`. In your own code, that should not be an issue: just use `filter`.

The original `select` method of Backbone collections is still available, though, and can be called just as before. Even implementations overriding Backbone's `select` remain accessible. That's because the `select` method is overloaded. If the first argument in a `select` call is a model, the Backbone.Select mixin will handle it. If not, the call is passed up the prototype chain.

That kind of compatibility is crucial for third-party plugins or legacy code. They may rely on Backbone's select, or on their own implementation. Even so, they will continue to work – no modification required.

## Compatibility with Backbone.Picky

This component started off as a series of PRs for [Backbone.Picky][] and turned into an independent fork at version 0.2.0. Backbone.Picky itself is no longer developed, but migrating is easy.

Backbone.Select is fully compatible to Backbone.Picky once you have instantiated it. You only have to change the way the mixin is created and applied to an object.

Picky.Selectable was applied like this:

```js
initialize: function () {
  var selectable = new Backbone.Picky.Selectable( this );
  _.extend( this, selectable );
}
```

In Backbone.Select, it has become

```js
initialize: function () {
  Backbone.Select.Me.applyTo( this );
}
```

Similarly, the initialization of Picky.SingleSelect

```js
initialize: function () {
  var singleSelect = new Backbone.Picky.SingleSelect( this );
  _.extend( this, singleSelect );
}
```

is replaced by

```js
initialize: function ( models ) {
  Backbone.Select.One.applyTo( this, models );
}
```

Picky.MultiSelect is treated the same way. Use `Backbone.Select.Many.applyTo( this, models )`.

If you no longer use a collection and are about to discard it, you need to close it first: call `collection.close()`. [See above][close-collection].

## Extension API

There are a number of internal properties, flags, events, and configuration settings which nevertheless are part of the public API of Backbone.Select. You should not need to even know about them when you apply the mixins to your own objects. But they can come in handy if you build a component on top of Backbone.Select. (An example of such a component is [Backbone.Cycle][].)

The API is safeguarded by tests. Introducing a breaking change would entail moving to a new major version of Backbone.Select. In other words, the API is safe to use – never mind it is largely internal.

### Internal properties

**Use the following properties read-only.**

Internal properties are prefixed with `_picky`. (The first such property was introduced when Backbone.Select was still a bunch of PRs for Backbone.Picky, hence the name.) 

In addition to the properties listed here, you'll find other ones with a `_picky` prefix in the source. But the `_picky` prefix in itself does not mean that a property is part of the public API. If you encounter a property and don't see it in the list below, it might change or be removed at any time, so don't rely on it (or monitor it closely).

##### `_pickyType`

Present in all Backbone.Select entities. Signals if a Backbone.Select mixin has been applied to a Backbone model or collection, and tells its type. Values: `"Backbone.Select.Me"`, `"Backbone.Select.One"`, `"Backbone.Select.Many"`.

##### `_pickyDefaultLabel`

Used in all Backbone.Select entities. Contains the name of the [default label][default-label]. Always present, is set to `"selected"` unless the label has been changed with the `defaultLabel` setup option.

##### `_pickyIgnoredLabels`

Used in Select.One and Select.Many collections. Contains an array of [ignored labels][ignore-label]. Always present, contains an empty array if no label has been ignored.


#### Internal flags

##### `@bbs:silentLocally`

You can pass the flag `@bbs:silentLocally: true` in the options of a `select()` or `deselect()` call. It acts like `silent`, except that events are silenced only for the model or collection on which `select()` or `deselect()` has been called. In addition, events are silenced only for the call itself, not secondary ones.

Let's clarify the effect of the `@bbs:silentLocally` flag in practical terms:

- If you use the flag for a call on a collection, it doesn't silence the events fired by the model. It also doesn't silence the events fired by other collections sharing the model.
- If the flag is used on a model, collection events go ahead unsilenced.
- If you select a model in a Select.One collection and it leads to another model being deselected, only the `select:one` event is silenced, but not the (secondary) `deselect:one` event.
- If you use the flag on a collection, only the collection events themselves are silenced (e.g. `select:one`, `deselect:one` for a Select.One collection). The model events `selected`, `deselected` continue to bubble up to the collection and can be observed on it.
- However, if you use the flag on a model, the `selected` and `deselected` events aren't just silenced the on the model itself, but also on the collection. They aren't fired on the model, so they don't bubble up.

#### Internal events

##### `@bbs:add:silent`

The `@bbs:add:silent` event is fired after an otherwise silent addition. It is only triggered with `options.silent` being set.

By the time the event is fired, selections have been updated and the underlying action, which would normally trigger an `"add"` event, has run its course.

Event handlers receive the same arguments as for an ordinary `"add"` event.

##### `@bbs:remove:silent`

The `@bbs:remove:silent` event is fired after an otherwise silent removal. It is only triggered with `options.silent` being set.

By the time the event is fired, selections have been updated and the underlying action, which would normally trigger a `"remove"` event, has run its course.

Event handlers receive the same arguments as for an ordinary `"remove"` event, including `options.index`.

In addition, `options["@bbs:wasSelected"]` flags if the removed model had been selected.  That is useful because the model is no longer selected by the time the event fires (unless it is still part of another collection). The flag fills that information gap.

The status is stored per label. So, to retrieve the status with regard to the `selected` label, query 

```js
options["@bbs:wasSelected"]["selected"]
```

##### `@bbs:reset:silent`

The `@bbs:reset:silent` event is fired after an otherwise silent reset. It is only triggered with `options.silent` being set.

By the time the event is fired, selections have been updated and the underlying action, which would normally trigger a `"reset"` event, has run its course.

Event handlers receive the same arguments as for an ordinary `"reset"` event, including `options.previousModels`.

#### Configuration settings

##### `Backbone.Select.Me.custom.applyModelMixin`

The `applyModelMixin` configuration can be set to a function which applies a custom model mixin to a model.

When raw model data or plain Backbone models are passed to a collection, the Select.Me model mixin is [applied to them automatically][select.me-auto-applied]. In case you want to supply modified versions of the Select.Me mixin at that point, set `Backbone.Select.Me.custom.applyModelMixin` to a function which applies a mixin as you see fit.

The `applyModelMixin` function can pick variations of the `Select.Me` mixin based on the collection (type), or based on an option. The function is called with the following arguments: 

- `model`: the model to which the mixin must be applied
- `collection`: the collection to which the model has been added
- `options`: the options which would normally be passed to `Backbone.Select.Me.applyTo()`.

By default, `Backbone.Select.Me.custom.applyModelMixin` is undefined, and the standard `Select.Me` mixin is used. The setting is global. If you change it, the function will be applied throughout your entire application.

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] sets up the environment for you.

- The only thing you've got to have on your machine (besides Git) is [Node.js]. Download the installer [here][Node.js].
- Clone the project and open a command prompt in the project directory.
- Run the setup with `npm run setup`.
- Make sure the Grunt CLI is installed as a global Node module. If not, or if you are not sure, run `npm install -g grunt-cli` from the command prompt.

Your test and build environment is ready now. If you want to test against specific versions of Backbone, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Jasmine][] (test framework). But you don't really need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- If the live reload bothers you, you can also run the tests in a browser without it: `grunt webtest`.
- Run the linter only with `grunt lint` or `grunt hint`. (The linter is part of `grunt test` as well.)
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies – in the project-wide `bower.json` – or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Release notes

### v2.1.0

- Added `@bbs:wasSelected` to the options of the `@bbs:remove:silent` event
- Added the `Backbone.Select.Me.custom.applyModelMixin` configuration setting

### v2.0.0

Changes:

- Removed the separate AMD/Node builds in `dist/amd`. Module systems and browser globals are now supported by the same file, `dist/backbone.select.js` (or `.min.js`)
- Removed the `enableModelSharing` option. Model sharing is always enabled now. Remember to call `.close()` when you no longer use a collection.
- Removed the `_modelSharingEnabled` flag
- Renamed the `_silentLocally` flag to `@bbs:silentLocally`

Other:

- No more restrictions on using the `silent` option when calling `add()`, `remove()` or `reset()` on a collection. Use `silent` as you please.
- Collections are able to process the full set of input types during instantiation, and when calling `add()`, `set()`, and `reset()`. Select.One and Select.Many collections now accept attribute hashes, raw model data requiring `options.parse`, and models without the Select.Me mixin applied. Previously, only Select.Me models have been accepted.
- Added events `@bbs:add:silent`, `@bbs:remove:silent` and `@bbs:reset:silent`, notifying other components, like [Backbone.Cycle][], of silent additions, removals, and resets.
- Prefixed all internal events and flags with `@bbs:`, as additional protection against naming collisions with user-defined events and option names. (NB The public `_externalEvent` property on the event options object remains unprefixed.)

### v1.5.5

- Version is exposed in `Backbone.Select.version`
- AMD demo allows testing r.js output

### v1.5.4

- Updated bower.json, package.json for Backbone 1.3.x ([#14][issue-14])

### v1.5.3

- Added `_silentLocally` flag to public API

### v1.5.2

- Made all methods support chaining.
- Allowed `deselect()` to be called without a model argument in a Select.Many collection (acts like `deselectAll()`).

### v1.5.1

- Added `_pickyIgnoredLabels` property to public API

### v1.5.0

- Added `invertSelection()`
- Made events for `selectAll()`, `deselectAll()`, `toggleSelectAll()` fire only after all individual actions are complete.

### v1.4.0

- Introduced support for custom labels, `label` option
- Added event variants which are namespaced according to label
- Added `defaultLabel` setup option, `_pickyDefaultLabel` property
- Added `ignoreLabel` setup option
- Added `exclusive` option to `select()` in Select.Many, Select.Me

### v1.3.1

- Fixed miscalculation of selectedLength in Backbone.Select.Many ([#6][issue-6])
- Updated bower.json, package.json for Backbone 1.2.x ([#7][issue-7])

### v1.3.0

- Fixed compatibility with Underscore 1.7.0
- Switched to plain objects as mixins internally

### v1.2.8

- Enforced strict mode 

### v1.2.7

- Fleshed out package.json for npm installs

### v1.2.5

- Restored access to the `select` method of Backbone.Collection by overloading the `select` method.

### v1.2.4

- Added arguments validation to `applyTo` factory methods.
- Various minor bugs fixed.

### v1.2.0

- Related selections and deselections are treated as a single, atomic transaction. Firing of events is delayed until select and deselect actions have spread across all affected models and collections, without any actions still pending.

### v1.1.2

- Fixed bug when models were added or removed with `reset` (collection was not correctly registered with models)

### v1.1.1

- Relaxed dependency requirements in `bower.json`

### v1.1.0

- Moved build to `dist` directory
- Added `_pickyType` property to identify mixins in a model or collection
- Switched development stack to Bower, Karma, Node web server
- Added demo app, memory-leak test environment in `demo` directory

### v1.0.1

- Removed obsolete Backbone.Picky files from build

### v1.0.0

- Forked Backbone.Picky, renaming the project to Backbone.Select
- Renamed components to Select.Me (former Selectable), Select.One (former SingleSelect), Select.Many (former MultiSelect)
- Added `options._externalEvent`, available when the selection in a collection is altered during an `add` or `remove` action
- Added `applyTo` class methods for setup
- Removed support for creating new Backbone.Select objects solely with the constructor
- Event handlers with standard names are invoked automatically if they exist (`onSelect`, `onDeselect`, `onReselect`, `onSelectNone`, `onSelectSome`, `onSelectAll`)
- Options – including arbitrary, custom ones – are passed on to event handlers
- The collection is also passed to event handlers (single-select collection)
- A "diff" hash is passed to select:- event handlers (multi-select collection)
- New events capture when models are re-selected: `reselected` (model), `reselect:one` (single-select collection), `reselect:any` (multi-select collection)
- Multi-select events no longer fire when `selectAll`, `deselectAll` actions are a no-op (change in spec)
- Added support for sharing models among collections
- Added a `silent` option
- Improved events, now firing when model and collection are in a consistent state (Picky issue #18)
- Added `deselectAll`, while keeping `selectNone` around as an alias
- More comprehensive testing
- Added config file for the Karma test runner

### v0.2.0

- Renamed `SingleSelect` events from "select" and "deselect" to "select:one" and "deselect:one"
- Pass model as argument in select:one / deselect:one events
- Updated the build to use latest grunt and related tools
- Removed reliance on ruby for any part of this project

### v0.1.0

- Added Picky.SingleSelect
- Fleshed out the specs more

### v0.0.1

- Initial release of untested code
- Basic "Selectable" mixin for models
- Basic "MultiSelect" mixin for collections

## Credits, copyright, MIT license

Special credits go to [Derick Bailey][muted-solutions], who created the original version of this component, [Backbone.Picky][]. I have forked it at version 0.2.0. Backbone.Picky is no longer developed; see the [Backbone.Picky Compatibility section][picky-compatibility] if you want to migrate.

Copyright (c) 2014-2025 Michael Heim<br>
Copyright (c) 2013 Derick Bailey, Muted Solutions, LLC

Code in the data provider test helper: (c) 2014 Box, Inc., Apache 2.0 license. [See file][data-provider.js].

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Underscore]: http://underscorejs.org/ "Underscore.js"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Jasmine]: http://jasmine.github.io/ "Jasmine: Behavior-Driven JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[dist-dev]: https://raw.github.com/hashchange/backbone.select/master/dist/backbone.select.js "backbone.select.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.select/master/dist/backbone.select.min.js "backbone.select.min.js"

[issue-6]: https://github.com/hashchange/backbone.select/pull/6 "Backbone.Select, Pull Request #6: select:all not being triggered when expected"
[issue-7]: https://github.com/hashchange/backbone.select/pull/7 "Backbone.Select, Pull Request #7: Update Backbone dependency for compatibility with 1.2.x"
[issue-14]: https://github.com/hashchange/backbone.select/issues/14 "Backbone.Select, Issue #14: Upgrade to BB 1.3.*"

[muted-solutions]: http://mutedsolutions.com/ "Muted Solutions, LLC"
[Backbone.Picky]: https://github.com/derickbailey/backbone.picky#readme "Backbone.Picky"
[Backbone.Cycle]: https://github.com/hashchange/backbone.cycle#readme "Backbone.Cycle"
[Backbone.Cycle-autoselect]: https://github.com/hashchange/backbone.cycle#autoselect-option "autoSelect option – Backbone.Cycle"

[outline]: #outline "Outline"
[intro-example]: #an-introductory-example "An introductory example"
[demos]: #demos "Demos"
[setup]: #dependencies-and-setup "Dependencies and setup"
[Backbone.Select.Me]: #backboneselectme-making-models-selectable
[Backbone.Select.One]: #backboneselectone-a-single-select-collection
[Backbone.Select.Many]: #backboneselectmany-a-multi-select-collection
[model-collection-interaction]: #basic-model-and-collection-interaction
[select.me-init]: #creating-a-selectme-model
[select.me-auto-applied]: #applying-the-selectme-model-mixin-automatically
[select.me-events]: #backboneselectme-events
[select.me-silent]: #silent-option "Select.Me silent option"
[select.me-event-options]: #options-hash "Select.Me event options hash"
[selected-event]: #selected
[deselected-event]: #deselected
[reselected-event]: #reselected
[select.one-init]: #creating-and-closing-a-selectone-collection
[select.one-models-arg]: #models-argument
[select.one-events]: #backboneselectone-events
[select.one-silent]: #silent-option-1 "Select.One silent option"
[select.one-event-options]: #options-hash-1 "Select.One event options hash"
[select:one-event]: #selectone
[deselect:one-event]: #deselectone
[reselect:one-event]: #reselectone
[select.many-init]: #creating-and-closing-a-selectmany-collection
[option-exclusive]: #the-exclusive-option "The `exclusive` option"
[select.many-events]: #backboneselectmany-events
[select.many-silent]: #silent-option-2 "Select.Many silent option"
[diff-hash]: #diff-hash "Diff hash"
[select.many-event-options]: #options-hash-2 "Select.Many event options hash"
[select:all-event]: #selectall
[select:none-event]: #selectnone
[select:some-event]: #selectsome
[reselect:any-event]: #reselectany
[guidelines]: #guidelines
[close-collection]: #call-close-when-discarding-a-collection
[interaction-guidelines]: #interaction-of-collections-and-models
[event-guidelines]: #events
[external-event]: #events
[custom-labels]: #custom-labels "Custom labels"
[label-event-args]: #event-handler-arguments-label-property "Event handler arguments: `label` property"
[default-label]: #the-defaultlabel-setup-option "The `defaultLabel` setup option"
[default-label-explicit-select.me]: #with-a-defaultlabel-apply-selectme-mixins-to-models-explicitly "With a `defaultLabel`, apply Select.Me mixins to models explicitly"
[ignore-label]: #the-ignorelabel-setup-option "The `ignoreLabel` setup option"
[custom-options]: #custom-options
[select-compatibility]: #compatibility-with-backbones-own-select-method
[picky-compatibility]: #compatibility-with-backbonepicky
[build]: #build-process-and-tests "Build process and tests"
[data-provider.js]: https://github.com/hashchange/backbone.select/blob/master/spec/helpers/data-provider.js "Source code of data-provider.js"

[demo-basic-jsbin]: http://jsbin.com/xosepu/4/edit?js,output "Backbone.Select: Basic demo, with model sharing (AMD) – JSBin"
[demo-basic-codepen]: http://codepen.io/hashchange/pen/yNdbgR "Backbone.Select: Basic demo, with model sharing (AMD) – Codepen"
[demo-label-select.one-jsbin]: http://jsbin.com/xetuva/2/edit?js,output "Backbone.Select: Custom label demo for a Select.One collection"
[demo-label-select.one-codepen]: http://codepen.io/hashchange/pen/BoWLKP "Backbone.Select: Custom label demo for a Select.One collection"
[demo-label-select.many-jsbin]: http://jsbin.com/pobezu/3/edit?js,output "Backbone.Select: Custom label demo for a Select.Many collection (AMD)"
[demo-label-select.many-codepen]: http://codepen.io/hashchange/pen/epvzMx "Backbone.Select: Custom label demo for a Select.Many collection (AMD)"
[demo-focus-with-label-jsbin]: http://jsbin.com/soduyi/2/edit?js,output "Backbone.Select: Focusing on one selected item in a Select.Many collection, using custom labels (AMD)"
[demo-focus-with-label-codepen]: http://codepen.io/hashchange/pen/wKJzWE "Backbone.Select: Focusing on one selected item in a Select.Many collection, using custom labels (AMD)"
[demo-focus-with-exclusive-jsbin]: http://jsbin.com/colulo/3/edit?js,output "Backbone.Select: Focusing on one selected item in a Select.Many collection, using the `exclusive` option (AMD)"
[demo-focus-with-exclusive-codepen]: http://codepen.io/hashchange/pen/QjpKGo "Backbone.Select: Focusing on one selected item in a Select.Many collection, using the `exclusive` option (AMD)"

[license]: #credits-copyright-mit-license "Credits, copyright, MIT license"
[hashchange-projects-overview]: http://hashchange.github.io/ "Hacking the front end: Backbone, Marionette, jQuery and the DOM. An overview of open-source projects by @hashchange."