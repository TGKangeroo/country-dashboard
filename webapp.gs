//function called upon by slack when the /add_dashboard command was initiated
function doPost(request) {

  var params =request.parameters
  Logger.log(params);
  
    
  if(request.parameters['command'] =="/add_president_deadline"){
    
    if(request.parameters['text']!=null && request.parameters['text'] !=""){
      //starts the adding of a deadline with a delay - needed to avoid the slack timeout error
      var params =request.parameters;
      var scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('params', JSON.stringify(params));
      ScriptApp.newTrigger("addDeadline")
      .timeBased()
      .after(2)
      .create();
    }else{
      sendCreateDeadline(request.parameters['trigger_id'],request.parameters['channel_id']);
    }
  }
  
   if(JSON.stringify(request).indexOf("deadline_add") != -1){
    
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('params', JSON.stringify(request.parameters.payload) );
     scriptProperties.setProperty('request', request);
    ScriptApp.newTrigger("addDeadline")
    .timeBased()
    .after(2)
    .create();
    return ContentService.createTextOutput("");
  }
  return ContentService.createTextOutput("The Deadline is being added....");
 
  
}


function doGet(request){
  Logger.log("hello");
  return ContentService.createTextOutput("I am alive");
}

//adds the given deadline to the dashboard
function addDeadline(){
  var sheets = SpreadsheetApp.openById('1dhFsTk_IYydKs6oTmUpvtoeBaqHaz-B2iVNAa_cI19E');
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
  if(params.text!=null ){
    var textRaw = String(params.text);
    var text = textRaw.split(/\s*>\s*/g);
    
    // FALL BACK TO DEFAULT TEXT IF NO UPDATE PROVIDED
    var deadline   = text[0].replace('<','') || "No name Specified";
    var reference = text[1].replace('<','') || "No update provided";
    var contactPerson     = text[2].replace('<','') || "No update provided";
    var date=text[3].replace('<','');
    var dashboard=text[4].replace('<','');
    // do something with dashboard
  }else{
  
  
  if(JSON.parse(params).submission!=null){
    params= JSON.parse(params)
    Logger.log(params);
    var deadline   = params.submission.dl_name || "No name Specified";
    var reference = params.submission.dl_ref || "No update provided";
    var contactPerson     = params.submission.dl_res || "No update provided";
    contactPerson = getSlackuser(contactPerson);
    contactPerson = contactPerson.profile.display_name;
    Logger.log("This one" + contactPerson);
    var date= params.submission.dl_date ; 
    var dashboard = params.submission.NB;
    Logger.log(dashboard)
  }
  }

  
  var splitdate = date.split('/');
  var day = splitdate[0] ;
  var month = splitdate[1] ;
  var year = splitdate[2];
  
  
  if (dashboard == "Yes"){
  sendToNB();
  }
  
      var formulas = generalSheet.getRange(6, 2).getFormulasR1C1();
  
    generalSheet.insertColumnAfter(column -1);
  // RECORD TIMESTAMP AND USER NAME IN SPREADSHEET
      var design = generalSheet.getRange('B1');
  design.copyTo(generalSheet.getRange(1,column), {formatOnly: true});
  
    var design = generalSheet.getRange('B2');
  design.copyTo(generalSheet.getRange(2,column), {formatOnly: true});

  var design = generalSheet.getRange('B3');
  design.copyTo(generalSheet.getRange(3,column), {formatOnly: true});
  
  var design = generalSheet.getRange('B4');
  design.copyTo(generalSheet.getRange(4,column), {formatOnly: true});

  var design = generalSheet.getRange('B5');
  design.copyTo(generalSheet.getRange(5,column), {formatOnly: true});

  var design = generalSheet.getRange('B6');
  design.copyTo(generalSheet.getRange(6,column), {formatOnly: true});
  

  generalSheet.getRange(2, column).setValue(deadline);
  generalSheet.getRange(3, column).setValue(reference);
  generalSheet.getRange(4, column).setValue(contactPerson);
  generalSheet.getRange(5, column).setValue(year + "-" + month + "-" + day);
  generalSheet.getRange(6, column).setFormulasR1C1(formulas);
  
     
  
  for ( var h=0;h< sections;h++){
    
     generalSheet.getRange(h+8, column).setDataValidation(generalSheet.getRange('B8').getDataValidation());
    generalSheet.getRange(h+8, column).setValue("");
    
  }
   var usr = params.user_name || params.user.name;
  postResponse(channel,params.channel_name,deadline,usr,reference,contactPerson,date);
}else{

sendMessage(params.user_name);
}

removeAddDeadline();
   
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
    "pretext": "*" + userName + "* added a deadline to the dashboard, check it here: https://servus.esnaustria.org/dashboard",
          "mrkdwn_in": ["pretext"],
          "color": "#D00000",
          "fields":[
         {
                "title":"deadline",
                "value": deadline,
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

function sendCreateDeadline(trigger_id,channel){
  
  var payload = {token:SLACKBOT_TOKEN, Authorization: SLACKBOT_TOKEN, channel:channel,icon_emoji: ":robot_face:",username: "Yennefer",  dialog : JSON.stringify({
    "callback_id": "deadline_add",
    "title": "Create a deadline",
    "submit_label": "Create",
    "elements": [
      {
        "type": "text",
        "label": "Deadline Name",
        "name": "dl_name"
      },
      {
        "type": "text",
        "label": "Reference",
        "name": "dl_ref",
        "optional":true
      },
      {
        "type": "select",
        "label": "Responsible Person",
        "name": "dl_res",
        "data_source": "users"
      },{
        "type": "text",
        "label": "Deadline Date (DD/MM/YYYY)",
        "name": "dl_date"
      }
      ,{
        "label": "Add to NB Dashboard?",
        "type": "select",
        "name": "NB",
        "value": "No",
        "options": [
    {
      "label": "Yes",
      "value": "Yes"
    },
    {
      "label": "No",
      "value": "No"
    }]
      }
    ]
  }),trigger_id:trigger_id.toString()};
  
  UrlFetchApp.fetch('https://slack.com/api/dialog.open', {method: 'post', payload:payload});
  
}

function getSlackuser(user){
 var payload = {token:SLACKBOT_TOKEN, Authorization: SLACKBOT_TOKEN, user: user,username: "Yennefer"};
 var user =  UrlFetchApp.fetch('https://slack.com/api/users.info', {method: 'get', payload:payload});
 user = JSON.parse(user);
 Logger.log(user.user);
 
 return user.user;
}

function sendToNB(){
var scriptProperties = PropertiesService.getScriptProperties();
 var params = scriptProperties.getProperty('params');
 dashboard.addPresidentDeadline(params);

}

function removeAddDeadline (){
var triggers = ScriptApp.getProjectTriggers();
for ( var i in triggers ) {
  if( triggers[i].getHandlerFunction() == "addDeadline" || triggers[i].getHandlerFunction() == "logger"){
  ScriptApp.deleteTrigger(triggers[i]);
  }
  
}
  
}