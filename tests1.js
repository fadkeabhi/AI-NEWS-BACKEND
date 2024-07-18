const { jsonrepair } =require('jsonrepair')
  


  try {
    // The following is invalid JSON: is consists of JSON contents copied from 
    // a JavaScript code base, where the keys are missing double quotes, 
    // and strings are using single quotes:
    const json = '{"Title": "H"ello World"}'
    
    const repaired = jsonrepair(json)
    
    console.log(JSON.parse(repaired)) 
  } catch (err) {
    console.error(err)
  }