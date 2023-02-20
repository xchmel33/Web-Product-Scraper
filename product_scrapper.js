function depth_parent(element, tag_name) {
    let parent = element.parentNode;
    let depth = 1;
    while(parent !== document.body){
        if (parent.tagName === tag_name){
            return combine_objects({'parent': parent, 'depth': depth, 'image': element.src}, extra_attributes);
        }
        else{
            parent = parent.parentNode;
            depth++;
        }
    }
    return {'parent': false, 'depth': 0, 'image': element.src};
}

function most_common(array){
    let commonFreq = array.reduce((freq, count) =>{
        freq[count] = (freq[count] || 0) + 1;
        return freq;
    }, {});
    return Object.keys(commonFreq).reduce((a, b) => commonFreq[a] > commonFreq[b] ? a : b);
}

function target_filter(elements) {

    //! filter by common depth
    let depths = elements.map(element => element.depth)
    let mostCommonDepth = most_common(depths);

    //! filter by common \n
    let mostCommonBreaks = most_common(elements.map(element => element.parent.innerText.split("\n").length-1));
	
	//! change filters in order to return only desired elements
    return elements.filter(element => element['depth'] == mostCommonDepth && element.parent.innerText.split("\n").length-1 == mostCommonBreaks);
    //return elements.filter(element => element['depth'] == mostCommonDepth);
    //return elements.filter(element => element.parent.innerText.split("\n").length-1 == mostCommonBreaks);
}

function arrayToCSV(array) {
  let csv = "";

  const header = Object.keys(array[0]).join(",");
  csv += header + "\n";

  array.forEach((row) => {
    const values = Object.values(row).join(",");
    csv += values + "\n";
  });

  return csv;
}

function combine_objects(obj1, obj2){
    const combinedObj = { ...obj1 };
    for (const key in obj2) {
        if (combinedObj.hasOwnProperty(key)) {
            combinedObj[`${key}0`] = obj2[key];
        } else {
            combinedObj[key] = obj2[key];
        }
    }
  return combinedObj;
}

function duplicate_handler(array){
  
  array = array.map((x,y,z) => {
      x.rows = x.parent.innerText.split('\n'); 
      if (!split_rows) x.rows = [x.rows.join(' ')];
      delete x.parent; 
      return x;
    });
  
    let len = array.length-1;
    let new_array = [];
    for (let i = 0; i <= len; i++) {
        if (i < len && array[i].rows.join('') === array[i+1].rows.join('')){
            new_array.push(combine_objects(array[i], {image: array[i+1].image}));
            i++;
        } else {
          new_array.push(array[i]);
        }
    }
    return array;
}

function product_csv_serializer(elements){
    let output = []
    for (let element of elements) {
        let entry = {}, i = 0;
        for (let string of element.rows) {
            if (string === '') continue;
            entry['field'+i.toString()] = string;
            i++;
        }
        for (let k of Object.keys(element)){
          if (k !== 'rows' && k !== 'depth'){
            entry[k.toString()] = element[k];
          }
        }
        output.push(entry);
    }
    output = output.map((x) =>{
      for (let key in x){
        if (Object.keys(rewrite_attributes).includes(key)){
          x[rewrite_attributes[key]] = x[key];
          delete x[key];
        }
      }
      return x;
    });
    return output;
}



function product_finder() {

    var images = document.getElementsByTagName(target_type);
	
    let parents = [];
    let i = 0;

    for (let image of images) {

        let dp = depth_parent(image, parent_type);
        
      
        if (dp['parent'] !== false){
            parents[i] = dp;
            i++;
        }
    }
    return parents;
}

function download(filename, text) {
	
	var element = document.createElement('a');
	
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}


//! specify target element of what you are looking for
let target_type = 'img';

//! specify parent element here of target element for finding other attributes
let parent_type = 'LI'

//! rewrite found attribute keys
let rewrite_attributes = {
  'field0': 'name',
};

//! split found innerText in parent element into more fields
let split_rows = false;

//! splice product array
let slice_ = {
  'start': 0,
  'end': 800,
}

//! add extra attributes to desired product here
let extra_attributes = {
  
};

//! specify output filenmae
let output = "target_filename";

//! commend/uncomment debug options
function main() {
/** 
	Usage:
	1. analyze type of elements that you are looking for to scrape
	2. find type nth parents of elements that you are looking for to scrape
	3. configure these elements in fields marked //! 
	4. play around with configuration of other settings marked //! in order to get the elements you are looking for
	5. run this script as snippet and allow download
*/
  
  let image_elements = product_finder()
  //console.log('Found image elements = '+image_elements.length.toString());

  let filtered_elements = target_filter(image_elements);
  //console.log('Filtered image elements = '+filtered_elements.length.toString());

  let removed_duplicates = duplicate_handler(filtered_elements);
  //console.log('Non-duplicated elements = '+removed_duplicates.length.toString());

  let serialized_entries = product_csv_serializer(removed_duplicates);
  //console.log('Serialized products:',serialized_entries);

  serialized_entries = serialized_entries.slice(slice_['start'], slice_['end']);
  //console.log('Sliced products:',serialized_entries.length);

  let final_output = arrayToCSV(rewriten_values);
  //console.log('Final CSV output:',final_output.length);

  download(output+".csv", final_output);
}

main();