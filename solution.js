var fs = require('fs')
var path = require('path')

 
//var regExp = /<script[^>]*>.*(?=<\/script>)<\/script>/ig;
var regExp = /<script.*id="([^"]+).*?>([.\s\S]+?)<\/script>/ig
var content=[];
var name=[];
 fs.readFile("index.aspx","utf8",function (error,data){
     if(error) throw error ;
    
 
	 
	 while(tem=regExp.exec(data)){
         //content.push(tem[2]);
		// name.push( tem[1].split('/')[1]|| tem[1].split('/')[0] ); 
		 var dn="./tmps/"+(tem[1].split('/')[1]|| tem[1].split('/')[0]);
		// console.log(dn);
		  fs.writeFile(dn
		  , tem[2] , 'utf8', function(err){
			 if(err) throw err ;
		 })
		
    }
 
	   
	 
 
 });