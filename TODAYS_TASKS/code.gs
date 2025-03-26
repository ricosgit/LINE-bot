let scriptProperties = PropertiesService.getScriptProperties()
// Notion
const API_KEY = scriptProperties.getProperty('API_KEY');
const DATABASE_ID = scriptProperties.getProperty('DATABASE_ID');
const NOTION_END_POINT = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
// LINE
const LINE_END_POINT = 'https://api.line.me/v2/bot/message/push';
const LINE_CHANNEL_TOKEN = scriptProperties.getProperty('LINE_CHANNEL_TOKEN');
const LINE_TO = scriptProperties.getProperty('LINE_USER_ID');

function myFunction() {
  notifyTasks();
}

function notifyTasks(tasks) {
  const todoStr = `${getTask()}`;

  const lineoptions = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_CHANNEL_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      "to" : LINE_TO,
      'messages': [{
        'type': 'text',
        'text': todoStr
      }],
    }),
  }
  let lresponse = UrlFetchApp.fetch(LINE_END_POINT, lineoptions);
  // let ljson = lresponse.getContentText();
  // let ldata = JSON.parse(ljson);
}

function getTask() {
  let today = new Date();
  today = Utilities.formatDate( today, 'Asia/Tokyo', 'yyyy-MM-dd');

  payload = { // !! Need to change when the property is changed at Notion
    "filter": {
      "and": [
        {
          "property": "Date for Notion API", // !! created new property due to Notion's bug of not setting timezone
          "date": {
            "equals": today
          }
        },
        {
          "property": "Status",
          "status": {
            "does_not_equal": "Done"
          }
        }
      ]
    },
    "sorts": [
      {
        "property": "Start datetime",
        "direction": "ascending"
      }
    ]
  }
  const options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + API_KEY,
        'Notion-Version': '2022-06-28'
      },
      "payload": JSON.stringify(payload)
  }
  let response = UrlFetchApp.fetch(NOTION_END_POINT, options);
  let json = response.getContentText();
  let data = JSON.parse(json);
  const results = data["results"]
  let todoStr = '\[TODAY\'S TASKS\]'
  if (results.lenght > 0){
    results.forEach((el, i)=>{
      // to deal with an issue task titles are separated occasionally
      let taskTitle = el["properties"]["Name"]["title"][1] === undefined ?
        el["properties"]["Name"]["title"][0]["plain_text"] :
        el["properties"]["Name"]["title"][0]["plain_text"] + el["properties"]["Name"]["title"][1]["plain_text"] ;
      todoStr += `\n\n${i+1}. ${taskTitle}`
    })
  } else {
    todoStr += '\n\nNo task';
  }

  return todoStr;
}
