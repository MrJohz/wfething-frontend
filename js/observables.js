(function(window) {

    var SENTINAL = {};


    function HandlerKey(type, index) {
        this.type = type;
        this.index = index;
    }

    function InvalidHandlerKeyException(handlerKey) {
        this.message = "Unrecognised handler key: " + SENTINAL.toString.call(handlerKey);
        this.handlerKey = handlerKey;
        this.name = "InvalidHandlerKeyException";
    }

    function Observable(initialValue, context) {
        if (typeof context === "undefined") {
            context = null;
        }

        this.value = initialValue;
        this.context = context;
        this.handlers = {"*": []};
    };

    Observable.prototype._callHandlers = function(type, args) {
        var c = this.context;

        typeHandlerSet = this.handlers[type];
        geneHandlerSet = this.handlers["*"];

        if (typeof typeHandlerSet !== "undefined") {
            typeHandlerSet.forEach(function(handlr) {
                handlr.apply(c, args);
            })
        }

        args.unshift(type);

        geneHandlerSet.forEach(function(handlr) {
            handlr.apply(c, args);
        })
    }

    Observable.prototype.set = function(value) {
        var oldVal = this.value;
        this.value = value;
        this._callHandlers("set", [value, oldVal]);
    }

    Observable.prototype.get = function() {
        return this.value;
    }

    Observable.prototype.handler = function(type, func) {
        if (type instanceof Function) {
            return this.handler('*', type);
        }

        if (typeof this.handlers[type] === "undefined") {
            this.handlers[type] = [];
        }

        var handlerSet = this.handlers[type];

        handlerSet.push(func);
        return new HandlerKey(type, handlerSet.length - 1);
    }

    Observable.prototype.unhandler = function(handlerKey) {
        if (!(handlerKey instanceof HandlerKey)) {
            throw new InvalidHandlerKeyException(handlerKey);
        }

        handlerSet = handlers[handlerKey.type];

        if (typeof handlerSet == "undefined" || handlerType.index < 0 || handlerType.index >= handletSet.length) {
            throw new InvalidHandlerKeyException(handlerKey);
        }

        handlerSet[handlerType.index] = undefined;
    }

    function ObservableArray(initialValues, context) {
        this.value = initialValues;
        this.context = context;
    }

    ObservableArray.prototype = new Observable;

    ObservableArray.prototype.push = function(value) {
        var old = this.value.slice(0);
        this.value.push(value);
        this._callHandlers("push", [value, this.value, old]);
    }

    ObservableArray.prototype.unshift = function(value) {
        var old = this.value.slice(0);
        this.value.unshift(value);
        this._callHandlers("unshift", [value, this.value, old]);
    }

    ObservableArray.prototype.pop = function() {
        var old = this.value.slice(0);
        var ret = this.value.pop();
        this._callHandlers("pop", [this.value, old]);
        return ret;
    }

    ObservableArray.prototype.shift = function() {
        var old = this.value.slice(0);
        var ret = this.value.shift();
        this._callHandlers("shift", [this.value, old]);
        return ret;
    }

    window.Observable = Observable;
    window.ObservableArray = ObservableArray;

})(window)