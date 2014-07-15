(function(window) {

    "use strict";

    if ("Map" in window) {
        console.log("Using ES6 Map implementation");
    } else {
        window.Map = blitz.Map;
        console.log("Using Blitz Map implementation");
    }


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

    var ERRORS_UNKNOWN_SERVER = [
        "Erm.  So something broke somewhere.  It's probably fine, but for now, I'd recommend preparing for nuclear holocaust.",
        "The system has detected that you are a secret raider spy.  The system is always right.  All hail the system.",
        "The server's down!  The server's down!  For the love of God, will somebody do something?  (Think of the children!)",
        "This error is in no way a codi\"<&amp;#92ERROR);DROP TABLE wfes;",
        "Look, don't blame me.  It wasn't my fault.  I just built the thing.  You can't expect me to make sure it runs as well!",
        "I blame the Canadian moose."
    ];

    var ERRORS_UNKNOWN_CONNECTION = [
        "Using the internet when there's no internet?  Genius!  That approach to life is ideal in a Chief of Printing - have you ever thought about applying?",
        "The internet is not currently available.",
        "Please ask Bill Gates to switch the internet back on.",
        "I blame the Canadian moose."
    ]

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
            case 1:
                return choose(ERRORS_UNKNOWN_SERVER);
            case 2:
                return choose(ERRORS_UNKNOWN_CONNECTION);
            default:
                return choose(ERRORS_UNKNOWN_ERROR_MESSAGE);
        }
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

    function stringToColour(str) {

        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

        // int/hash to hex
        for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

        return colour;
    }

    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }


    /** SETUP ENVIRONMENT **/

    Handlebars.registerHelper("colorme", function(wfe) {
        var color = stringToColour(wfe);

        var str = '<span style="color:' + color + '">&#9673;</span>';

        return new Handlebars.SafeString(str)
    })


    /** ACCORDIONATOR: HELPS CREATE ACCORDIONS **/

    function Accordionator() {
        this.elems = [];
    }

    Accordionator.prototype.add = function(elem) {
        this.elems.push(this.accordionate(elem));
    }

    Accordionator.prototype.accordionate = function(element) {
        var h2;
        var self = this;

        for ( var i = 0; i < element.childNodes.length; i++ ) {
            if ( element.childNodes[i].nodeName == "H3" ) {
                h2 = element.childNodes[i];
            }
        }

        h2.addEventListener('click', function(e) {
            var itemClass = this.parentNode.className;
            self.elems.forEach(function(elem) {
                elem.className = "accordion-item hide";
            })
            if (itemClass == "accordion-item hide") {
                this.parentNode.className = 'accordion-item'
            }
        });

        return element;
    }

    Accordionator.prototype.init = function() {
        for ( var i = 0; i < this.elems.length; i++ ) {
            this.elems[i].className = 'accordion-item hide';
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
            return;
        }

        majaX({
            url: BASEURL + "api/" + name,
            method: "get",
            json: true
        },
        (function(res) {
            this.cache.set(name, res);
            this.curRegion.set(res);
        }).bind(this),
        (function(res, ajax) {
            if (ajax.status == 502) {
                this.errors.push({
                    errorname: "Server Down",
                    errorcode: 1,
                    errortext: getRandomErrorMessage(1)
                })
            } else {
                this.errors.push({
                    errorname: "No Connection",
                    errorcode: 2,
                    errortext: getRandomErrorMessage(2)
                })
            }
        }).bind(this))
    };

    window.app = new WFEThing();



    /** HANDLERS **/

    var onLoadFunc = function() {

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
                return;
            }

            newRegion.data.forEach(function(wfeObj, index, array) {
                wfeObj.dateStr = moment.unix(wfeObj.date).format("D/M/YYYY")
            })

            var acc = new Accordionator();

            document.getElementById("results-header").innerHTML = newRegion.name;
            var results = document.getElementById("results");
            n.node.create(Handlebars.templates.results(newRegion).trim()).all(".accordion-item").each(function(el) {
                acc.add(el._node /* TODO: Find a better way to put this */);
            })
            results.innerHTML = "";
            acc.elems.forEach(function(elem) {
                results.appendChild(elem);
            })
            acc.init();
        })

        app.errors.handler("push", function(addition, newErrorList, oldErrorList) {
            var errorDiv = n.one("#errors");
            var message = n.node.create(Handlebars.templates.errors({error: addition}));
            message.setStyle("height", 0);
            errorDiv.prepend(message);
            message.anim({height: 70}, 1, "ease-in").wait(5).anim({height: 0}, 1, "ease-in").wait(1).remove();
        })

        var queries = getUrlVars();
        if ("r" in queries) {
            var r = queries.r;
            if (endsWith(r, '/')) {
                app.getRegion(r.substring(0, r.length - 1));
            } else {
                app.getRegion(queries.r);
            }
        }

    }

    domready(onLoadFunc);

})(window);

