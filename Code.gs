//checks if the deadline reminders have been turned on
function deadlinesActive(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var contrlSheet= ss.getSheetByName("Control Panel")
  var reminderActive= contrlSheet.getRange('F2').getValue();
  
  if(reminderActive == true){
    checkDeadlines();
    Logger.log('checked');
  }
}

//checks the deadlines for any that are about to reach the reminder day 
//sends reminders in case of reminder day reached
function checkDeadlines() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var generalSheet = ss.getSheetByName("General");
  var confSheet = ss.getSheetByName("contact information");
  var contrlSheet= ss.getSheetByName("Control Panel")
  var lastcolumn = generalSheet.getRange('a1').getValue();
  var sections = confSheet.getRange('H2').getValue();
  var dashboard=confSheet.getRange('I2').getValue();
  var link=confSheet.getRange('J2').getValue();
  var resultArray=[[]];
  var deadlineNames = generalSheet.getRange(2, 2, 1, lastcolumn).getValues();
  var deadlineDates = generalSheet.getRange(6, 2, 1, lastcolumn).getValues();
  var statusRange  = generalSheet.getRange(8,1,sections, lastcolumn +1).getValues();
  var reminderDay= contrlSheet.getRange('E3').getValue();
  
  
  
  for ( var h=0;h< sections;h++){
    
    var sectionArray= [];
    sectionArray[0]  = getEmail(statusRange[h][0]);
    sectionArray[1] = statusRange[h][0];
    for(var i = 0; i< lastcolumn; i++){
      var y=i+1;
      
      
      sectionArray[y+1]= statusRange[h][y];
      
      
      
    }
    resultArray[h]  = sectionArray;
    
  }
  
  
  
  for(var i=0;i < lastcolumn;i++){
    
    var message="Hi!<br />\n";
    message=message + "<br />\n";
    message=message + "Don't forget that the deadline '" + deadlineNames[0][i] + "' is due in 3 days! <br />\n";
    message=message + "This reminder was generated by the " + dashboard + ": " + link + " <br />\n";
    message=message + "Kind regards, <br />\n";
    message=message + "Your lovely NR";
    
    var msg="Hi!\n";
    msg=msg + "\n";
    msg=msg + "Don't forget that the deadline '" + deadlineNames[0][i] + "' is due in 3 days! \n";
    msg=msg + "This reminder was generated by the " + dashboard + ": " + link + " \n";
    msg=msg + "Kind regards,\n";
    msg=msg + "Your lovely NR";
    
    
    if(deadlineDates[0][i] == reminderDay){
      
      for ( var h=0;h< sections;h++){
        
        if(resultArray[h][i+2]==''){
          
          
          if(getPreference(statusRange[h][0])=='email'){
            MailApp.sendEmail({to: resultArray[h][0],subject: dashboard + ' deadline reminder',htmlBody: message});
            
          }
          
          if(getPreference(statusRange[h][0])=='slack'){
            triggerSlackRequest(getSlack(statusRange[h][0]), msg);
            
          }
          
          if(getPreference(statusRange[h][0])=='both'){
            MailApp.sendEmail({to: resultArray[h][0],subject: dashboard + ' deadline reminder',htmlBody: message});
            triggerSlackRequest(getSlack(statusRange[h][0]), msg);
            
            
          }
          // generalSheet.getRange(getValue(resultArray[h][1]), i+2).setValue(resultArray[h][0]);
          
        }
      }
    }
    
  }
  
  
  
}


//tries the slack trigger
function test(){
  triggerSlackRequest('@jensi', 'test')
}



//sends message to slack through webhook -- should be replaced with slack.app
function triggerSlackRequest(channel, msg) {
  var slackWebhook = "https://hooks.slack.com/services/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";
  
  var payload = { "channel": channel, "text": msg, "link_names": 1, "username": "Yennefer", "icon_emoji": ":yennefer:" };
  var options = { "method": "post", "contentType": "application/json", "muteHttpExceptions": true, "payload": JSON.stringify(payload) };
  
  Logger.log(UrlFetchApp.fetch(slackWebhook, options));
}

//finds contact information of section
function findInColumn(column, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet  = ss.getSheetByName("contact information");
  var sections = sheet.getRange("H2").getValue()+1;
  var column = sheet.getRange(column + ":" + sections);  // like A:A
  
  var values = column.getValues(); 
  var row = 0;
  
  while ( values[row] && values[row][0] !== data ) {
    row++;
  }
  
  
  return row+1;
  
  
}

//retrieves the reminder preference of a section
function getPreference(value){
  var preference='';
  var row = findInColumn(1,value);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var confSheet = ss.getSheetByName("contact information");
  
  return confSheet.getRange(row, 4).getValue();
  
  
}

//retrieves the email address of a section
function getEmail(value){
  var preference='';
  var row = findInColumn(1,value);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var confSheet = ss.getSheetByName("contact information");
  
  return confSheet.getRange(row, 2).getValue();
  
  
  
}

//retrieves the slackID of a section president
function getSlack(value){
  var preference='';
  var row = findInColumn(1,value);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var confSheet = ss.getSheetByName("contact information");
  
  return confSheet.getRange(row, 3).getValue();
  
  
}




//gives the correct value when checking deadlines based on state
function ifempty(value){
  if(value=='Done' || value=='Ongoing' || value=='N/A' )
  {
    return  value;
    
    
  }else
  {
    return 'nothing';
    
  }
  
}



//Moves deadlines that have passed 5 days ago
function moveDeadline(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var generalSheet = ss.getSheetByName("General");
  var lColumn = generalSheet.getMaxColumns();
  
  var dates = generalSheet.getRange(5,1,1,lColumn).getValues();
  var date = new Date();
  var today = new Date(date.setDate(date.getDate()-5));
  Logger.log(today);
  Logger.log(dates);
  for( var h=lColumn;h> 0;h--){
    Logger.log(dates[0][h]);
    if(new Date(dates[0][h])< today){
      Logger.log("made it");
      moveColumn(h);
    }
  }
  
}

//moves a column to the old deadlines sheet
function moveColumn(iniCol) {
  // iniCol - Column of interest. (Integer)
  // finCol - Column where you move your initial column in front of.(Integer)
  // Ex:
  // Col A  B  C  D  E
  //     1  2  3  4  5
  //     6  7  8  9  10
  //     11    12 13 14
  // Want to move Column B in between Column D/E.
  // moveColumn(2,4);
  // Col A  B  C  D  E
  //     1  3  4  2  5
  //     6  8  9  7  10
  //     11 12 13    14
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("General");
  var so = ss.getSheetByName('old deadlines');
  var lRow = sh.getMaxRows();
  var lColumn = so.getMaxColumns();
  
  so.insertColumnAfter(lColumn);
  var iniRange = sh.getRange(1, iniCol + 1, lRow);
  var finRange = so.getRange(1, lColumn + 1, lRow);
  iniRange.copyTo(finRange, {contentsOnly:true});
  sh.deleteColumn(iniCol + 1);    
  
}