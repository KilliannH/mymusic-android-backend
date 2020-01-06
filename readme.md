///// API part /////

install node
install mongodb
create a db "mymusic-db"

go to root app directory
run "npm install"

set your credentials in config.js file
App host, port
Db host, port
Api key

run the app server with "node app"
populate your db trough the api

///// Elastic part /////

download & install elastic search locally
launch elasticsearch server
create an index (ex. logs)
PUT http://localhost:9200/logs
```json
{
"settings": {
         "number_of_shards": 1,
         "number_of_replicas": 1
   },
   "mappings": {
      
       "properties": {
         "level": {
               "type": "text"
         },
         "content": {
               "type": "text"      
         }
     }
   }
}
```

create a test log
POST http://localhost:9200/logs/_doc/_create
{
"level": "info",
"content": "test"
}


