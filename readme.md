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
go to localhost:9200
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
(_doc is the type supported by elasticsearch)
POST http://localhost:9200/logs/_doc/_create
{
"level": "info",
"content": "test"
}

populate mongodb by using the REST API

///// Kibana part /////
download and install kibana
launch kibana server
go to localhost:5601
use ElasticSearch Index
match the index pattern with your previously defined index (should be listed on the list)
finally go to your dashboard and you will see the logs
