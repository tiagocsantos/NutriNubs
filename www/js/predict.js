/*
  Purpose: Pass information to other helper functions after a user clicks 'Predict'
  Args:
  	value - Actual filename or URL
  	source - 'url' or 'file'
*/
function predict_click(value, source) {
  
  if(source == 'url') {
    document.getElementById('img_preview').src = value;
    doPredict({ url: value });
    document.getElementById("hidden-type").value = "url";
    document.getElementById("hidden-val").value = value;
  }
    
  else if(source == 'file') {
    var preview = document.querySelector('#img_preview');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();
    //	console.log(preview);
	console.log(file);
	console.log(reader);

    // load local file picture
    reader.addEventListener("load", function () {
      preview.src = reader.result;
      var local_base64 = reader.result.split("base64,")[1];
      doPredict({ base64: local_base64 });
      document.getElementById("hidden-type").value = "base64";
      document.getElementById("hidden-val").value = local_base64;
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  } 
}

/*
  Purpose: Does a v2 prediction based on user input
  Args:
  	value - Either {url : url_value} or { base64 : base64_value }
*/
function doPredict(value) {
    // console.log("starting");
    var model_id = Clarifai.FOOD_MODEL;

    app.models.predict(model_id, value).then(
    
    function(response) {
        var concept_names = "";
        var tag_array, people_array;
        var tag_count = 0;
        var model_name = response.rawData.outputs[0].model.name;
        tag_array = response.rawData.outputs[0].data.concepts;
        //console.log("midle");   
        
        for (var i = 0; i < 5; i++) 
            concept_names += "<li onclick=askNutritionix('"+tag_array[i].name+"');>" + tag_array[i].name + '</li>';
      
        concept_names = '<ul style="margin-right:20px; margin-top:20px;">' + concept_names;
        
        concept_names += '</ul>';
        
        document.getElementById("conceptInfo").textContent = "Clarifai Predictions";
        
        $('#concepts').html(concept_names);

        //console.log("done");
    },
    function(err) {
      console.log(err);
    }
  );
}

function askNutritionix (name){
    var url = "https://api.nutritionix.com/v1_1/search/"+name;
    var fields = "fields=item_name%2Cnf_calories%2Cnf_total_fat%2Cnf_saturated_fat%2Cnf_cholesterol%2Cnf_sugars%2Cnf_sodium%2Cnf_protein%2Cnf_serving_weight_grams";
    var params = "results=0%3A1&cal_min=0&cal_max=50000&"+fields+"&appId=b5302b80&appKey=6c95838fc2df79fdfe3e85df8b6ef030";
    var httprequest = new XMLHttpRequest();
    httprequest.open("GET", url+"?"+params, false);
    httprequest.send(null);
    jsonResponse  = httprequest.responseText;
    console.log(jsonResponse);
    var parsedRes = JSON.parse(jsonResponse);
    var hits = parsedRes.hits;
 
    fields = hits[0]["fields"];
    console.log(fields);
    document.getElementById("concepts").style.display = "none";
    document.getElementById("nutriInfo").style.display = "initial";
    document.getElementById("conceptInfo").textContent = "";
    
    //console.log(fields["nf_serving_weight_grams"]);
    
    for (var key in fields){
        console.log(key);
        try {
            document.getElementById(key).children[0].textContent += fields[key];
            //checkPuzzles(key);
        }
        catch(err){}
    }
    checkPuzzles("n");
}

function checkPuzzles (field) {
    //FIXME working for the protein puzzles
    var text = document.getElementById('nf_calories').children[0].textContent;
    var calories = text.match(/\d/g);
    calories = calories.join("");
    var text = document.getElementById('nf_protein').children[0].textContent;
    var proteins = text.match(/\d/g);
    proteins = proteins.join("");
    var ProteinPerclorie = calories/proteins;
    console.log(ProteinPerclorie);
    /*
    *
    */
    var rainbow = new Rainbow();
    
    rainbow.setSpectrum('red', 'yellow', 'green');
    rainbow.setNumberRange(0, 5.6);
    var color = rainbow.colorAt(ProteinPerclorie);
    
    document.getElementById('nf_protein').children[1].style.background = '#'+color;
    
    if (ProteinPerclorie > 1) {
        console.log("gotin");
        //considered hight protein value
        document.getElementById('progress-bar').style.width += (100/5);
        for (var i=1; i<6; i++){
            if (document.getElementById('protein'+i).src.endsWith("imgs/question_mark.png")){
                console.log("changing");
                document.getElementById('protein'+i).src = document.getElementById("img_preview").src;
                console.log("You Just Made Progress on your Current Puzzle");
                break;
            }
            
        }
    }
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};