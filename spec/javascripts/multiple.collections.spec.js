describe("models shared between multiple collections", function(){

  var Model = Backbone.Model.extend({
    initialize: function(){
      Backbone.Select.Selectable.applyTo(this);
    }
  });

  var SingleSelectCollection = Backbone.Collection.extend({
    model: Model,

    initialize: function(models){
      Backbone.Select.SingleSelect.applyTo(this, models);
    }
  });

  var MultiSelectCollection = Backbone.Collection.extend({
    model: Model,

    initialize: function(models){
      Backbone.Select.MultiSelect.applyTo(this, models);
    }
  });


  describe("when selecting a model in a single-select collection", function(){
    var model, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      singleCollectionB = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.select(model);
    });

    it("should be selected in the originating collection", function(){
      expect(singleCollectionA.selected).toBe(model);
    });

    it("should be selected in another single-select collection", function(){
      expect(singleCollectionB.selected).toBe(model);
    });

    it("should be among the selected models in another multi-select collection", function(){
      expect(multiCollectionA.selected[model.cid]).not.toBeUndefined();
    });

    it("should be selected itself", function(){
      expect(model.selected).toBe(true);
    });

    it('should trigger a selected event on the model', function () {
      expect(model.trigger).toHaveBeenCalledWithInitial("selected", model);
    });

    it('should trigger a select:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model, singleCollectionA);
    });

    it('should trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).toHaveBeenCalledWithInitial("select:one", model, singleCollectionB);
    });

    it('should trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model], deselected: [] }, multiCollectionA);
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:one event on the originating collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on another multi-select collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when selecting a model in a single-select collection, with options.silent enabled", function(){
    var model, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      singleCollectionB = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.select(model, {silent: true});
    });

    it("should be selected in another single-select collection", function(){
      expect(singleCollectionB.selected).toBe(model);
    });

    it("should be among the selected models in another multi-select collection", function(){
      expect(multiCollectionA.selected[model.cid]).not.toBeUndefined();
    });

    it('should not trigger a selected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });
  });

  describe("when selecting a model in a multi-select collection", function(){
    var model, singleCollectionA, multiCollectionA, multiCollectionB;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);
      multiCollectionB  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionB, "trigger").andCallThrough();

      multiCollectionA.select(model);
    });

    it("should be selected in the originating collection", function(){
      expect(multiCollectionA.selected[model.cid]).not.toBeUndefined();
    });

    it("should be selected in another single-select collection", function(){
      expect(singleCollectionA.selected).toBe(model);
    });

    it("should be among the selected models in another multi-select collection", function(){
      expect(multiCollectionB.selected[model.cid]).not.toBeUndefined();
    });

    it("should be selected itself", function(){
      expect(model.selected).toBe(true);
    });

    it('should trigger a selected event on the model', function () {
      expect(model.trigger).toHaveBeenCalledWithInitial("selected", model);
    });

    it('should trigger a select:some or selected:all event on the originating collection', function () {
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model], deselected: [] }, multiCollectionA);
    });

    it('should trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model, singleCollectionA);
    });

    it('should trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionB.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model], deselected: [] }, multiCollectionB);
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:any event on the originating collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });

    it("should not trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on another multi-select collection", function(){
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when selecting a model in a multi-select collection, with options.silent enabled", function(){
    var model, singleCollectionA, multiCollectionA, multiCollectionB;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);
      multiCollectionB  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionB, "trigger").andCallThrough();

      multiCollectionA.select(model, {silent: true});
    });

    it("should be selected in another single-select collection", function(){
      expect(singleCollectionA.selected).toBe(model);
    });

    it("should be among the selected models in another multi-select collection", function(){
      expect(multiCollectionB.selected[model.cid]).not.toBeUndefined();
    });

    it('should not trigger a selected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:some or selected:all event on the originating collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });
  });

  describe("when selecting a model, which is shared across collections, with its select method", function(){
    var model, singleCollectionA, multiCollectionA;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      model.select();
    });

    it("should be selected in a single-select collection", function(){
      expect(singleCollectionA.selected).toBe(model);
    });

    it("should be among the selected models in a multi-select collection", function(){
      expect(multiCollectionA.selected[model.cid]).not.toBeUndefined();
    });

    it("should be selected itself", function(){
      expect(model.selected).toBe(true);
    });

    it('should trigger a selected event on the model', function () {
      expect(model.trigger).toHaveBeenCalledWithInitial("selected", model);
    });

    it('should trigger a select:one event on the single-select collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model, singleCollectionA);
    });

    it('should trigger a select:some or selected:all event on the multi-select collection', function () {
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model], deselected: [] }, multiCollectionA);
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:one event on the single-select collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on the multi-select collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when selecting a model, which is shared across collections, with its select method and options.silent enabled", function(){
    var model, singleCollectionA, multiCollectionA;

    beforeEach(function(){
      model = new Model();
      singleCollectionA = new SingleSelectCollection([model]);
      multiCollectionA  = new MultiSelectCollection([model]);

      spyOn(model, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      model.select({silent: true});
    });

    it("should be selected in a single-select collection", function(){
      expect(singleCollectionA.selected).toBe(model);
    });

    it("should be among the selected models in a multi-select collection", function(){
      expect(multiCollectionA.selected[model.cid]).not.toBeUndefined();
    });

    it('should not trigger a selected event on the model', function () {
      expect(model.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on the multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });
  });

  describe("when re-selecting a model in a single-select collection", function(){
    var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1]);
      singleCollectionB = new SingleSelectCollection([model1]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      multiCollectionA.select(model2);
      multiCollectionA.select(model1);


      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.select(model1);
    });

    it("should not deselect other selected models in a multi-select collection", function(){
      expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should trigger a reselected event on the model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("reselected", model1);
    });

    it("should trigger a reselect:one event on the originating collection", function(){
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:one", model1, singleCollectionA);
    });

    it("should trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionB.trigger).toHaveBeenCalledWithInitial("reselect:one", model1, singleCollectionB);
    });

    it("should trigger a reselect:any event on another multi-select collection, with an array containing the model as second parameter", function(){
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:any", [model1], multiCollectionA);
    });
  });

  describe("when re-selecting a model in a single-select collection, with options.silent enabled", function(){
    var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2= new Model();
      singleCollectionA = new SingleSelectCollection([model1, model2]);
      singleCollectionB = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      singleCollectionA.select(model1);

      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.select(model1, {silent: true});
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:one event on the originating collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on another multi-select collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when re-selecting a model in a multi-select collection", function(){
    var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);
      multiCollectionB  = new MultiSelectCollection([model1, model2]);

      multiCollectionA.select(model1);

      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionB, "trigger").andCallThrough();

      multiCollectionA.select(model1);
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:some or selected:all event on the originating collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should trigger a reselected event on the model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("reselected", model1);
    });

    it("should trigger a reselect:any event on the originating collection, with an array containing the model as second parameter", function(){
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:any", [model1], multiCollectionA);
    });

    it("should trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:one", model1, singleCollectionA);
    });

    it("should trigger a reselect:any event on another multi-select collection, with an array containing the model as second parameter", function(){
      expect(multiCollectionB.trigger).toHaveBeenCalledWithInitial("reselect:any", [model1], multiCollectionB);
    });
  });

  describe("when re-selecting a model in a multi-select collection, with options.silent enabled", function(){
    var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);
      multiCollectionB  = new MultiSelectCollection([model1, model2]);

      multiCollectionA.select(model1);

      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionB, "trigger").andCallThrough();

      multiCollectionA.select(model1, {silent: true});
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:some or selected:all event on the originating collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on another multi-select collection', function () {
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:any event on the originating collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });

    it("should not trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on another multi-select collection", function(){
      expect(multiCollectionB.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when re-selecting a model, which is shared across collections, with its select method", function(){
    var model1, model2, singleCollectionA, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      model1.select();

      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      model1.select();
    });

    it("should remain selected in a single-select collection", function(){
      expect(singleCollectionA.selected).toBe(model1);
    });

    it("should remain among the selected models in a multi-select collection", function(){
      expect(multiCollectionA.selected[model1.cid]).not.toBeUndefined();
    });

    it("should remain selected itself", function(){
      expect(model1.selected).toBe(true);
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on the multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should trigger a reselected event on the model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("reselected", model1);
    });

    it("should trigger a reselect:one event on the single-select collection", function(){
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:one", model1, singleCollectionA);
    });

    it("should trigger a reselect:any event on the multi-select collection, with an array containing the model as second parameter", function(){
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("reselect:any", [model1], multiCollectionA);
    });
  });

  describe("when re-selecting a model, which is shared across collections, with its select method and options.silent enabled", function(){
    var model1, model2, singleCollectionA, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      model1.select();

      spyOn(model1, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      model1.select({silent: true});
    });

    it('should not trigger a selected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
    });

    it('should not trigger a select:one event on the single-select collection', function () {
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
    });

    it('should not trigger a select:some or selected:all event on the multi-select collection', function () {
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:some");
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:all");
    });

    it('should not trigger a reselected event on the model', function () {
      expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:one event on the single-select collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on the multi-select collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when a model is already selected and a different model is selected in a single-select collection", function(){
    var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();

      singleCollectionA = new SingleSelectCollection([model1, model2]);
      singleCollectionB = new SingleSelectCollection([model1, model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      model1.select();

      spyOn(model1, "trigger").andCallThrough();
      spyOn(model2, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.select(model2);
    });

    it("should be selected in the originating collection", function(){
      expect(singleCollectionA.selected).toBe(model2);
    });

    it("should be selected in another single-select collection", function(){
      expect(singleCollectionB.selected).toBe(model2);
    });

    it("should be selected in another multi-select collection", function(){
      expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
    });

    it("should be selected itself", function(){
      expect(model2.selected).toBe(true);
    });

    it("should deselect the first model", function(){
      expect(model1.selected).toBe(false);
    });

    it("should deselect the first model in another multi-select collection", function(){
      expect(multiCollectionA.selected[model1.cid]).toBeUndefined();
    });

    it('should trigger a selected event on the selected model', function () {
      expect(model2.trigger).toHaveBeenCalledWithInitial("selected", model2);
    });

    it('should trigger a deselected event on the first model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("deselected", model1);
    });

    it('should trigger a deselect:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionA);
    });

    it('should trigger a select:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model2, singleCollectionA);
    });

    it('should trigger a deselect:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionB);
    });

    it('should trigger a select:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).toHaveBeenCalledWithInitial("select:one", model2, singleCollectionB);
    });

    it('should trigger a select:none and a select:some event on another multi-select collection', function () {
      // The process is made up of two steps, which are independent in an
      // observing collection. First, the previous model is deselected, then the
      // new one selected. Hence two events, rather than a single `select:some`
      // event with a unified diff of `{ selected: [model2], deselected: [model1] }`,
      // as one might have expected.
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:none", { selected: [], deselected: [model1] }, multiCollectionA);
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:some", { selected: [model2], deselected: [] }, multiCollectionA);
    });

    it('should not trigger a reselected event on the selected model', function () {
      expect(model2.trigger).not.toHaveBeenCalledWithInitial("reselected");
    });

    it("should not trigger a reselect:one event on the originating collection", function(){
      expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:one event on another single-select collection", function(){
      expect(singleCollectionB.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
    });

    it("should not trigger a reselect:any event on another multi-select collection", function(){
      expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
    });
  });

  describe("when a model is already selected and a different model is selected with its select method", function(){

    describe("when both models are shared among multi-select collections only", function() {
      var model1, model2, multiCollectionA, multiCollectionB;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();

        multiCollectionA  = new MultiSelectCollection([model1, model2]);
        multiCollectionB  = new MultiSelectCollection([model1, model2]);

        model1.select();

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        model2.select();
      });

     it("should be selected in all collections", function(){
       expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
       expect(multiCollectionB.selected[model2.cid]).not.toBeUndefined();
     });

     it("should leave the first model selected in all collections", function(){
       expect(multiCollectionA.selected[model1.cid]).not.toBeUndefined();
       expect(multiCollectionB.selected[model1.cid]).not.toBeUndefined();
     });

      it('should not trigger a selected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
      });

      it('should not trigger a deselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("deselected");
      });

      it('should trigger a selected event on the second model', function () {
        expect(model2.trigger).toHaveBeenCalledWithInitial("selected", model2);
      });

      it('should trigger a select:some or selected:all event on a multi-select collection', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model2], deselected: [] }, multiCollectionA);
      });

      it('should not trigger a reselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected", model1);
      });

      it('should not trigger a reselected event on the second model', function () {
        expect(model2.trigger).not.toHaveBeenCalledWithInitial("reselected", model2);
      });

      it("should not trigger a reselect:any event on a multi-select collection", function(){
        expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
      });
    });

    describe("when both models are shared, with at least one single-select collection among the collections", function() {
      // As soon as both models are part of a single-select collection, only one of them can be flagged as selected.
      // That even extends to multi-select collections sharing those models.
      var model1, model2, singleCollectionA, multiCollectionA;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();

        singleCollectionA = new SingleSelectCollection([model1, model2]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);

        model1.select();

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        model2.select();
      });

      it("should be selected in the single-select collection", function(){
        expect(singleCollectionA.selected).toBe(model2);
      });

      it("should be selected in the multi-select collection", function(){
        expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
      });

      it("should deselect the first model", function(){
        expect(model1.selected).toBe(false);
      });

      it("should deselect the first model in the multi-select collection", function(){
        expect(multiCollectionA.selected[model1.cid]).toBeUndefined();
      });

      it('should not trigger a selected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
      });

      it('should trigger a deselected event on the first model', function () {
        expect(model1.trigger).toHaveBeenCalledWithInitial("deselected", model1);
      });

      it('should trigger a selected event on the second model', function () {
        expect(model2.trigger).toHaveBeenCalledWithInitial("selected", model2);
      });

      it('should trigger a deselect:one event on the single-select collection', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionA);
      });

      it('should trigger a select:one event on the single-select collection', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model2, singleCollectionA);
      });

      it('should trigger a select:none and a select:some event on the multi-select collection', function () {
        // The process is made up of two steps, which are independent in an
        // observing collection. First, the previous model is deselected, then the
        // new one selected. Hence two events, rather than a single `select:some`
        // event with a unified diff of `{ selected: [model2], deselected: [model1] }`,
        // as one might have expected.
        expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:none", { selected: [], deselected: [model1] }, multiCollectionA);
        expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:some", { selected: [model2], deselected: [] }, multiCollectionA);
      });

      it('should not trigger a reselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected", model1);
      });

      it('should not trigger a reselected event on the second model', function () {
        expect(model2.trigger).not.toHaveBeenCalledWithInitial("reselected", model2);
      });

     it("should not trigger a reselect:one event on the single-select collection", function(){
        expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
      });

      it("should not trigger a reselect:any event on the multi-select collection", function(){
        expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
      });
    });

    describe("when the first model is shared with at least one single-select collection, but not the second", function() {
      var model1, model2, singleCollectionA, multiCollectionA;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();

        singleCollectionA = new SingleSelectCollection([model1]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);

        model1.select();

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        model2.select();
      });

      it("should be selected itself", function(){
        expect(model2.selected).toBe(true);
      });

      it("should be selected in the multi-select collection", function(){
        expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
      });

      it("should leave the first model selected", function(){
        expect(model1.selected).toBe(true);
      });

      it("should leave the first model selected in the single-select collection", function(){
        expect(singleCollectionA.selected).toBe(model1);
      });

      it("should leave the first model selected in the multi-select collection", function(){
        expect(multiCollectionA.selected[model1.cid]).not.toBeUndefined();
      });

      it('should not trigger a selected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
      });

      it('should not trigger a deselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("deselected");
      });

      it('should trigger a selected event on the second model', function () {
        expect(model2.trigger).toHaveBeenCalledWithInitial("selected", model2);
      });

      it('should not trigger a deselect:one event on the single-select collection', function () {
        expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("deselect:one");
      });

      it('should not trigger a select:one event on the single-select collection', function () {
        expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("select:one");
      });

      it('should trigger a select:some or select:all event on the multi-select collection', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model2], deselected: [] }, multiCollectionA);
      });

      it('should not trigger a reselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected");
      });

      it('should not trigger a reselected event on the second model', function () {
        expect(model2.trigger).not.toHaveBeenCalledWithInitial("reselected");
      });

      it("should not trigger a reselect:one event on the single-select collection", function(){
        expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
      });

      it("should not trigger a reselect:any event on the multi-select collection", function(){
        expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
      });
    });

    describe("when the second model is shared with at least one single-select collection, but not the first", function() {

      var model1, model2, singleCollectionA, multiCollectionA;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();

        singleCollectionA = new SingleSelectCollection([model2]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);

        model1.select();

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        model2.select();
      });

      it("should be selected itself", function(){
        expect(model2.selected).toBe(true);
      });

      it("should be selected in the single-select collection", function(){
        expect(singleCollectionA.selected).toBe(model2);
      });

      it("should be selected in the multi-select collection", function(){
        expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
      });

      it("should leave the first model selected", function(){
        expect(model1.selected).toBe(true);
      });

      it("should leave the first model selected in the multi-select collection", function(){
        expect(multiCollectionA.selected[model1.cid]).not.toBeUndefined();
      });

      it('should not trigger a selected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("selected");
      });

      it('should not trigger a deselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("deselected");
      });

      it('should trigger a selected event on the second model', function () {
        expect(model2.trigger).toHaveBeenCalledWithInitial("selected", model2);
      });

      it('should trigger a select:one event on the single-select collection', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("select:one", model2, singleCollectionA);
      });

      it('should trigger a select:some or select:all event on the multi-select collection', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:all", { selected: [model2], deselected: [] }, multiCollectionA);
      });

      it('should not trigger a reselected event on the first model', function () {
        expect(model1.trigger).not.toHaveBeenCalledWithInitial("reselected");
      });

      it('should not trigger a reselected event on the second model', function () {
        expect(model2.trigger).not.toHaveBeenCalledWithInitial("reselected");
      });

      it("should not trigger a reselect:one event on the single-select collection", function(){
        expect(singleCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:one");
      });

      it("should not trigger a reselect:any event on the multi-select collection", function(){
        expect(multiCollectionA.trigger).not.toHaveBeenCalledWithInitial("reselect:any");
      });
    });

  });

  describe("when a model is selected and deselect is called in a single-select collection", function(){
    var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1]);
      singleCollectionB = new SingleSelectCollection([model1]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);

      multiCollectionA.select(model2);
      singleCollectionA.select(model1);

      spyOn(model1, "trigger").andCallThrough();
      spyOn(model2, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(singleCollectionB, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();

      singleCollectionA.deselect();
    });

    it("should be deselected in the originating collection", function(){
      expect(singleCollectionA.selected).toBeUndefined();
    });

    it("should be deselected in another single-select collection", function(){
      expect(singleCollectionB.selected).toBeUndefined();
    });

    it("should be deselected in another multi-select collection", function(){
      expect(multiCollectionA.selected[model1.cid]).toBeUndefined();
    });

    it("should not deselected another selected model in a multi-select collection", function(){
      expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
    });

    it("should be deselected itself", function(){
      expect(model1.selected).toBe(false);
    });

    it('should trigger a deselected event on the model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("deselected", model1);
    });

    it('should not trigger a selected event on another selected model in a multi-select collection', function () {
      expect(model2.trigger).not.toHaveBeenCalledWithInitial("deselected", model2);
    });

    it('should trigger a deselect:one event on the originating collection', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionA);
    });

    it('should trigger a deselect:one event on another single-select collection', function () {
      expect(singleCollectionB.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionB);
    });

    it('should trigger a select:some or selected:none event on another multi-select collection', function () {
      expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:some", { selected: [], deselected: [model1] }, multiCollectionA);
    });
  });

  describe("when a selected model is deselected in a multi-select collection", function(){
    var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA, multiCollectionB;

    beforeEach(function(){
      model1 = new Model();
      model2 = new Model();
      singleCollectionA = new SingleSelectCollection([model1]);
      singleCollectionB = new SingleSelectCollection([model2]);
      multiCollectionA  = new MultiSelectCollection([model1, model2]);
      multiCollectionB  = new MultiSelectCollection([model1, model2]);

      multiCollectionA.select(model2);
      multiCollectionA.select(model1);

      spyOn(model1, "trigger").andCallThrough();
      spyOn(model2, "trigger").andCallThrough();
      spyOn(singleCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionA, "trigger").andCallThrough();
      spyOn(multiCollectionB, "trigger").andCallThrough();

      multiCollectionA.deselect(model1);
    });

    it("should be deselected in the originating collection", function(){
      expect(multiCollectionA.selected[model1.cid]).toBeUndefined();
    });

    it("should be deselected in another single-select collection which shares the model", function(){
      expect(singleCollectionA.selected).toBeUndefined();
    });

    it("should be deselected in another multi-select collection", function(){
      expect(multiCollectionB.selected[model1.cid]).toBeUndefined();
    });

    it("should be deselected itself", function(){
      expect(model1.selected).toBe(false);
    });

    it("should not deselect another selected model in a multi-select collection", function(){
      expect(multiCollectionA.selected[model2.cid]).not.toBeUndefined();
    });

    it("should not deselect another selected model which is shared between a multi-select collection and a single-select collection", function () {
      expect(singleCollectionB.selected).toBe(model2);
    });

    it('should trigger a deselected event on the model', function () {
      expect(model1.trigger).toHaveBeenCalledWithInitial("deselected", model1);
    });

    it('should not trigger a deselected event on another selected model in a multi-select collection', function () {
      expect(model2.trigger).not.toHaveBeenCalledWithInitial("deselected");
    });

     it('should trigger a select:some or select:none event on the originating collection', function () {
       expect(multiCollectionA.trigger).toHaveBeenCalledWithInitial("select:some", { selected: [], deselected: [model1] }, multiCollectionA);
    });

    it('should trigger a deselect:one event on a single-select collection sharing the model', function () {
      expect(singleCollectionA.trigger).toHaveBeenCalledWithInitial("deselect:one", model1, singleCollectionA);
    });

    it('should trigger a select:some or selected:none event on another multi-select collection', function () {
      expect(multiCollectionB.trigger).toHaveBeenCalledWithInitial("select:some", { selected: [], deselected: [model1] }, multiCollectionB);
    });
  });

  describe('custom options', function () {

    describe("when selecting a model in a single-select collection with a custom option", function(){
      var model, singleCollectionA, singleCollectionB, multiCollectionA;

      beforeEach(function(){
        model = new Model();
        singleCollectionA = new SingleSelectCollection([model]);
        singleCollectionB = new SingleSelectCollection([model]);
        multiCollectionA  = new MultiSelectCollection([model]);

        spyOn(model, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(singleCollectionB, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        singleCollectionA.select(model, {foo: "bar"});
      });

      it('should trigger a selected event on the model and pass the options object along as the last parameter', function () {
        expect(model.trigger).toHaveBeenCalledWith("selected", model, {foo: "bar"});
      });

      it('should trigger a select:one event on the originating collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("select:one", model, singleCollectionA,{foo: "bar"});
      });

      it('should trigger a select:one event on another single-select collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionB.trigger).toHaveBeenCalledWith("select:one", model, singleCollectionB, {foo: "bar"});
      });

      it('should trigger a select:some or selected:all event on another multi-select collection and pass the options object along as the last parameter', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("select:all", { selected: [model], deselected: [] }, multiCollectionA, {foo: "bar"});
      });
    });

    describe("when re-selecting a model in a single-select collection with a custom option", function(){
      var model, singleCollectionA, singleCollectionB, multiCollectionA;

      beforeEach(function(){
        model = new Model();
        singleCollectionA = new SingleSelectCollection([model]);
        singleCollectionB = new SingleSelectCollection([model]);
        multiCollectionA  = new MultiSelectCollection([model]);

        model.select();

        spyOn(model, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(singleCollectionB, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        singleCollectionA.select(model, {foo: "bar"});
      });

      it('should trigger a reselected event on the model and pass the options object along as the last parameter', function () {
        expect(model.trigger).toHaveBeenCalledWith("reselected", model, {foo: "bar"});
      });

      it("should trigger a reselect:one event on the originating collection and pass the options object along as the last parameter", function(){
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("reselect:one", model, singleCollectionA, {foo: "bar"});
      });

      it("should trigger a reselect:one event on another single-select collection and pass the options object along as the last parameter", function(){
        expect(singleCollectionB.trigger).toHaveBeenCalledWith("reselect:one", model, singleCollectionB, {foo: "bar"});
      });

      it("should trigger a reselect:any event on another multi-select collection and pass the options object along as the last parameter", function(){
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("reselect:any", [model], multiCollectionA, {foo: "bar"});
      });
    });

    describe("when a model is already selected and a different model is selected in a single-select collection with a custom option", function(){
      var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();

        singleCollectionA = new SingleSelectCollection([model1, model2]);
        singleCollectionB = new SingleSelectCollection([model1, model2]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);

        model1.select();

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(singleCollectionB, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();

        singleCollectionA.select(model2, {foo: "bar"});
      });

      it('should trigger a selected event on the selected model and pass the options object along as the last parameter', function () {
        expect(model2.trigger).toHaveBeenCalledWith("selected", model2, {foo: "bar"});
      });

      it('should trigger a deselected event on the first model and pass the options object along as the last parameter', function () {
        expect(model1.trigger).toHaveBeenCalledWith("deselected", model1, {foo: "bar"});
      });

      it('should trigger a deselect:one event on the originating collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("deselect:one", model1, singleCollectionA, {foo: "bar"});
      });

      it('should trigger a select:one event on the originating collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("select:one", model2, singleCollectionA, {foo: "bar"});
      });

      it('should trigger a deselect:one event on another single-select collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionB.trigger).toHaveBeenCalledWith("deselect:one", model1, singleCollectionB, {foo: "bar"});
      });

      it('should trigger a select:one event on another single-select collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionB.trigger).toHaveBeenCalledWith("select:one", model2, singleCollectionB, {foo: "bar"});
      });

      it('should trigger a select:none and a select:some event on another multi-select collection and pass the options object along as the last parameter', function () {
        // The process is made up of two steps, which are independent in an
        // observing collection. First, the previous model is deselected, then the
        // new one selected. Hence two events, rather than a single `select:some`
        // event with a unified diff of `{ selected: [model2], deselected: [model1] }`,
        // as one might have expected.
        //
        // Both events must pass the options object along.
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("select:none", { selected: [], deselected: [model1] }, multiCollectionA, {foo: "bar"});
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("select:some", { selected: [model2], deselected: [] }, multiCollectionA, {foo: "bar"});
      });
    });

    describe("when selecting a model in a multi-select collection with a custom option", function(){
      var model, singleCollectionA, multiCollectionA, multiCollectionB;

      beforeEach(function(){
        model = new Model();
        singleCollectionA = new SingleSelectCollection([model]);
        multiCollectionA  = new MultiSelectCollection([model]);
        multiCollectionB  = new MultiSelectCollection([model]);

        spyOn(model, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionB, "trigger").andCallThrough();

        multiCollectionA.select(model, {foo: "bar"});
      });

      it('should trigger a selected event on the model and pass the options object along as the last parameter', function () {
        expect(model.trigger).toHaveBeenCalledWith("selected", model, {foo: "bar"});
      });

      it('should trigger a select:some or selected:all event on the originating collection and pass the options object along as the last parameter', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("select:all", { selected: [model], deselected: [] }, multiCollectionA, {foo: "bar"});
      });

      it('should trigger a select:one event on another single-select collection and pass the options object along as the last parameter', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("select:one", model, singleCollectionA, {foo: "bar"});
      });

      it('should trigger a select:some or selected:all event on another multi-select collection and pass the options object along as the last parameter', function () {
        expect(multiCollectionB.trigger).toHaveBeenCalledWith("select:all", { selected: [model], deselected: [] }, multiCollectionB, {foo: "bar"});
      });
    });

    describe("when re-selecting a model in a multi-select collection with a custom option", function(){
      var model1, model2, singleCollectionA, multiCollectionA, multiCollectionB;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();
        singleCollectionA = new SingleSelectCollection([model1, model2]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);
        multiCollectionB  = new MultiSelectCollection([model1, model2]);

        multiCollectionA.select(model1);

        spyOn(model1, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionB, "trigger").andCallThrough();

        multiCollectionA.select(model1, {foo: "bar"});
      });

      it('should trigger a reselected event on the model and pass the options object along as the last parameter', function () {
        expect(model1.trigger).toHaveBeenCalledWith("reselected", model1, {foo: "bar"});
      });

      it("should trigger a reselect:any event on the originating collection and pass the options object along as the last parameter", function(){
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("reselect:any", [model1], multiCollectionA, {foo: "bar"});
      });

      it("should trigger a reselect:one event on another single-select collection and pass the options object along as the last parameter", function(){
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("reselect:one", model1, singleCollectionA, {foo: "bar"});
      });

      it("should trigger a reselect:any event on another multi-select collection and pass the options object along as the last parameter", function(){
        expect(multiCollectionB.trigger).toHaveBeenCalledWith("reselect:any", [model1], multiCollectionB, {foo: "bar"});
      });
    });

    describe("when a selected model is deselected in a multi-select collection with a custom option", function(){
      var model1, model2, singleCollectionA, singleCollectionB, multiCollectionA, multiCollectionB;

      beforeEach(function(){
        model1 = new Model();
        model2 = new Model();
        singleCollectionA = new SingleSelectCollection([model1]);
        singleCollectionB = new SingleSelectCollection([model2]);
        multiCollectionA  = new MultiSelectCollection([model1, model2]);
        multiCollectionB  = new MultiSelectCollection([model1, model2]);

        multiCollectionA.select(model2);
        multiCollectionA.select(model1);

        spyOn(model1, "trigger").andCallThrough();
        spyOn(model2, "trigger").andCallThrough();
        spyOn(singleCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionA, "trigger").andCallThrough();
        spyOn(multiCollectionB, "trigger").andCallThrough();

        multiCollectionA.deselect(model1, {foo: "bar"});
      });

      it('should trigger a deselected event on the model and pass the options object along as the last parameter', function () {
        expect(model1.trigger).toHaveBeenCalledWith("deselected", model1, {foo: "bar"});
      });

      it('should trigger a select:some or select:none event on the originating collection and pass the options object along as the last parameter', function () {
        expect(multiCollectionA.trigger).toHaveBeenCalledWith("select:some", { selected: [], deselected: [model1] }, multiCollectionA, {foo: "bar"});
      });

      it('should trigger a deselect:one event on a single-select collection sharing the model and pass the options object along as the last parameter', function () {
        expect(singleCollectionA.trigger).toHaveBeenCalledWith("deselect:one", model1, singleCollectionA, {foo: "bar"});
      });

      it('should trigger a select:some or selected:none event on another multi-select collection and pass the options object along as the last parameter', function () {
        expect(multiCollectionB.trigger).toHaveBeenCalledWith("select:some", { selected: [], deselected: [model1] }, multiCollectionB, {foo: "bar"});
      });
    });

  });

});
