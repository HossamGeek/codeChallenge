const fs = require("fs");
const fastcsv = require('fast-csv');
const csv = require('csv-parser');
const { argv } = require("process");
function checkIsCSVFile(argv){
    const csvPattern =  /^.+\.(csv)$/;
    if(!csvPattern.test(argv[2])){
        throw new Error(
            `ERR :: your input is not correct, Please write 'npm run generate data.csv'
             and must put you file in this path  ('./inputsFiles/...name.csv') `);
    }
    return argv[2];
}

function calculateAveragePurchasedOrder(orders = []){
    let lengthOfOrders = orders.length;
    let result = [];
    if(orders.length){
        orders.forEach(values=>{
            let resultIndex = result.findIndex(value => value.name === values._2);
            if(resultIndex >= 0){
                result[resultIndex].count += parseInt(values._3)  
            }else{
                result.push({name:values._2,count:parseInt(values._3)})
            }    
        })
        result.map(values => {
            values.count /= lengthOfOrders;
        })
    }
    return result
  }

  function calculatePopularPurchasedOrder(orders = []){
    let result = [];
    if(orders.length){
        orders.forEach(values=>{
            let resultIndex = result.findIndex(value => value.name === values._2);
            if(resultIndex >= 0){
                let resultBrandIndex = result[resultIndex].brand.findIndex(value => value.name === values._4);
                if(resultBrandIndex >= 0) result[resultIndex].brand[resultBrandIndex].count += 1;    
                else result[resultIndex].brand.push({name : values._4 , count:1})
            }else{
                result.push({name:values._2,brand :[{name : values._4 , count:1}]})
            }    
        })
        result.map(values => {
            values.brand.sort((a,b)=> b.count-a.count)
            return values;
        }).map(value=>{
            value.brand = value.brand[0].name
        })
    }
    return result
  }


function generateCSVFile(filename = '',data = []){
    const outputPath = `./outputFiles/${filename}`
    const wStream = fs.createWriteStream(outputPath).on("finish",()=>{
        console.log(`${filename} created`);
    });
    fastcsv.write(data, { headers: false }).pipe(wStream);
}

function fetchCSVData(){
    const filename = checkIsCSVFile(argv)
    const inputPath = `./inputsFiles/${filename}`
    const results = [];      
    fs.createReadStream(inputPath)
        .pipe(csv( []))
        .on("data", (data) => {
            results.push(data);
        })
        .on("end", () => {
            const averagePurchasedOrder = calculateAveragePurchasedOrder(results);
            const popularPurchasedOrder = calculatePopularPurchasedOrder(results)
            if(averagePurchasedOrder.length) generateCSVFile(`0_${filename}`,averagePurchasedOrder)
            if(popularPurchasedOrder.length) generateCSVFile(`1_${filename}`,popularPurchasedOrder)
        })
}



fetchCSVData();