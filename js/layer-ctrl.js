///////////////////////////////////////////////////////////////////////////////////////////////////
//Switch background, simple achieve it with changing visibility of layer
//TODO: different image may need to set different image size and extend
//      Now I just set to the biggest one which includes all rooms
///////////////////////////////////////////////////////////////////////////////////////////////////

function createImageLayer(imageName){
	var imageUrl = 'img/' + imageName + '.jpg';

	//alert(imageUrl);
	// Create an image layer
	var imageLayer = new ol.layer.Image({
		name: imageName,
		opacity: 0.75,
		source: new ol.source.ImageStatic({
			attributions: [
				new ol.Attribution({
					html: '&copy; Wroclaw Univercity of Technology'
				})
			],
			url: imageUrl,
			imageSize: [958, 1688],
			//projection: map.getView().getProjection(),
			projection: pixelProjection,
			// extend [minX, minY, maxX, maxY]
			//imageExtent: ol.extent.applyTransform([17.0330, 51.1913, 17.0345, 51.1906], ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
			imageExtent: pixelProjection.getExtent()
			})
	});
	return imageLayer;
}


//Set basic map layers to invisible
function setInvisible(){
	layerOSM.setVisible(false);
	nodeVector.setVisible(false);
	roomVector.setVisible(false);
}

//Set basic map layers to visible, we use OSM by default
function setVisible(layer){
	
	var layers = layer.getLayers().getArray(),
			len = layers.length;
	for(var i = 0; i < len; i++){
		if (layers[i].get('name') === "OSM" || layers[i].get('name') === "room" || layers[i].get('name') === "node") {
			layers[i].setVisible(true);
		} else{
			layers[i].setVisible(false);
		}
	}
}

/**
 * Set selected image layer to be visible, other layers simply set to be invisible 
 * @param {ol.layer.Base} layer
 * @param {String} layerName
 * @returns 
 */
function setImageLayerVisible(layer, layerName){
	var layers = layer.getLayers().getArray(),
			len = layers.length;
	for(var i = 0; i < len; i++){
		if (layers[i].get('name') === layerName ||  layers[i].get('name') === 'nodePx') {
		    //alert(layers[i].get('name'));
			layers[i].setVisible(true);
		} else{
			layers[i].setVisible(false);
		}
	}
}

/**
 * Finds recursively the layer with the specified key and value.
 * @param {ol.layer.Base} layer
 * @param {String} key
 * @param {any} value
 * @returns {ol.layer.Base}
 */
function findBy(layer, key, value) {
	if (layer.get(key) === value) {
		return layer;
	}

	// Find recursively if it is a group
	if (layer.getLayers) {
		var layers = layer.getLayers().getArray(),
				len = layers.length, result;
		for (var i = 0; i < len; i++) {
			result = findBy(layers[i], key, value);
			if (result) {
				return result;
			}
		}
	}

	return null;
}

//Let's create a view in pixel projection for image layers
var imageView = new ol.View({
    projection: pixelProjection,
    center: ol.extent.getCenter([0, 300, 1000, 1800]),
    zoom: 2
  });


  
//Get the selected item, this event happens when we switch the background in dropdown-menu
$('#navbar').on('click', '.dropdown-menu li a', function () {
    //console.log("Selected Option:"+$(this).val());
	
	//Get selected item's id.
	var item = $(this).attr('id');
	//alert(item);
	
	if(item === 'mapMenu'){
		//switch to EPSG:4326 projection view for map
	    map.setView(ghView); 
		
	    //Set OSM layer to visible and others invisible
	    setVisible(map.getLayerGroup());
	} else {	
	    //switch to pixel projection view 
		map.setView(imageView);  
		//Find if imageLayer is existed already, if yes, we just simply need to make it visible
		var layer = findBy(map.getLayerGroup(), 'name', item);
		
		if(layer == null){ //not existed, so we create a new one
			var imageLayer = createImageLayer(item);
			//try here to see if it works
			map.addLayer(imageLayer);
			
			if(findBy(map.getLayerGroup(), 'name', 'nodePx') == null)
			{
				map.removeLayer(nodePxVector); //remove first and add again, in order to keep it on top.
			}
			map.addLayer(nodePxVector);
			imageLayer.setVisible(true);
			nodePxVector.setVisible(true);
		} else {
		   layer.setVisible(true);
		}

		//also we need to set other image layers to be invisible.
		setImageLayerVisible(map.getLayerGroup(), item)
	}
});
	
	
