function XPathEval()
{
	var self      = this;
	var xmlLoaded = false
	var xmlJson   = false;
	var jsonStr   = false;
	var idNode    = '#$__ID$$';
	var xpath     = $('#xpath');
	var graphWrap = $('#graphWrap');
	var steps     = $('.steps', '#resultsWrap');
	var stepData  = $('#stepData');
	window.idNode = idNode;

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
				if (x.substr(0, 1) == '@' || x == '#text' || x.toString() === idNode)
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
					id       : (typeof(obj[x][idNode]) == 'string') ? obj[x][idNode] : self.UUID(),
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

	this.populateIds = function(json)
	{
		function loop(obj)
		{
			var tmp = (obj instanceof Array) ? [] : {};
			for (var x in obj)
			{
				tmp[x] = ((typeof(obj[x]) == 'object' && !(obj[x] instanceof Array)) || obj[x] instanceof Array) ? loop(obj[x]) : ((x.substr(0, 1) == '@' || x == '#text') ? obj[x] : {'#text': obj[x]});
				if ((typeof(obj[x]) == 'object' && !(obj[x] instanceof Array)) || (typeof(obj[x]) == 'string' && !(x.substr(0, 1) == '@' || x == '#text')))
					tmp[x][idNode] = self.UUID();
			}

			return tmp;
		}

		return loop(json);
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

		xmlJson   = self.populateIds(xmlJson);
		xmlLoaded = true;

		console.log(xmlJson);
		self.viewTree(xmlJson);
	}

	this.buildResults = function(steps, res, r)
	{
		var arr = [];
		for (var i=0; i<steps.length; i++)
			arr.push($.extend(steps[i], {pnode: self.getPname(steps[i].node)}));

		arr.push(
		{
			message: 'Final result',
			json   : (typeof(res) == 'string') ? r.parent(false).getJson() : res,
			pnode  : self.getPname(r)
		});

		return arr;
	}

	this.getPname = function(x)
	{
		if (typeof(x.pName) != 'undefined' && x.pName != null)
			return (x.pName.charAt(0) == '@' && x != x.parent(false)) ? this.getPname(x.parent(false)) : x.pName;
		else if (x.hasParent())
			return this.getPname(x.parent(false));
		else
			return false;
	}

	this.fixJsonResult = function(obj)
	{
		var res = {}

		if ($.isArray(obj.getJson()))
		{
			res[self.getPname(obj) || 'result'] = obj.getJson();
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
			rt = self.getPname(obj.parent(false));
			ct = self.getPname(obj);

			res[(ct[0] == '@') ? rt: ct] = (ct[0] == '@') ? {} : obj.getJson();
			if (ct[0] == '@')
				res[rt][ct] = obj.getJson();
		}

		return res;
	}

	this.evaluate = function(e)
	{
		e.preventDefault();

		// Do some checking
		if (xmlLoaded !== true)
		{
			alert('Please load some XML first.');
			return false;
		}

		stepData.hide();

		// Clear out steps data
		$('#xmlResult').empty();

		// Load xParser and parse it!
		var steps  = [];
		var parser = new xParser(xmlJson, null, null, function(msg, fail)
		{
			var json = this.getJson();
			if ((json instanceof Array) && (typeof(json[0]) == 'string'))
				json = this.parent(false).getJson();

			steps[steps.length] =
			{
				message: msg,
				json   : json,
				fail   : fail || false,
				node   : this
			}
		});

		var res = parser.parse(xpath.val());
		// Error?
		if (res === false)
		{
			self.setMessage('Invalid XPath Expression!', 'error');
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

			var fRes = self.fixJsonResult(res);
			console.log(res, fRes);
			$('#xmlResult').html(self.fixTags(self.formatXml(self.json2xml(fRes))));
			if ($(this).hasClass('stepbystep'))
				self.stepbystep(fRes, res, steps);
			else
				self.viewTree(fRes);
		}
	}

	this.stepbystep = function(res, r, steps)
	{
		var resArr = self.buildResults(steps, res, r);
		var curIdx = 0;
		var maxIdx = resArr.length-1;

		console.log('steps', resArr);
		stepData.data('timer', 0);
		$('.prev, .next', stepData).addClass('disabled').unbind('click.xpath').bind('click.xpath', function(e, force)
		{
			var next  = $(this).hasClass('next');
			var timer = stepData.data('timer');
			var now   = new Date().getTime();

			// Slow it down?
			if (timer > 0 && now-timer < 400)
				return;

			// Disabled?
			if ($(this).hasClass('disabled') && force !== true) return false;

			// Update index
			if (force !== true)	(next) ? curIdx++ : curIdx--;

			// Step it out
			if ((next && curIdx <= maxIdx) || (!next && curIdx >= 0))
			{
				$('.message', stepData).hide().html(resArr[curIdx].message || '<i>Unknown step</i>').fadeIn();
				self.viewTree(resArr[curIdx].json, resArr[curIdx].pnode, resArr[curIdx].fail);
			}

			// Update buttons and timer
			$('.prev', stepData)[(curIdx <= 0) ? 'addClass' : 'removeClass']('disabled');
			$('.next', stepData)[(curIdx >= maxIdx) ? 'addClass' : 'removeClass']('disabled');

			if (force !== true)
				stepData.data('timer', now);
		});

		// Are we hiding?!
		if (stepData.is(':hidden'))
			stepData.slideDown('fast');

		// Let's automate the start of stepping
		$('.next', stepData).trigger('click.xpath', [true]);
	}

	this.viewTree = function(json, root, fail)
	{
		hilite = true;

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
					// label.onclick   = function()
					// {
						// st.onClick(node.id,
						// {
							// Move:
							// {
								// enable  : true,
								// offsetY : 15
							// }
						// });
					// }
				},

				onBeforePlotNode: function(node)
				{
					var _nodes = graphWrap.data('tree').hiliteNodes;
					var _idx   = (jQuery.isArray(_nodes) && jQuery.inArray(node.id, _nodes) >= 0);
					var _fail  = (graphWrap.data('tree').fail);

					if (node.selected || _idx)
						node.data.$color = (_fail) ? '#FFDDDD' : '#ff7';
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

					if (_nodes.length && node.selected && node.id == graphWrap.data('tree').root && !_idx)
						delete node.data.$color;
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

		st.hiliteNodes = [];
		st.fail        = (fail === true) ? true : false;

		if (hilite)
		{
			if (st.isXmlJson !== true)
			{
				st.isXmlJson  = true;
				st.jitXmlJson = self.json2jit(xmlJson);

				st.graph.empty();
				st.loadJSON(st.jitXmlJson);
			}

			if (typeof(json[idNode]) == 'string' && json[idNode])
				st.hiliteNodes.push(json[idNode]);
			else
				for (var x in json)
				{
					if (!st.hiliteNodes.length && json[x] instanceof Array)
					{
						for (var y in json[x])
						{
							if (typeof(json[x][y][idNode]) == 'string' && json[x][y][idNode])
								st.hiliteNodes.push(json[x][y][idNode]);
							else if (json[x][y] instanceof Array)
								for (var z in json[x][y])
								{
									if (typeof(json[x][y][z][idNode]) == 'string' && json[x][y][z][idNode])
										st.hiliteNodes.push(json[x][y][z][idNode]);
								}
						}
					}
					else if (typeof(json[x][idNode]) == 'string' && json[x][idNode])
						st.hiliteNodes.push(json[x][idNode]);
				}
		}
		else
		{
			st.graph.empty();
			st.loadJSON(self.json2jit(json, root));
		}

		st.compute();
		st.onClick(st.root, {Move: {enable: true, offsetY: 185}});

		if (!inited)
			st.canvas.scale(1.2, 1.2);

		if (isHidden)
			graphWrap.css('visibility', 'visible').hide().fadeIn('fast');
	}

	this.json2xml = function(o, tab)
	{
		var toXml = function(v, name, ind)
		{
			var xml = "";
			if (v instanceof Array)
			{
				for (var i=0, n=v.length; i<n; i++)
					xml += ind + toXml(v[i], name, ind+"\t") + "\n";
			}
			else if (typeof(v) == "object")
			{
				var hasChild = false;
				xml += ind + "<" + name;
				for (var m in v)
				{
					if (m.toString() === idNode)
						continue;

					if (m.charAt(0) == "@")
						xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
					else
						hasChild = true;
				}

				xml += hasChild ? ">" : "/>";
				if (hasChild)
				{
					for (var m in v)
					{
						if (m.toString() === idNode)
							continue;

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
			else
				xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";

			return xml;
		}, xml="";
		for (var m in o)
			xml += toXml(o[m], m, "");

		return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
	}

	this.formatXml = function(str)
	{
		var ind, node, arr, i;
		var xml   = '';
		var pad   = 0;
		var space = function(n)
		{
			var str = '';
			for (var i=0; i<(n*4); i++)
				str += ' ';

			return str;
		}

		str = str.replace(/(>)(<)(\/*)/g, "$1\r$2$3");
		arr = str.split("\r");

		for (i=0; i<arr.length; i++)
		{
			ind  = 0;
			node = arr[i];

			if (node.match(/.+<\/\w[^>]*>$/))
				ind = 0;
			else if (node.match(/^<\/\w/) && pad > 0)
				pad -= 1;
			else if (node.match(/^<\w[^>]*[^\/]>.*$/))
				ind = 1;

			xml += space(pad)+node+"\r";
			pad += ind;
		}

		return xml;
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
			e.preventDefault();
			$('#xmlDialog').modal();
			return false;
		});

		// Load XML Data
		$('.load', '#xmlDialog').unbind('click.xpath').bind('click.xpath', this.loadXml);

		// Evaluate
		$('.xpathEval').unbind('click.xpath').bind('click.xpath', this.evaluate);

		// Autoload!
		if ($('#xmlData').val())
			$('.load', '#xmlDialog').click();
	}

	this.init();
}

$(document).ready(function(){ new XPathEval(); });