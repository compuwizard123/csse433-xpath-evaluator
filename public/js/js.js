function XPathEval()
{
	var self = this;
	var xmlLoaded = false
	var xmlJson   = false;
	var jsonStr   = false;
	var xpath     = $('#xpath');
	var graphWrap = $('#graphWrap');
	var results   = $('.results', '#resultsWrap');
	var steps     = $('.steps', '#resultsWrap');
	var stepData  = $('#stepData');

	this.uuidGen    = function(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
	this.UUID       = function(){ return (this.uuidGen()+this.uuidGen()+'-'+this.uuidGen()+'-'+this.uuidGen()+'-'+this.uuidGen()+'-'+this.uuidGen()+this.uuidGen()+this.uuidGen()); }
	this.setMessage = function(msg, klass, init)
	{
		var dis  = this;
		var self = $('#globalMessage').html(msg).attr('class', '').addClass(klass || '');

		if (!init)
		{
			self.css('margin-left', $(window).width()/2-self.width()/2);
			if (self.is(':hidden'))
				self.slideDown('fast');

			if (self.data('timer'))
				clearTimeout(self.data('timer'));

			self.data('timer', setTimeout(function()
			{
				self.hide();
				$(window).unbind('resize.xpath');
			}, 5000));

			$(window).unbind('resize.xpath').bind('resize.xpath', function(){ dis.setMessage(msg, klass, !init); });
		}
		else
		{
			var l = $(window).width()/2-self.width()/2;
			self.stop().animate({marginLeft: (l < 0) ? 0 : l}, 150, 'linear');
		}
	}

	this.json2jit = function(dadta, root)
	{
		var self = this;
		function loop(obj, nm)
		{
			var arr = [];
			for (var x in obj)
			{
				// We're an attribute OR! #text node
				// Skip it because the parent should have grabbed it already
				if (x.substr(0, 1) == '@' || x == '#text')
					continue;

				// Let's see if this node has any attributes
				var data = {}
				if (typeof(obj[x]) == 'object' || obj[x] instanceof Array)
				{
					for (var y in obj[x])
						if (y == '#text')
							data.text = $.trim(obj[x][y]);
						else if (y.substr(0, 1) == '@')
							data[(y.substr(1).toLowerCase() == 'text') ? 'text ' : y.substr(1)] = $.trim(obj[x][y]);
				}
				else if (typeof(obj[x]) == 'string')
					data.text = $.trim(obj[x]);

				// Push the node onto the array stack
				arr.push(
				{
					id       : self.UUID(),
					name     : nm || x,
					data     : data,
					children : (typeof(obj[x]) == 'object' || obj[x] instanceof Array) ? loop(obj[x], (obj[x] instanceof Array) ? x : false) : []
				});
			}

			return arr;
		}

		x = loop(dadta);
		x = x.shift();
		try
		{
			if (root)
				x.name = root;
		}
		catch(me){}

		return x;
	}

	this.parseXml = function(str)
	{
		// Let's try jQuery's parseXML method.  It will try and catch the result
		// If it catches an exception, then it's invalid, else we assume... sweet!
		try
		{
			return $.parseXML($('#xmlData').val());
		}
		catch(me){ return false; }
	}

	this.loadXml = function()
	{
		var xml = self.parseXml($('#xmlData').val());
		if (xml === false)
		{
			alert('Invalid XML!');
			return false;
		}

		// Hide the dialog
		$.modal.close();
		self.setMessage('Loaded XML content');

		var jsonStr = xml2json(xml, "  ");
		eval('xmlJson = '+jsonStr);

		// xmlJson   = self.cleanJson(xmlJson);
		xmlLoaded = true;
		self.viewTree(xmlJson);
	}

	this.buildResults = function(r, res)
	{
		var arr = [];
		function loop(obj)
		{
			if (obj.hasParent())
				loop(obj.parent());

			arr[arr.length] = {message: obj.message, pnode: self.getPname(obj), kjson: obj.jsonObj, json: self.fixJsonResult(obj)}
		}

		loop(r);
		arr[arr.length] = {message: 'Final result', json: res}

		return arr;
	}

	this.getPname = function(x)
	{
		if (x.pName)
			return x.pName;
		else if (x.hasParent())
			return this.getPname(x.parent());
		else
			return false;
	}

	this.fixJsonResult = function(obj)
	{
		var res = {}

		if ($.isArray(obj.getJson()))
		{
			// if (obj.getJson().length == 1)
				res[self.getPname(obj) || 'result'] = obj.getJson();
			// else
				// res = obj.getJson();
		}
		else if ($.isPlainObject(obj.getJson()))
		{
			var cnt = 0;
			for (var x in obj.getJson())
				cnt++;

			if (cnt > 1)
				res[self.getPname(obj) || 'result'] = obj.getJson();
			else
				res = obj.getJson();
		}
		else if (typeof(obj.getJson()) == 'string')
		{
			rt = self.getPname(obj.parent());
			ct = self.getPname(obj);

			console.log({rt: rt, ct: ct});
			res[(ct[0] == '@') ? rt: ct] = (ct[0] == '@') ? {} : obj.getJson();
			if (ct[0] == '@')
				res[rt][ct] = obj.getJson();
		}

		return res;
	}

	this.evaluate = function()
	{
		// Do some checking
		if (xmlLoaded !== true)
		{
			alert('Please load some XML first.');
			return false;
		}

		stepData.hide();

		// Clear out results and steps data
		results.empty();
		$('#xmlResult').empty();

		// Load xParser and parse it!
		var x = new xParser(xmlJson);
		var r = x.parse(xpath.val());

		// Inline step-loop method
		function loopSteps(obj)
		{
			if (obj.hasParent())
				loopSteps(obj.parent());

			$('ol', steps).append($('<li></li>').html('<strong>'+obj.message+'</strong><br /><pre>'+js_beautify($.toJSON(obj.jsonObj), {indent_size: 1, indent_char: '  '})+'</pre>'));
		}

		// Error?
		if (r === false)
		{
			results.html('Error parsing XPath expression');
			xpath.addClass('error').bind('keydown.xpath focus.xpath', function()
			{
				if ($(this).hasClass('error'))
					$(this).removeClass('error').unbind('keydown.xpath focus.xpath');
			});
		}
		else
		{
			if ($('#resultsWrap').is(':hidden'))
				$('#resultsWrap').fadeIn('fast');

			var res  = self.fixJsonResult(r);
			var root = null;

			console.log('r', r);
			console.log('res', res);

			results.html(js_beautify($.toJSON(res), {indent_size: 1, indent_char: '  '}));
			$('#xmlResult').html(self.fixTags(self.formatXml(self.json2xml(res), {indent_size: 1, indent_char: '  '})));

			if ($(this).hasClass('stepbystep'))
				self.stepbystep(res, r);
			else
				self.viewTree(res, root);
		}
	}

	this.formatXml = function (xml) {
        var reg = /(>)(<)(\/*)/g;
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var pad = 0;
        var formatted = '';
        var lines = xml.split('\n');
        var indent = 0;
        var lastType = 'other';
        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
        var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
        };

        for (var i = 0; i < lines.length; i++) {
            var ln = lines[i];
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            var padding = '';

            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++) {
                padding += '\t';
            }
            if (fromTo == 'opening->closing')
                formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            else
                formatted += padding + ln + '\n';
        }

        return formatted;
    }

	this.stepbystep = function(res, r)
	{
		var resArr = self.buildResults(r, res);
		var curIdx = 0;
		var maxIdx = resArr.length-1;

		console.log('resArr', resArr);
		stepData.data('timer', 0);
		$('.prev, .next', stepData).addClass('disabled').unbind('click.xpath').bind('click.xpath', function(e, force)
		{
			var next  = $(this).hasClass('next');
			var timer = stepData.data('timer');
			var now   = new Date().getTime();

			// Slow it down?
			if (timer > 0 && now-timer < 1500)
				return;

			// Disabled?
			if ($(this).hasClass('disabled') && force !== true) return false;

			// Update index
			if (force !== true)	(next) ? curIdx++ : curIdx--;

			// Step it out
			if ((next && curIdx <= maxIdx) || (!next && curIdx >= 0))
			{
				$('.message', stepData).hide().html(resArr[curIdx].message).fadeIn();
				self.viewTree(resArr[curIdx].json, resArr[curIdx].pnode);
			}

			// Update buttons and timer
			$('.prev', stepData)[(curIdx <= 0) ? 'addClass' : 'removeClass']('disabled');
			$('.next', stepData)[(curIdx >= maxIdx) ? 'addClass' : 'removeClass']('disabled');

			if (force !== true)
				stepData.data('timer', now);
		});

		$('.next', stepData).trigger('click.xpath', [true]);
		if (stepData.is(':hidden')) stepData.slideDown('fast');
	}

	this.viewTree = function(json, root)
	{
		var isHidden = graphWrap.is(':hidden');
		var inited   = (graphWrap.data('inited') === true);

		// Are we hidden?
		if (isHidden) 
			graphWrap.show().css('visibility', 'hidden');

		// Has the spacetree been initiated already?
		if (!inited)
		{
			var st = new $jit.ST(
			{
				constrained  : false,
				orientation  : 'top',
				injectInto   : 'treeGraph',
				duration     : 100,
				levelsToShow : 999,

				Navigation:
				{
					enable  : true,
					panning : 'avoid nodes',
					zooming : 15
				},

				Node:
				{
					autoHeight  : true,
					autoWidth   : true,
					type        : 'rectangle',
					color       : '#aaa',
					overridable : true
				},

				Edge:
				{
					type        : 'bezier',
					overridable : true
				},

				Tips:
				{
					enable  : true,
					offsetX : 16,
					offsetY : 16,
					onShow  : function(tip, node)
					{
						var attrs   = [];
						var hasText = ('text' in node.data);

						// Grab all of "our" attributes
						for (var item in node.data)
							if (item[0] !== '$' && item !== 'text')
								attrs.push([item, node.data[item]]);

						// Reset tip HTML & make visible
						tip.innerHTML        = '';
						tip.style.visibility = 'visible';

						// Any attributes?
						if (attrs.length)
						{
							tip.innerHTML += "<strong>Attributes:</strong>";
							for (var item in node.data)
							{
								if (item[0] !== '$' && item !== 'text')
									tip.innerHTML += "<div><u>"+item+"</u>: "+node.data[item]+"</div>"
							}

							if (hasText)
								tip.innerHTML += "<hr size='1' />";
						}

						// How about some text value?
						if (hasText)
							tip.innerHTML += "<strong>Text Value</strong><br />"+node.data.text;

						// Hide if no content
						if (tip.innerHTML == '')
							tip.style.visibility = 'hidden';
					}
				},

				Events:
				{
					enable  : true,
					onClick : function(node, evt, e)
					{
						if (node)
							st.select(node.id);
					}
				},

				onCreateLabel: function(label, node)
				{
					label.id        = node.id;
					label.innerHTML = node.name;
					label.onclick   = function()
					{
						st.onClick(node.id,
						{
							Move:
							{
								enable  : true,
								offsetY : 15
							}
						});
					}
				},

				onBeforePlotNode: function(node)
				{
					if (node.selected)
						node.data.$color = "#ff7";
					else
					{
						delete node.data.$color;
						if (!node.anySubnode("exist"))
						{
							var count = 0;
							node.eachSubnode(function(n) { count++; });
							node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
						}
					}
				},

				onBeforePlotLine: function(adj)
				{
					if (adj.nodeFrom.selected && adj.nodeTo.selected)
					{
						adj.data.$color = "#eed";
						adj.data.$lineWidth = 3;
					}
					else
					{
						delete adj.data.$color;
						delete adj.data.$lineWidth;
					}
				}
			});

			graphWrap.data('inited', true).data('tree', st);
		}
		else
			st = graphWrap.data('tree');

		// Load the JSON baby
		st.graph.empty();
		st.loadJSON(self.json2jit(json, root));
		st.compute();
		st.onClick(st.root, {Move: {enable: true, offsetY: 185}});

		if (!inited)
			st.canvas.scale(1.2, 1.2);

		if (isHidden)
			graphWrap.css('visibility', 'visible').hide().fadeIn('fast');
	}

	this.json2xml = function(o, tab)
	{
		var toXml = function(v, name, ind) {
		var xml = "";
		if (v instanceof Array) {
		for (var i=0, n=v.length; i<n; i++)
		xml += ind + toXml(v[i], name, ind+"\t") + "\n";
		}
		else if (typeof(v) == "object") {
		var hasChild = false;
		xml += ind + "<" + name;
		for (var m in v) {
		if (m.charAt(0) == "@")
		xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
		else
		hasChild = true;
		}
		xml += hasChild ? ">" : "/>";
		if (hasChild) {
		for (var m in v) {
		if (m == "#text")
		xml += v[m];
		else if (m == "#cdata")
		xml += "<![CDATA[" + v[m] + "]]>";
		else if (m.charAt(0) != "@")
		xml += toXml(v[m], m, ind+"\t");
		}
		xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
		}
		}
		else {
		xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
		}
		return xml;
		}, xml="";
		for (var m in o)
		xml += toXml(o[m], m, "");
		return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
	}

	this.fixTags = function(str)
	{
		var optTemp = 0,
        i = 0,
        noquotes = false;
        quote_style = 2;

		str = str.toString().replace(/&/g, '&amp;');
		str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
 
		var OPTS = {
		'ENT_NOQUOTES': 0,
		'ENT_HTML_QUOTE_SINGLE': 1,
		'ENT_HTML_QUOTE_DOUBLE': 2,
		'ENT_COMPAT': 2,
		'ENT_QUOTES': 3,
		'ENT_IGNORE': 4
		};

		if (quote_style === 0)
			noquotes = true;

		if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			quote_style = [].concat(quote_style);
			for (i = 0; i < quote_style.length; i++) {
				// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
				if (OPTS[quote_style[i]] === 0) {
					noquotes = true;
				} else if (OPTS[quote_style[i]]) {
					optTemp = optTemp | OPTS[quote_style[i]];
				}
			}
			quote_style = optTemp;
		}
		if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			str = str.replace(/'/g, '&#039;');
		}
		if (!noquotes) {
			str = str.replace(/"/g, '&quot;');
		}
	 
		return str;
	}

	this.init = function()
	{
		// Load XML button
		$('#loadXml').unbind('click.xpath').bind('click.xpath', function(e)
		{
			$('#xmlDialog').modal();
			return false;
		});

		// Load XML Data
		$('.load', '#xmlDialog').unbind('click.xpath').bind('click.xpath', this.loadXml);

		// Evaluate
		$('div.xpathEval').unbind('click.xpath').bind('click.xpath', this.evaluate);

		// Autoload!
		if ($('#xmlData').val())
			$('.load', '#xmlDialog').click();
	}

	this.init();
}

$(document).ready(function(){ new XPathEval(); });