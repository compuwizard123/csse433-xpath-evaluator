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
	"\\[([0-9])+\\]" : "\$($1).",

	// Dot dot
	"\\.\\." : "parent().",

	// Double slash
	"\/\/" : "$",

	// Root node and cleanup
	"(^|\\[|\\s)\\/" : "$1root().",
	"\\/" : '',

	// Dot dot
	"(\\.{2,3})(\\$|\/)" : ".parent().$2",

	// Predicates!
	"([^\\=\\>\\<\\!])\\=([^\\=])" : '$1==$2',
	"\\[" : '$(function(node){ with(node){ return(',
	"\\]" : '); }}).',

	// Cleanup remaining dots and slashes
	"\\(\\." : '(',
	"(\\)\\.|\\])(?!\\$|\\p)" : '$1jsonObj',

	// Count predicate helper
	"count\\(([^\\)]+)\\)" : "count('$1')",

	// Not predicate helper
	"not\\(([^\\)]+)\\)" : "not($1)"
}

function xParser(jsonObj, parNode, pName)
{
	this.jsonObj = jsonObj || null;
	this.parNode = parNode || null;
	this.pName   = pName   || null;
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
		var quotes = /(\'[^\']*\'|\"[^\"]*\")/;
		var temp   = [];

		while (quotes.test(str))
		{
			temp.push(str.match(quotes)[1]);
			str = str.replace(quotes, '%'+(temp.length-1)+'%');
		}

		for (var x in xParseRE)
			str = str.replace(new RegExp(x, 'gi'), xParseRE[x]);

		str = str.replace(/\%(\d+)\%/g, function(str, p1){ return temp[p1]; }).replace(/\.jsonObj$/, '');
		console.log(str);
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

		if (this.jsonObj && typeof(str) !=' undefined' && str !== null)
			switch (typeof(str))
			{
				case 'number':
					res = this.jsonObj[str] || null;
					break;
				case 'function':
					res = this.iterate(str).jsonObj;
					break;
				case 'string':
					var items = str.split('/');

					for (var i=0; i<items.length; i++)
					{
						var isArr = (self.jsonObj instanceof Array);
						var item  = new RegExp('^'+items[i].replace(/\./i, '\\\.').replace(/\*/g, '.*')+'$');
						var arr   = [];

						for (var prop in self.jsonObj)
							if (typeof(self.jsonObj[prop]) != 'function')
							{
								if (isArr && (arguments.callee.caller != this.$$))
									arr = arr.concat(this.regexp(item, self.jsonObj[prop]));
								else if (item.test(prop))
									arr.push(self.jsonObj[prop]);
							}

						self = new xParser((arr.length > 1) ? arr : ((arr.length == 1) ? arr[0] : arr), self, items[i]);
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
		return new xParser(arr, this);
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
		if (typeof(callback) == 'string')
			eval('callback = function(node){ with(node){ return('+callback+'); }}');

		for (var prop in this.jsonObj)
		{
			var item   = new xParser(this.jsonObj[prop], this, prop);
			item.index = prop;

			if (callback(item))
				arr.push(this.jsonObj[prop]);
		}

		return new xParser(arr, this);
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
		return this.jsonObj;
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
		return (this.hasParent()) ? this.parNode : this;
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
		return (this.index == (this.parent().jsonObj.length-1));
	},

	/* Predicate: position
	 * Returns position index value of the current node in the node set.
	 *
	 * Returns:  Integer value containing the position index value in the node set.
	 */
	position: function()
	{
		return this.index;
	}
}