
'use strict';

// simple express server
var application_root = __dirname,
express = require('express'),
bodyParser = require('body-parser'),
path = require( 'path' ), //Utilities for dealing with file paths
mongoose = require( 'mongoose' ); //MongoDB integration

var app = express();
var router = express.Router();

app.use(express.static(application_root));

app.use(bodyParser.json());

//подключение к базе данных
mongoose.connect( 'mongodb://admin:admin@ds047955.mongolab.com:47955/issuetracker-domstrueboy' );
//mongoose.connect( 'mongodb://localhost/issuetracker_database' );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
    console.log('Connection to database success');
});

//схемы
var issueSchema = new mongoose.Schema({
    title: String,
    description: String,
    completed: Boolean,
    project: String
});

//модели
var IssueModel = mongoose.model( 'Issue', issueSchema );

//получение списка всех тикетов
/*app.get( '/', function( request, response ) {
    return IssueModel.find( function( err, issues ) {
        if( !err ) {
            return response.send( issues );
        } else {
            return console.log( err );
        }
    });
});

app.get( '/project_list', function( request, response ) {
    return IssueModel.find( function( err, issues ) {
        if( !err ) {
            return response.send( issues );
        } else {
            return console.log( err );
        }
    });
});*/

app.get( '/issue_list', function( request, response ) {
    return IssueModel.find( function( err, issues ) {
        if( !err ) {
            return response.send( issues );
        } else {
            return console.log( err );
        }
    });
});

//добавление новой задачи
app.post( '/issue_list', function( request, response ) {

    var issue = new IssueModel({
        title: request.body.title || 'noname',
        description: request.body.description || 'none',
        completed: request.body.completed || false,
        project: request.body.project || 'unsorted'
    });

    issue.save( function( err ) {
        if( !err ) {
            return console.log( 'issue created' );
        } else {
            return console.log( err );
        }
    });

    return response.send( issue );
});

//получение одной записи по id
app.get( '/issue_detail/:id', function( request, response ) {
    console.log('Issue "' + request.params.id + '" displayed!');
    return IssueModel.findById(request.params.id, function( err, issue ) {
        if( !err ) {
            return response.send( issue );

        } else {
            return console.log( err );
        }
    });
});

//Обновление задачи
app.put( '/issue_detail/:id', function( request, response ) {
    console.log( 'Updating issue ' + request.params.id );
    return IssueModel.findById(request.params.id, function( err, issue ) {

        issue.title = request.body.title,
        issue.description = request.body.description,
        issue.completed = request.body.completed,
        issue.project = request.body.project

        return issue.save( function( err ) {
            if( !err ) {
                console.log( 'issue updated' );
            } else {
                console.log( err );
            }
            return response.send( issue );
        });
    });
});

//удаление задачи
app.delete( '/issue_detail/:id', function( request, response ) {
    console.log( 'Deleting issue with id: ' + request.params.id );
    return IssueModel.findById(request.params.id, function( err, issue ) {
        return issue.remove( function( err ) {
            if( !err ) {
                console.log( 'Issue removed' );
                return response.send( issue );
            } else {
                console.log( err );
            }
        });
    });
});


var port = 5000;

app.listen(port, function() {
	console.log('Express server listening on port %d', port)
});
