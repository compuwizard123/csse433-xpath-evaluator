/*
 * XPath Evaluator
 * A web application utilizing JavaScript to provide visual
 * demonstrations, step-by-step, of XPath expression parsing
 * and end results
 *
 * Author:   Shawn Dean
 * Modified: April 27, 2011
 */

// Regular expressions that will be applied to the XPath string
// The way they are ordered below is how they will be applied
// And the order DOES matter.

var xParseRE =
{
	// AND | OR operators
	" and " : " && ",
	" or "  : " || ",

	// Try to conver [xx=yy] into [xx = yy]
	"([^\\=\\>\\<\\!\s\\&\\|])\\=([^\\=\s\\&\\|])" : '$1 = $2',

	// Main sucker here
	// Does most of the node splitting via / into $ query calls
	// Also checks for some sort of node/attribute as well
	"([\\#\\*\\@a-z\\_][\\*a-z0-9_\\-\\.]*)(?=(?:\\s|$|\\[|\\]|\\/))" : "\$('$1').",
	"\\[([0-9]+)+\\]" : "\$($1).",

	// Dot dot
	"\\.\\." : "parent().",

	// Double slash
	"\/\/" : "$",

	// Root node and cleanup
	"(^|\\[|\\s)\\/" : "$1root().",
	"\\/" : '',

	// Dot
	"\\.\\.(\\$|\/)" : ".$1",

	// Dot dot
	"(\\.{2,3})(\\$|\/)" : ".parent().$2",

	// Predicates!
	"([^\\=\\>\\<\\!])\\=([^\\=])" : '$1==$2',
	"\\[" : '$(function(node){ with(node){ return !isEmpty(',
	"\\]" : ');}}).',

	// Cleanup remaining dots and slashes
	"\\(\\." : '(',
	"(\\)\\.|\\])(?!\\$|\\p)" : "$1getJson()",
	"return\\(([^\\)]+)?((\\$\\('(@[A-Za-z0-9]*)'\\))\\.jsonObj)([^\\)]+)?\\)" : "return($1$3$5)",

	// Count predicate helper
	"count\\(([^\\)]+)\\)" : "count('$1')",

	// Not predicate helper
	"not\\(([^\\)]+)\\)" : "not($1)",

	// Crap left still...
	"^\\." : ""
}

var xParserMsgs =
{
	root   : "Search the document root for all descendant '%s' nodes",
	rootc  : "Search the document root for all child '%s' nodes",

	descd  : "Search '%s' for all descendant '%s' nodes",
	chld   : "Search '%s' for all children '%s' nodes",

	mchld     : "Search %s '%s' node in the current nodeset for all child '%s' nodes",
	mchldblank: "Search %s node in the current nodeset for all child '%s' nodes",
	mchldstar : "Search %s '%s' node in the current nodeset for all child nodes",
	mchildattr: "Search %s '%s' node in the current nodeset that has a '%s' attribute",

	parent   : "Navigate up to the parent node",
	parentArr: "Navigate the nodeset to each parent node",

	posnode : "Select the %s '%s' node in the current nodeset",

	runpred  : "Running predicate check on current node '%s'",
	predcheck: "Checking %s '%s' node in the current nodeset against the predicate",
	startpred: "Starting predicate checks against current nodeset",

	attrstar : "Searching '%s' node for any attribute",
}

function xParser(jsonObj, parNode, pName, callback)
{
	this.jsonObj  = jsonObj  || null;
	this.parNode  = parNode  || null;
	this.pName    = pName    || null;
	this.callback = callback || null;
}

