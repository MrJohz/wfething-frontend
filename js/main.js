(function(window) {

    /** ERROR LISTS & OTHER CONSTANTS **/
    var ERRORS_UNKNOWN_REGION = [
        "Looking for regions like that could land you in a lot of trouble, y'know...",
        "The WFE of this region has been classified under secion 709 of the Very Important Business Act.",
        "This WFE isn't available, but in the meantime, we invite you to listen to this calming music.",
        "This region would prefer you to think of it less as a 'nonexistant' region, and more as a 'yet-to-exist' region.",
        "This region doesn't exist.  Pl-HELP I'VE BEEN TRAPPED IN AN ERROR-MESSAGE-MAKING FACTORY!-ease try again.",
        "Searching for regions that don't even exist?  What visionary work!  Have you ever thought about applying to be Chief of Printing?",
        "Hey, I just met you, and this is crazy, but here's my number, so call me, maybe? Oh, wait, you can't. Because I misspelt my number, like you misspelt that region.  (With all due respect to Solm!)"
    ];

    var ERRORS_UNKNOWN_ERROR_MESSAGE = [
        "An error happened.  Hold on while we try to work out what error it was.",
        "There was an error.  Then, when we tried to work out what the error was, we got another error.  Rest assured that the codemonkeys are all fired.",
        "You should never see this, therefore it should be safe to say that I never liked Johz anyway, he was a terrible Lieutenant...",
        "You've made such an amazing error that we can't even tell what it was!  That's so impressive!  Have you ever thought about applying to be Chief of Printing?"
    ];
    
    var BASEURL = "http://wfe2.johz.me/"



    /** USEFUL FUNCTIONS **/

    var NOOP = function() {}

    var simple = function(s) {
        return s.toLowerCase().replace(/ /g, '_')
    }

    var choose = function(choices) {
        var index = Math.floor(Math.random() * choices.length);
        return choices[index];
    }

    var getRandomErrorMessage = function(errorCode) {
        switch(errorCode) {
            case 0:
                return choose(ERRORS_UNKNOWN_REGION);
            default:
                return choose(ERRORS_UNKNOWN_ERROR_MESSAGE);
        }
    }

    function fadeOut(element, func) {
        if (typeof func === "undefined") {
            func = NOOP;
        }

        var op = 1;  // initial opacity
        var timer = setInterval(function () {
            if (op <= 0.1){
                clearInterval(timer);
                element.style.display = 'none';
                func.call(element);
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, 50);
    }

    function fadeIn(element, func) {
        if (typeof func === "undefined") {
            func = NOOP;
        }

        var op = 0.1;  // initial opacity
        var hasNulled = true;
        var timer = setInterval(function () {
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";

            if (hasNulled && op > 0.1 ){
                element.style.display = null;
                hasNulled = false;
            } else if (op >= 0.9) {
                clearInterval(timer);
                func.call(element);
            }
            op += op * 0.1;
        }, 25);
    }
    
    function domFromString(s) {
        var div = document.createElement('div');
        div.innerHTML = s.trim();
        return div.firstChild;
    }

    function htmlDecode(input){
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }



    /** ACCORDIONATOR: HELPS CREATE ACCORDIONS **/

    function Accordionator() {
        this.elems = [];
    }

    Accordionator.prototype.add = function(elem) {
        this.elems.push(this.accordionate(elem));
    }

    Accordionator.prototype.accordionate = function(element) {
        var h2;

        for ( var i = 0; i < element.childNodes.length; i++ ) {
            if ( element.childNodes[i].nodeName == "H3" ) {
                h2 = element.childNodes[i];
            }
        }

        h2.addEventListener('click', (function(e) {
            var itemClass = this.parentNode.className;
            this.elems.forEach(function(elem) {
                elem.className = "accordion-item hide";
            })
            if (itemClass == "accordion-item hide") {
                this.parentNode.className = 'accordion-item'
            }
        }).bind(this));

        return element;
    }

    Accordionator.prototype.init = function() {
        for ( var i = 1; i < this.elems.length; i++ ) {
            this.elems[i].className = 'accordionItem hide';
        }
    }



    /** WFETHING: MAIN APP CLASS **/

    function WFEThing() {

        this.cache = new Map();
        this.curRegion = new Observable({}, this);
        this.errors = new ObservableArray([], this);

    };

    WFEThing.prototype.getRegion = function(name) {
        name = simple(name);
        if (this.cache.has(name)) {
            this.curRegion.set(this.cache.get(name));
        }

        microAjax(BASEURL + "api/" + name, (function(res) {
            jsn = JSON.parse(res);
            this.cache.set(name, jsn);
            this.curRegion.set(jsn);
        }).bind(this))
    };

    window.app = new WFEThing();



    /** HANDLERS **/

    document.getElementById('region-submit').addEventListener("click", function(e) {
        if (!e) {var e = window.event; }
        e.preventDefault();

        var regionName = document.getElementById('region-input').value
        if (regionName && regionName.length > 0) {
            var elem = document.getElementById('region-input');
            app.getRegion(elem.value);
            elem.value = ''
        }
        return false;
    }, false);

    document.getElementById("region-input").addEventListener("keydown", function(e) {
        if (!e) { var e = window.event; }
        if (e.keyCode == 13) {
            e.preventDefault();
            app.getRegion(this.value);
            this.value = '';
        }
    }, false);

    app.curRegion.handler(function(operation, newRegion, oldRegion) {
        if (typeof newRegion.name == "undefined" || newRegion.name == null) {
            this.errors.push({
                errorname: "Unknown Region",
                errorcode: 0,
                errortext: getRandomErrorMessage(0)
            })
        }

        newRegion.data.forEach(function(wfeObj, index, array) {
            /* We should probably fix this on the server-upload script, but for now... */
            wfeObj.wfe = wfeObj.wfe.replace(/&amp;/g, "&");
            wfeObj.dateStr = moment.unix(wfeObj.date).format("D/M/YYYY")
        })

        acc = new Accordionator();

        document.getElementById("results-header").innerHTML = newRegion.name;
        var results = document.getElementById("results");
        acc.add(domFromString(Handlebars.templates.results(newRegion)));
        results.innerHTML = "";
        acc.elems.forEach(function(elem) {
            results.appendChild(elem);
        })
    })

    app.errors.handler("push", function(addition, newErrorList, oldErrorList) {
        var errorDiv = document.getElementById("errors")
        var message = domFromString(Handlebars.templates.errors({error: addition}));
        message.style.display = "none";
        errorDiv.insertBefore(message, errorDiv.firstChild);
        fadeIn(message);

        setTimeout(function() {
            fadeOut(message, function() {
                errorDiv.removeChild(message);
            })
        }, 5000)
    })

})(window);