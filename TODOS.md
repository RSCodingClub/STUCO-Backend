- Add debug and logging __TODO__ [models\User.js](models\User.js)
- Add parameters for handling limit and index (Show limit places above and below index) __TODO__ [models\User.js](models\User.js)
- Cluster this __TODO__ [index.js](index.js)
- Do stuff with server object __TODO__ [index.js](index.js)
- Give badge 22 if score is >= 50, give badge 29 if score is >= 100 and take each if less than required. __TODO__ [models\User.js](models\User.js)
- Handle error, possibly relaunch child process worker __TODO__ [index.js](index.js)
- Move or find an alternative to using private json files to authenticate __TODO__ [web\middleware\eventListener.js](web\middleware\eventListener.js)
- No details __TODO__ [web\router\api\user\v1\score.js](web\router\api\user\v1\score.js)
- No details __TODO__ [web\router\api\user\v1\nickname.js](web\router\api\user\v1\nickname.js)
- No details __TODO__ [web\router\api\user\v1\name.js](web\router\api\user\v1\name.js)
- No details __TODO__ [web\router\api\user\v1\badge.js](web\router\api\user\v1\badge.js)
- Start up all application processes __TODO__ [index.js](index.js)
- I might not work, just do some testing to make sure __FIXME__ [models\User.js](models\User.js)
- In production we will won't want to log the error message directly __NOTE__ [web\router\api\badge\v1\index.js](web\router\api\badge\v1\index.js)
- In production we will won't want to log the error message directly __NOTE__ [web\router\api\user\v1\index.js](web\router\api\user\v1\index.js)
- Logging here will most likely not run if the application is exiting __NOTE__ [web\middleware\eventListener.js](web\middleware\eventListener.js)
- Possibly just set to some default event information __NOTE__ [models\Location.js](models\Location.js)
- Possibly stupid code, potentially revise __NOTE__ [web\middleware\eventListener.js](web\middleware\eventListener.js)
- Possibly use config for custom eventlistener path __NOTE__ [web\server.js](web\server.js)
- Potentially bug prone, possibly won't want to reject __NOTE__ [web\middleware\eventListener.js](web\middleware\eventListener.js)
- We don't want to send detailed database information to the end user __NOTE__ [web\router\api\event\v1\index.js](web\router\api\event\v1\index.js)
- We don't want to send detailed database information to the end user __NOTE__ [web\router\api\event\v1\index.js](web\router\api\event\v1\index.js)
- We originally got events at this point but, watching events will trigger a request in which we request events anyways __NOTE__ [web\middleware\eventListener.js](web\middleware\eventListener.js)
- Fix this so it works (results in a loop of giving badges and testing if has badge already) __BUG__ [models\User.js](models\User.js)
- If event is cancelled delete it from the database, also potentially go through its attendees first and remove score w... __BUG__ [models\Event.js](models\Event.js)