xParser.prototype =
{
	/* Parse Handler
	 * Performs a string parsing method of converting an XPath expression into
	 * a suitable JavaScript chained-method to be evaluated on the xParser object
	 *
	 * Arguments:
	 *   str [string]
	 *     XPath expression to be parsed and converted
	 *
	 * Returns:  xParser object containing the final results from the query
	 */

	parse : function(str)
	{
		for (var x in this.jsonObj)
			this.pName = x;

		var quotes = /(\'[^\']*\'|\"[^\"]*\")/;
		var temp   = [];

		while (quotes.test(str))
		{
			temp.push(str.match(quotes)[1]);
			str = str.replace(quotes, '%'+(temp.length-1)+'%');
		}

		for (var x in xParseRE)
			str = str.replace(new RegExp(x, 'gi'), xParseRE[x]);

		str = str.replace(/\%(\d+)\%/g, function(str, p1){ return temp[p1]; }).replace(/\.(jsonObj|getJson\(\))$/, '');
		try
		{
			return eval('this.'+str+';');
		}
		catch(me)
		{
			console.error(me);
			return false;
		}
	},

	/* $ Handler
	 * Performs a search query on the local xParser object
	 *
	 * Arguments:
	 *   str [mixed]
	 *     - String containing the nodename or nodename path to be queried.
	 *     - Function to be applied for the iteration of the nodeset.
	 *     - Integer that selects the index in an array.
	 *
	 * Returns:  xParser object containing found queried node(s)
	 */

	'$': function(str)
	{
		var self = this;
		var res  = null;
		var msg  = null;

		if (this.jsonObj && typeof(str) !=' undefined' && str !== null)
			switch (typeof(str))
			{
				case 'number':
					if (str >= this.jsonObj.length)	
						return false;

					res = this.jsonObj[str] || null;
					
					this.runCallback.apply(new xParser(self.jsonObj[str], self.parent(false), self.pName), ['posnode', suffix(str+1), self.pName]);
					break;
				case 'function':
					this.runCallback.apply(new xParser(self.jsonObj, self.parent(false), self.pName), ['startpred']);
					res = this.iterate(str).jsonObj;
					break;
				case 'string':
					var items = str.split('/');

					for (var i=0; i<items.length; i++)
					{
						var isArr = (self.jsonObj instanceof Array);
						var item  = new RegExp('^'+items[i].replace(/\./i, '\\\.').replace(/\*/g, '[^@](.+?)')+'$');
						var arr   = [];
						var atrar = [];
						var attr  = (items[i].charAt(0) == '@');
						var star  = (items[i].charAt(items[i].length-1) == '*');
						var tmp, msg, par, fail;

						for (var prop in self.jsonObj)
						{
							if (prop == window.idNode || /[a-z0-9]{8}\-[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{12}/i.test(self.jsonObj[prop]))
								continue;

							if (typeof(self.jsonObj[prop]) != 'function')
							{
								if (isArr)
								{
									tmp = this.regexp(item, self.jsonObj[prop]);
									if (arguments.callee.caller != this.$$)
									{
										msg  = (attr) ? 'mchildattr' : ((star) ? 'mchldstar' : ((self.pName == '*') ? 'mchldblank' : 'mchld'));
										par  = (attr || (star && !tmp.length)) ? new xParser(self.jsonObj[prop], self.parent(false), self.pName) : self;
										fail = fail = (tmp.length != 0);

										if (attr)
										{
											if (tmp.length)
											{
												arr = arr.concat(self.jsonObj[prop]);
											}

											tmp = self.jsonObj[prop];
										}
										else if (star)
										{
											arr  = arr.concat((tmp.length) ? tmp : self.jsonObj[prop]);
											tmp  = (tmp.length) ? tmp : self.jsonObj[prop];
										}
										else
										{
											arr = arr.concat(tmp);
											if (self.pName == '*')
											{
												if (!tmp.length)
												{
													fail = false;
													tmp  = (tmp.length) ? tmp : self.jsonObj[prop];
												}
											}
										}

										this.runCallback.apply(new xParser(tmp, par, (attr) ? self.pName : str), [msg, suffix(parseInt(prop)+1), (self.pName == '*') ? str : self.pName, str, fail]);
									}
								}
								else if (item.test(prop))
								{
									tmp = self.jsonObj[prop];

									arr.push(tmp);
									if (arguments.callee.caller != this.$$)
									{
										msg = (this === this.root()) ? 'rootc' : 'chld';
										if (attr && star)
											msg = 'attrstar';

										this.runCallback.apply(new xParser(tmp, self, str), [msg, this.pName, str]);
									}
								}
							}
						}

						self = new xParser((arr.length == 1) ? arr[0] : arr, self, (star) ? self.pName : items[i]);
					}

					return self;
			}

		return new xParser(res, self);
	},

	/* $$ Handler
	 * Performs a globally recursive query on the xParser object
	 *
	 * Arguments:
	 *   str [string]
	 *     String containing the nodename or nodename path to be queried.
	 *
	 * Returns:  xParser object containing found queried node(s)
	 */

	'$$' : function(str)
	{
		// Query the current nodeset
		var res = this.$(str).jsonObj;
		var arr = [];

		// Merge or push results from current nodeset query
		if (res instanceof Array)
			arr = arr.concat(res);
		else if (res !== null)
			arr.push(res);

		// Loop through collect results from the query on each property
		for (var prop in this.jsonObj)
			if (typeof(this.jsonObj[prop]) == 'object')
				arr = arr.concat(new xParser(this.jsonObj[prop], this, prop).$$(str).jsonObj);

		// Return new xParser object
		if (arguments.callee.caller != this.$$)
			this.runCallback.apply(new xParser(arr, this, str), (this === this.root()) ? ['root', str] : ['descd', this.pName, str]);

		return new xParser(arr, this, (str == '*') ? this.pName : str);
	},

	/* Iterator Handler
	 * Performs XPath predicate evaluation
	 *
	 * Arguments:
	 *   callback [function|string]
	 *     Either a callback function to apply to the nodeset during the iteration.
	 *     Or a string representation of the callback, which is converted into a callback function automatically.
	 *
	 * Returns:  xParser object containing the filtered nodeset
	 */

	iterate : function(callback)
	{
		var arr = [];
		var tmp, res, item;

		for (var prop in this.jsonObj)
		{
			item       = new xParser(this.jsonObj[prop], this, prop);
			item.index = prop;
			item.root().noCallback = true;

			res = callback(item);
			tmp = this.jsonObj[prop];

			if (res !== false)
				arr.push(tmp);

			delete item.root().noCallback;
			this.runCallback.apply(new xParser(tmp, this, this.pName), ['predcheck', suffix(parseInt(prop)+1), this.pName, (res !== false)]);
		}

		return new xParser(arr, this, null);
	},

	/* Regex Handler
	 * Performs regular expression tests on properties of an xParser JSON object
	 *
	 * Arguments:
	 *   re [string]
	 *     Regular expression to be tested on each property
	 *
	 *   objData [object]
	 *     A JSON object whose properties will be put to the test
	 *
	 * Returns:  Array containing properties that passed the test(s)
	 */

	regexp : function(re, objData)
	{
		var arr = [];
		for (var x in objData)
		{
			if (objData instanceof Array)
				arr = arr.concat(this.regexp(re, objData[x]));
			else if (typeof(objData[x]) != 'function' && re.test(x))
				arr.push(objData[x]);
		}

		return arr;
	},

	/* Retrieve JSON */
	getJson : function()
	{
		try
		{
			if (this.root().noCallback === true && typeof(this.jsonObj) == 'object')
				return this.jsonObj['#text'];
			else
				return this.jsonObj;
		}
		catch(me)
		{
			return this.jsonObj;
		}
	},

	/* Inline helpers */
	hasParent : function()
	{
		return (this.parNode) ? true : false;
	},

	/* Predicate / Navigation Helpers */
	root: function()
	{
		return (this.hasParent()) ? this.parNode.root() : this;
	},

	parent: function()
	{
		var par = (this.hasParent()) ? this.parNode : this;
		if (arguments[0] !== false)
			this.runCallback.call(par, (this.parNode.jsonObj instanceof Array) ? 'parentArr' : 'parent');

		return par;
	},

	text: function()
	{
		return (typeof(this.jsonObj['#text']) == 'string') ? this.jsonObj['#text'] : false;
	},

	/* Predicate: count
	 * Returns the count total of 'n' nodes in the current node
	 *
	 * Arguments:
	 *   node [string] (Optional ~ Default: '*')
	 *     Node name to apply count on
	 *
	 * Returns:  Number of child {node} nodes
	 */
	count: function(node)
	{
		var n = this.$(node || '*').jsonObj;         
		return (n) ? ((n instanceof Array) ? n.length : 1) : 0;
	},

	not: function(bool)
	{
		return !bool;
	},

	/* Predicate: last
	 * Returns boolean value telling if the current node is the last node in the set.
	 *
	 * Returns:  Boolean value if this node is the last node
	 */
	last: function()
	{
		return (this.index == (this.parent(false).jsonObj.length-1));
	},

	/* Predicate: position
	 * Returns position index value of the current node in the node set.
	 *
	 * Returns:  Integer value containing the position index value in the node set.
	 */
	position: function()
	{
		return this.index;
	},

	runCallback : function()
	{
		var args = [];
		for (var i=1; i<arguments.length; i++)
			args.push(arguments[i]);

		args.unshift(xParserMsgs[arguments[0]]);

		var root = this.root();
		var cb   = root.callback;
		var fail = (typeof(args[args.length-1]) == 'boolean' && args.pop() === false);
		var msg  = sprintf.apply(this, args);

		if (((typeof(root.noCallback) != 'boolean' && root.noCallback !== true) || (typeof(root.noCallback) == 'undefined')) && Object.prototype.toString.call(cb) === '[object Function]')
			cb.call(this, msg, fail);
	}
}

function isEmpty(mixed)
{
	var key;
	if (mixed === '' || mixed === 0 || mixed === '0' || mixed === null || mixed === false || typeof mixed === 'undefined' || (mixed instanceof Array && mixed.length == 0))
		return true;

	if (typeof mixed_var == 'object')
	{
		for (key in mixed)
			return false;

		return true;
	}

	return false;
}

function suffix(n)
{
	n = n.toString();
	var l = n.length;
	var x = parseInt(n.substring(l-2, l));
	var i = n%10;

	return n+(((x < 11 || x > 19) && (i < 4)) ? ['th', 'st', 'nd', 'rd'][i] : 'th');
}

function sprintf () {
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments,
        i = 0,
        format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {
            chr = ' ';
        }
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {
            '2': '0b',
            '8': '0',
            '16': '0x'
        }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false,
            positivePrefix = '',
            zeroPad = false,
            prefixBaseX = false,
            customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
            case ' ':
                positivePrefix = ' ';
                break;
            case '+':
                positivePrefix = '+';
                break;
            case '-':
                leftJustify = true;
                break;
            case "'":
                customPadChar = flags.charAt(j + 1);
                break;
            case '0':
                zeroPad = true;
                break;
            case '#':
                prefixBaseX = true;
                break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
        case 's':
            return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
        case 'c':
            return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
        case 'b':
            return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'o':
            return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'x':
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'X':
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
        case 'u':
            return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'i':
        case 'd':
            number = (+value) | 0;
            prefix = number < 0 ? '-' : positivePrefix;
            value = prefix + pad(String(Math.abs(number)), precision, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case 'e':
        case 'E':
        case 'f':
        case 'F':
        case 'g':
        case 'G':
            number = +value;
            prefix = number < 0 ? '-' : positivePrefix;
            method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
            value = prefix + Math.abs(number)[method](precision);
            return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
        default:
            return substring;
        }
    };

    return format.replace(regex, doFormat);
}