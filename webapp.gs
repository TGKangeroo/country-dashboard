//function called upon by slack when the /add_dashboard command was initiated
function doPost(request) {
  var params =request.parameters
  Logger.log(params);
  
  //starts the adding of a deadline with a delay - needed to avoid the slack timeout error
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('params', JSON.stringify(params));
  ScriptApp.newTrigger("addDeadline")
    .timeBased()
    .after(10)
    .create();
    

  return ContentService.createTextOutput("The Deadline is being added....");
 
  
}

//adds the given deadline to the dashboard
function addDeadline(){
  var sheets = SpreadsheetApp.openById('1JcNjY-57dQGOAoIjOtml4hiTYLRykbbrnDfUQ6bD6Ho');
  var generalSheet = sheets.getSheetByName("General");
  var confSheet = sheets.getSheetByName("contact information");
  var contrlSheet= sheets.getSheetByName("Control Panel")
  var scriptproperties = PropertiesService.getScriptProperties();
  var params = JSON.parse(scriptproperties.getProperty('params'));
var addDeadlinesActive= contrlSheet.getRange('F4').getValue();

if(addDeadlinesActive == true){
  var sections = confSheet.getRange('H2').getValue();
 var column = generalSheet.getRange('A1').getValue() + 2;

var channel = contrlSheet.getRange('E5').getValue();
  //add_dashboard <name> <name> <name> <30/10/2018>

    // PROCESS TEXT FROM MESSAGE
    var textRaw = String(params.text);
    var text = textRaw.split(/\s*>\s*/g);



 
  
    // FALL BACK TO DEFAULT TEXT IF NO UPDATE PROVIDED
    var deadline   = text[0].replace('<','') || "No name Specified";
    var reference = text[1].replace('<','') || "No update provided";
    var contactPerson     = text[2].replace('<','') || "No update provided";
  var date=text[3].replace('<','');
  var splitdate = date.split('/');
    var day = splitdate[0] ;
    var month = splitdate[1] ;
    var year = splitdate[2];
    var formulas = generalSheet.getRange(6, 2).getFormulasR1C1();
    
    // RECORD TIMESTAMP AND USER NAME IN SPREADSHEET
    generalSheet.getRange(2, column).setValue(deadline);
    generalSheet.getRange(3, column).setValue(reference);
    generalSheet.getRange(4, column).setValue(contactPerson);
   generalSheet.getRange(5, column).setValue(year + "-" + month + "-" + day);
    //generalSheet.getRange(5, column).setValue(year);
    generalSheet.getRange(6, column).setFormulasR1C1(formulas);
   
     
  
  for ( var h=0;h< sections;h++){
    
     generalSheet.getRange(h+8, column).setDataValidation(generalSheet.getRange('B8').getDataValidation());
    generalSheet.getRange(h+8, column).setValue("");
    
  }
  postResponse(channel,params.channel_name,deadline,params.user_name,reference,contactPerson,date);
}else{

sendMessage(params.user_name);
}
   
}

//sends a message to a slack user
function sendMessage( userName) {

  var payload = {
    "channel": "@" + userName,
   // "channel" : "@jens",
    "username": "ESN Austria Dasboard",
    "icon_emoji": ":white_check_mark:",
    "link_names": 1,
    "attachments":[
       {
          "fallback": "This is an update from a Slackbot integrated into your organization. Your client chose not to show the attachment.",
          "pretext": "*Adding deadlines through slack was disabled, please contact your dashboard admin*",
          "mrkdwn_in": ["pretext"],
          "color": "#D00000"
         
       }
    ]
  };

  var url = 'https://hooks.slack.com/services/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';
  var options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url,options);
}

//sends a response to a chosen channel when a deadline has been added to the dashboard
function postResponse(channel, srcChannel, deadline, userName, reference, contactPerson, date) {

  var payload = {
    "channel": "#" + channel,
   // "channel" : "@jens",
    "username": "ESN Austria Dasboard",
    "icon_emoji": ":white_check_mark:",
    "link_names": 1,
    "attachments":[
       {
          "fallback": "This is an update from a Slackbot integrated into your organization. Your client chose not to show the attachment.",
          "pretext": "*" + userName + "* added a deadline to the dashboard",
          "mrkdwn_in": ["pretext"],
          "color": "#D00000",
          "fields":[
         {
                "title":"deadline",
                "value": deadline,
                "short":false
             },
             {
                "title":"reference",
                "value": reference,
                "short":false
             },
             {
                "title":"contactPerson",
                "value": contactPerson,
                "short":false
             },
             {
                "title":"date",
                "value": date,
                "short": false
             }
          ]
       }
    ]
  };

  var url = 'https://hooks.slack.com/services/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';
  var options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url,options);
}

