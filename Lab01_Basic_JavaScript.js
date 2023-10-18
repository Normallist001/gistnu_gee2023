// โค้ดสำหรับประกอบการอบรมเชิงปฎิบัติการ:การประเมินพื้นที่เพาะปลูกและติดตามผลผลิตด้วยเทคโนโลยีอวกาศ สำหรับผู้ประกอบการอุตสาหกรรมอ้อยและน้ำตาล
// ระหว่างวันที่ 18-19 ตุลาคม 2566
// ณ มหาวิทยาลัยนเรศวร โดย สถานภูมิภาคเทคโนโลยีอวกาศและภูมิสารสนเทศ ภาคเหนือตอนล่าง มนเรศวร (GISTNU)

//------------------------ LAB 1: Basic JavaScript -------------------------------------//

print('Hello World!');

var city = 'Phitsanulok';
var postCode = 65000;

print('City :',city);
print(city,'Postcode is : '+ postCode);

//--------------------------------------------------------------------------------------//
//------------------------ List : การทำงานกับข้อมูลรูปแบบรายการ ----------------------------//

var listNum = [9, 8, 7, 6, 5];
var listStr = ['G', 'I', 'S', 'T', 'N', 'U'];

print('List of Numbers: ',listNum);
print('List of Strings: ', listStr);

var sattBand = [ 'B1', 'B2', 'B3', 'B4', 'B5' ];
print('List of Bands: ',sattBand);

print(sattBand[4] );
print(sattBand[3] );
print(sattBand[2]) ;

//--------------------------------------------------------------------------------------//
//------------------------ Object: การทำงานกับข้อมูลรูปแบบคุณสมบัติ ---------------------------//

var factoryData = {
    'Name': 'Sugar Factory',
    'coordinates': [ 100.19, 16.74],
    'Area': 1300
};

print('Object :', factoryData);

print('1 - ' + factoryData.Name);
print('2 - ' + factoryData['Name']);
print('3 - ' + factoryData['coordinates']);
print('Long - ' + factoryData['coordinates'][0]);
print('Lat - ' + factoryData.coordinates[1]);

//--------------------------------------------------------------------------------------//
//------------------------ Function: การใช้งานฟังก์ชัน -------------------------------------//

//--------------------- Non Function :
var NIR = 0.5; 
var RED = 0.08; 

var ndvi = (NIR - RED) / (NIR + RED); 

print("NDVI Value: " , ndvi);

//--------------------- Function :
function calNDVI(NIR, RED) { 
   var ndvi = (NIR - RED) / (NIR + RED); 
   return ndvi; 
} 

print("NDVI Value From Function: " , calNDVI(NIR, RED));

//--------------------------------------------------------------------------------------//
//-------------------------- Loop: การทำงานแบบวนซ้ำ -------------------------------------//

var dataPoints = [
    { NIR: 0.8, RED: 0.6 },
    { NIR: 0.9, RED: 0.7 },
    { NIR: 0.7, RED: 0.5 },
    { NIR: 0.6, RED: 0.4 }
];
print('Data Points:',dataPoints);

for (var i = 0; i < dataPoints.length; i++) {
    print("Index ==> " + i 
    + " NIR: " + dataPoints[i].NIR
    + " RED : " + dataPoints[i].RED);
}

//--------------------------------------------------------------------------------------//
//------------------------ Condition: การทำงานแบบมีเงื่อนไข -------------------------------//

var my_area = 30.12;

if (my_area > 23) {
  // print(my_area > 23);
  print("This area is suitable");
} else {
  print("This area is not suitable");
}

//--------------------------------------------------------------------------------------//
//--------------------- GEE Function: ตัวอย่างเครื่องมือพร้อมใช้ใน GEE ------------------------//

//--------------------- GEE Function :
var my_number = ee.Number(24);
print(ee.Algorithms.ObjectType(my_number));

var numberToString = ee.String(my_number);
print(numberToString.cat(" is ").cat(ee.Algorithms.ObjectType(numberToString)));

//--------------------- JavaScript Function :
var my_number = 24;
print(typeof(my_number));

var numberToString = String(my_number);
print(numberToString.concat(" is " , typeof(numberToString)));

//--------------------------------------------------------------------------------------//
