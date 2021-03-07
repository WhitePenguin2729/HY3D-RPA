const googleSpreadsheet = require("google-spreadsheet");
const creds = require("../sheet_cred.json");
var request =require('request');
const { testLab } = require("firebase-functions");
const doc = new googleSpreadsheet("1Kgw1VfOJA4AC6OUB8HO8btgFO3qeEPtARnMPOVJycSM");
//const doc = new googleSpreadsheet("1c6LUcEotin68Y50vJkcd6n9R-hDelpkr1xfDY-X5tv4");
           // console.log(cells);



/*인덱스 정보*/
var insert_flag = 0;
var sheet_index = 0;
var modeling_empty = 0;
var color_empty = 0;
var empty_check = 0;
var last_index;
var ID;
function get_pure_name(filename){
    var pure = filename.split('.');
    return pure[0];
}
function get_weight(weight){
    var set_weight = weight * 1.01 * 0.001;
    var quotient = parseInt(set_weight / 5);
    set_weight =  quotient * 5 + 5;
    return set_weight;
}

function check_empty_data(post){
    console.log("color : " + color_empty + " model : " + modeling_empty);
    if(post.modeling_detail ==''&&post.modeling_manager =='' &&post.modeling_duration ==''
    &&post.modeling_price ==''){
        console.log("-----------1");
        console.log(post);
        modeling_empty = 1;
    }
    if(post.color_details ==''&&post.color_nums =='' &&post.color_price ==''){
        console.log("-----------2");
        console.log(post);
        color_empty = 1;
    }
    empty_check = 1;
   
}
function save_last_index(index){
    last_index = index;
}
exports.find_last_index = function(){
    var index = -1;
    var i = 0;
  // return index;
  while(index<0){
    if(i==0){
        i++;
        doc.useServiceAccountAuth(creds, function (err) {

            doc.getCells(
                1	// 시작할 시트의 인덱스(인덱스는 1부터 시작함)
              , {
                    "min-row" : 1	// Cell의 최소 가로 범위
                  , "min-col" : 1	// Cell의 최소 세로 범위
                  , "max-row" : 1600	// Cell의 최대 가로 범위(필수)
                  , "max-col" : 1     // Cell의 최대 세로 범위(필수)
                  , "return-empty" : true
              }
              , function(err, cells) {
                  var last;
                  if(err) console.log(err);
                //  console.log(cells);
                 for(var num = 0; 1600 > num; num++) {
                       if(cells[num].value == ""){
                           last = num-1;
                           break;
                       }
                 }
                 console.log("-------------------");
                 console.log(last);
                 index = last;
                 return last;
              }
                );
        });
    }
    
      ;
  }
  return index;
}
function find_sheet_index(callback_func,post_body){
    doc.useServiceAccountAuth(creds, function(err){
            doc.getInfo(function(err, info) {
                console.log(info.worksheets[0].title); 
                console.log(post_body);             
                for(var i = 0; info.worksheets.length ; i++){
                    if (info.worksheets[i].title === "Every3D"){
                        /* 모델링 도색 empty 여부 플래그(전역변수) 설정 */
                        console.log( "title : " + info.worksheets[i].title); 
                        /* 시트에 보낼 변수 채우고 시트에 저장 하는 함수 실행*/
                        callback_func(i);
                        
                        break;
                    }
                }
            });
    });
}
exports.find_record_sheet = function(){
   // doc.useServiceAccountAuth(creds, function(err){
   //     /*   doc.getInfo(function(err, info) {
   //            console.log("구글 시트의 제목  : " + info.title);
   //            console.log("구글 시트의 URL  : " + info.id);
   //          //  return info;
   //        });*/
   //        doc.getCells(
   //            1	// 시작할 시트의 인덱스(인덱스는 1부터 시작함)
   //          , {
   //                "min-row" : 1	// Cell의 최소 가로 범위
   //              , "min-col" : 3	// Cell의 최소 세로 범위
   //              , "max-row" : 8	// Cell의 최대 가로 범위(필수)
   //              , "max-col" : 2     // Cell의 최대 세로 범위(필수)
   //              , "return-empty" : true
   //          }
   //          , function(err, cells) {
   //              return cells;
   //              for(var num = 0; cells.length > num; num++) {
   //                  console.log( cells[num].value );
   //              }
   //          }
   //      );
   //});
}
exports.insert_models = function (post_body) {
    console.log(post_body);
    var models_filename = ""; // 파일명 1 / 파일명 2 / 파일명 3
    var models_weight = ""; // 2 . 무게1 / 무게 2 / ...
    var models_num = ""; // 3. 수량1 / 수량 2 / ...
    var detail_info = ""; //4.   모델개수/엑셀번호/제작시간/분류선택/소요일자
    var modeling_info = "";  // 5.    모델링내역/모델링담당자/모델링소요일자/모델링단가
    var color_info = ""; // 6.   도색내역/도색수량/도색단가 
    var delivery_info = ""; // 7.   배송수량/배송가격   
      
    var no_model_flag = 1
    if(post_body.models_info != ''){
        model_objects = JSON.parse(post_body.models_info);
        no_model_flag = 0;
    }
    doc.useServiceAccountAuth(creds, function(err){
        /* 비동기 문제로 해결 방법을 위해 콜백함수 방법으로 */
        find_sheet_index(function (return_index) {
            sheet_index = return_index + 1;
            console.log("return : " + sheet_index)
            doc.getCells(
                sheet_index,
                {
                    "min-row": 1	// Cell의 최소 가로 범위
                    , "min-col": 2	// Cell의 최소 세로 범위
                    , "max-row": 1	// Cell의 최대 가로 범위(필수)
                    , "max-col": 2     // Cell의 최대 세로 범위(필수)
                    , "return-empty": true
                }
                , async function (err, cells) {

                        ID = Number(cells[0].value) + 1;
                        console.log("ID : " + ID);
                        console.log("cells[0].value : " + cells[0].value);
                        cells[0].value = Number(cells[0].value) + 1;          // 해당 셀(Cell)의 값을 변경한다.
                        console.log("cells[0].value : " + cells[0].value);
                        cells[0].save();                        // 해당 셀(Cell)의 변경사항을 저장한다.
                        console.log("완료");
                     


                        doc.getCells(
                            sheet_index,
                            {
                                "min-row": Number(ID) + 3	// Cell의 최소 가로 범위
                                , "min-col": 1	// Cell의 최소 세로 범위
                                , "max-row": Number(ID) + 3	// Cell의 최대 가로 범위(필수)
                                , "max-col": 57     // Cell의 최대 세로 범위(필수)
                                , "return-empty": true
                            }
                            , function (err, cells) {
                                // console.log(cells);
                                //모델정보 배열 제작
                                cells[1].value = "작업중";
                                cells[1].save();
                                cells[0].value = ID;
                                cells[2].value = post_body.excel_no;
                                cells[3].value = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
                                cells[4].value = post_body.distribute;
                                cells[5].value = post_body.distribute_duration;
                                cells[6].value = post_body.print_duration;

                                cells[0].save();
                                cells[1].save();
                                cells[2].save();
                                cells[3].save();
                                cells[4].save();
                                cells[5].save();
                                cells[6].save();
                                /*
                                cells[7].value = 재료별로 금액 다르게 설정
                                */
                                console.log("cells[6].save()까지 완료");

                                console.log("model flag : " + !no_model_flag);
                                console.log("model_objects.length : " + model_objects.length);


                                for (var i = 0; i < model_objects.length; i++) {
                                    var j = 8 + (i * 4);
                                    console.log(i + "+ 1번 로그" );
                                    cells[j].value = model_objects[i].filename.split('.')[0];
                                    console.log(i + "+ 2번 로그");
                                    cells[j].save();
                                    console.log(i + "+ 3번 로그");
                                    cells[j + 1].value = get_weight(model_objects[i].volume);
                                    console.log(i + "+ 4번 로그");
                                    cells[j + 1].save();
                                    console.log(i + "+ 5번 로그");
                                    cells[j + 2].value = post_body[`model${i}`];
                                    console.log(i + "+ 6번 로그");
                                    cells[j + 2].save();
                                    console.log(i + "+ 7번 로그");


                                }



                                cells[48].value = post_body.modeling_detail;
                                cells[49].value = post_body.modeling_manager;
                                cells[50].value = post_body.modeling_duration;
                                cells[51].value = post_body.modeling_price;
                                cells[48].save();
                                cells[49].save();
                                cells[50].save();
                                cells[51].save();
                                console.log("시작");
                                console.log("cells[52].value = post_body.color_details; 시작" );
                                cells[52].value = post_body.color_details;
                                cells[53].value = post_body.color_nums;
                                cells[54].value = post_body.color_price;;
                                cells[52].save();
                                cells[53].save();
                                cells[54].save();

                                console.log("cells[55].value = post_body.color_details; 시작");
                                cells[55].value = post_body.delivery_nums;
                                cells[56].value = post_body.delivery_price;
                                cells[55].save();
                                cells[56].save();



                                cells[1].value = "완료"
                                cells[1].save();


                                console.log("시트 입력 완료!");

                            }
                        );
                    }
            );



            //doc.getCells(sheet_index,
            //    {
            //        "min-row" : 1	    // Cell의 최소 가로 범위
            //        , "min-col" : 1	    // Cell의 최소 세로 범위
            //        , "max-row" : 10	    // Cell의 최대 세로 범위(필수)
            //        , "max-col" : 2      // Cell의 최대 가로 범위(필수)
            //        , "return-empty" : true
            //    },async function(err,cells){
            //       // console.log(cells);
            //        //모델정보 배열 제작
                   
            //        //1, // 2 // 3 완성 시키기 
            //        if(!no_model_flag){//모델이 있으면
            //            for(var i = 0 ; i < model_objects.length ; i++){
            //                if(i == model_objects.length -1){
            //                    models_filename += model_objects[i].filename.split('.')[0];
            //                    models_weight += get_weight(model_objects[i].volume);
            //                    models_num += post_body[`model${i}`];
            //                }
            //                else{
            //                    models_filename += model_objects[i].filename.split('.')[0] + "♪";
            //                    models_weight += get_weight(model_objects[i].volume) +"♪";
            //                    models_num += post_body[`model${i}`] + "♪";
            
            //                }
            //            }
            //            //모델개수 4번 맨앞에 추가
            //            detail_info += `${model_objects.length}♪`;
            //        }
            //        else{
            //            models_filename = "null";
            //            models_weight = "null";
            //            models_num = "null";
            //            detail_info += "0♪"
            //        }
            //        // 4.   모델개수/엑셀번호/제작시간/분류선택/소요일자 
            //        detail_info += post_body.excel_no +  "♪";
            //        detail_info += post_body.print_duration +  "♪";
            //        detail_info += post_body.distribute +  "♪";
            //        detail_info += post_body.distribute_duration;

            //        // 5.    모델링내역/모델링담당자/모델링소요일자/모델링단가
            //                    modeling_info += post_body.modeling_detail + "♪";
            //                    modeling_info += post_body.modeling_manager + "♪";
            //                    modeling_info += post_body.modeling_duration + "♪" ;
            //                    modeling_info += post_body.modeling_price;
                        
                   
            //        //6. 도색내역 / 도색수량 / 도색 단가
                
            //                    color_info += post_body.color_details + "♪";
            //                    color_info += post_body.color_nums + "♪";
            //                    color_info += post_body.color_price;
                        
            //        //7. 배송수량 / 배송단가
            //        delivery_info += post_body.delivery_nums + "♪";
            //        delivery_info += post_body.delivery_price;
                    
            //        //시트에 전송
            //        cells[3]._value = models_filename;
            //        cells[5]._value = models_weight;
            //        cells[7]._value = models_num;
            //        cells[9]._value = detail_info;
            //        cells[11]._value = modeling_info;
            //        cells[13]._value = color_info;
            //        cells[15]._value = delivery_info;
            //        //시트에 저장
            //        cells[3].save();
            //        cells[5].save();
            //        cells[7].save();
            //        cells[9].save();
            //        cells[11].save();
            //        cells[13].save();
            //        cells[15].save();
            //        //1.8초후 구글 스크립트 실행
            //        setTimeout(function() {
            //            var geturl = 'https://script.google.com/macros/s/AKfycbxzVtTqlJEmeje6XSR9J-Gwmdtk_Hy9e1qPYsph7vDAC-D8i8a9w0oX/exec'


            //           request(geturl, function(err, res, body) {if(err) console.log(err); });
            //           console.log("--------------------get url fininsh-----------------------");
            //           console.log("--------------------get url fininsh-----------------------");
            //           console.log("--------------------get url fininsh-----------------------");
                       
            //          }, 1500);
                  
                    
            //        console.log("시트 입력 완료!");
            //});

        },post_body);
        
    
    });
    
}
