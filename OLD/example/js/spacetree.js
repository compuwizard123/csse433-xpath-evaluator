var labelType, useGradients, nativeTextSupport, animate;
(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

function initST(rootNode){
    //Create a new ST instance
    st = new $jit.ST({  
    //id of viz container element  
    injectInto: 'infovis',  
    //set distance between node and its children  
    levelDistance: 30,
	orientation: 'top',
	constrained: false,
	offsetY: 100,
    //enable panning  
    Navigation: {  
      enable:true,  
      panning:false  
    },  
    //set node and edge styles  
    //set overridable=true for styling individual  
    //nodes or edges  
    Node: {  
        width: 80,  
        type: 'rectangle',
		autoHeight: true,
        color: '#aaa',  
        overridable: true  
    },  
      
    Edge: {  
        overridable: true  
    },  
     
	Tips: {  
		enable: true,
		offsetX: 10,  
		offsetY: 10,  
		onShow: function(tip, node) {  
			tip.innerHTML = "Name: " + node.name + "<br />";
			tip.innerHTML += "Text: " + node.data.text + "<br />";
			tip.innerHTML += "Attributes: <hr>";
			for(var item in node.data.attributes) {
				if(item[0] != "$") {
					tip.innerHTML += item + ":" + node.data.attributes[item] + "<br />";
				}
			}
		}  
	},
	
    onBeforeCompute: function(node){  
    },  
      
    onAfterCompute: function(){  
    },  
      
    //This method is called on DOM label creation.  
    //Use this method to add event handlers and styles to  
    //your node.  
    onCreateLabel: function(label, node){  
        label.id = node.id;              
        label.innerHTML = node.name;  
        label.onclick = function(){  
            st.onClick(node.id);  
        };  
        //set label styles  
        
		var style = label.style;  
        style.width = 80 + 'px'; 
        style.cursor = 'pointer';  
		style.textAlign= 'center';  
		/*
        style.color = '#333';  
        style.fontSize = '0.8em';  
        style.paddingTop = '3px';
		*/
    },  
      
    //This method is called right before plotting  
    //a node. It's useful for changing an individual node  
    //style properties before plotting it.  
    //The data properties prefixed with a dollar  
    //sign will override the global node style properties.  
    onBeforePlotNode: function(node){  
        //add some color to the nodes in the path between the  
        //root node and the selected node.  
        if (node.selected) {  
            node.data.$color = "#ff7";  
        }  
        else {  
            delete node.data.$color;  
            //if the node belongs to the last plotted level  
            if(!node.anySubnode("exist")) {  
                //count children number  
                var count = 0;  
                node.eachSubnode(function(n) { count++; });  
                //assign a node color based on  
                //how many children it has  
                node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
            }  
        }  
    },  
      
    //This method is called right before plotting  
    //an edge. It's useful for changing an individual edge  
    //style properties before plotting it.  
    //Edge data proprties prefixed with a dollar sign will  
    //override the Edge global style properties.  
    onBeforePlotLine: function(adj){  
        if (adj.nodeFrom.selected && adj.nodeTo.selected) {  
            adj.data.$color = "#eed";  
            adj.data.$lineWidth = 3;  
        }  
        else {  
            delete adj.data.$color;  
            delete adj.data.$lineWidth;  
        }  
    }  
});  
//load json data  
st.loadJSON(json);  
//compute node positions and layout  
st.compute();
//emulate a click on the root node.  
st.onClick(st.root); 
}
