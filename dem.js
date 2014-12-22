// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

 var shortest = Infinity;


 function readBlob(startByte, stopByte, recordData1, recordData2, first, numElevationProfs, second) {
 
    var files = document.getElementById('files').files;
    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];
    var start = parseInt(startByte) || 0;
    var stop = parseInt(stopByte) || file.size - 1;

    var reader = new FileReader();
    
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
    	if(second) {
    		recordData1.push(evt.target.result.split(','));
    	} else {
        	recordData1.push(evt.target.result);
    	}    	
	  }

    	if(recordData1[4] != undefined && first === true) {
    		callBack(recordData1, recordData2);
    	} else if(second) {
    		console.log("************INSIDE************");

			/*
			for(i = 0; i < recordData2.length; i++) {
				
				var div = document.createElement('div');
				document.body.appendChild(div);
				div.id = 'record_A' + i;
				document.getElementById('record_A' + i).textContent = recordData2[i];		
			}*/
		
			
			var combinedArray = new Array();

			var elevationProfileNum = 1;			
			for(i = 0; i < recordData1.length; i++) {


				var tempArray = new Array();
				//var string = recordData1[i].toString().trim();
				console.debug(i);
				var string;
				string = recordData1[i].toString().trim();
				
    			tempArray = string.split('  ');
				combinedArray = combinedArray.concat(tempArray);
				/*
				var div = document.createElement('div');
				document.body.appendChild(div);
				div.id = 'record_B' + i;
				document.getElementById('record_B' + i).textContent = recordData1[i];*/
				/*if(i == numElevationProfs - 1) {
				
				}*/

				if(combinedArray.length/elevationProfileNum > 62000) {
					// Make grids
					var w = recordData1.length;
					var h = Math.floor(combinedArray.length/recordData1.length);

					var g, shaders;

    				initGL(); // basic WebGL setup for the scene 

    				shaders = initShaders( gl, "vertex-shader", "fragment-shader" );

    				// create a grid
    				g = new Grid(w, h, shaders, combinedArray);
    				// center it at the origin
    				g.move((1-w)/2, X_AXIS);
    				g.move((1-h)/2, Z_AXIS);

    				drawables.push(g); // add the grid to our list of drawables

    				renderScene();
    				if(elevationProfileNum > 1) {
    					g.move((1-(w*elevationProfileNum))/2, X_AXIS);
    					g.move((1-h)/2, X_AXIS);
    				}
    				elevationProfileNum++;
    			}
    	
			}
		}
		//	console.log("whole length: " + combinedArray.length);
    };
    
    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  }
  
  
  function readBlobElevations(startByte, stopByte, recordData1, recordData2, elevationArray, first, second, numElevationProfs) {

    var files = document.getElementById('files').files;
    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];
    var start = parseInt(startByte) || 0;
    var stop = parseInt(stopByte) || file.size - 1;

    var reader = new FileReader();
    
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
    	
    	elevationArray.push(evt.target.result);
	  }

	  findShortest(elevationArray, numElevationProfs, recordData1, recordData2);

    };
    
    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  }

  document.querySelector('#button').addEventListener('click', function(evt) {
  	var recordAData = new Array();
	var recordBData = new Array();
	var getData;
	
	getData = function (recordA, recordB) {
		
		readBlob(529, 534, recordA, recordB, true, -1, false);
    	readBlob(535, 540, recordA, recordB, true, -1, false);
		readBlob(547, 738, recordA, recordB, true, -1, false);
    	readBlob(739, 786, recordA, recordB, true, -1, false);
    	readBlob(853, 864, recordA, recordB, true, -1, false);
  	}
    
    getData(recordAData, recordBData);

  }, false);
  
  
  function callBack(recordA, recordB) { 
		console.log("Inside");

		// recordA[4] contains the number of elevation profiles
		var numElevationProfs = parseInt(recordA[4].trim().substring(1).trim());
		var increment = 1024;

		var numElevations = [];		


		// Get the number of elevations per elevation profile
		for(i = 0; i < numElevationProfs; i++) {
			readBlobElevations(increment + 13, increment + 24,  recordA, recordB, numElevations, false, true, numElevationProfs);
					
			increment += 1024;
		}
	}
	
	
  function findShortest(elevationArray, numElevationProfs, recordData1, recordData2) {
  	elevationArray[elevationArray.length - 1] = parseInt(elevationArray[elevationArray.length - 1]);//.trim().substring(1).trim());
  	if(elevationArray[elevationArray.length - 1] < shortest) {
  		shortest =  elevationArray[elevationArray.length - 1];
  	}
  	//console.log("MAX NUMBER OF ELEVATIONS: **************************** " + elevationArray.length);
  	//console.log("ELEVATIONS: **************************** " +  elevationArray[elevationArray.length - 1]);
  	//console.log("SHORTEST: **************************** " + shortest);
  	console.log("E Array " + elevationArray);
  	
  	
  	if(elevationArray.length == numElevationProfs) {
  		callBack2(recordData1, recordData2, numElevationProfs);
  	}
  }
	
  function callBack2(recordA, recordB, numElevationProfs) {
		var increment = 1024;

  		for(i = 0; i < numElevationProfs; i++) {
	  		if(i === 0) {
				readBlob(increment + 144, increment + 876, recordB, recordA, false, numElevationProfs, true);
				console.log("inside loop1");
			} else {
				readBlob(increment + 144, increment + 1020, recordB, recordA, false, numElevationProfs, true);
				console.log("inside loop2");
			}
			increment += 1024;
		}
  }