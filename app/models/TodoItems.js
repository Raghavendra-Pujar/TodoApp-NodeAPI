const mongoose = require('mongoose');
Schema = mongoose.Schema;

const TodoItems = new Schema({
    
    userId :{
        type: String, 
        required: true
    },
    todoId :{
        type : String,
        default : ''
    },
    listId : {
        type: String,
        default : ''
    },
    parentTodoId : {
        type : String,
        default : ''
    },
    title : {
        type : String,
        default : ''
    },
    Done : {
        type : Boolean,
        default : false
    },
    delete : {
        type : Boolean,
        default : false
    },
    lastModifiedOn : {
        type: Date,
        default : Date.now()
    },
    changeMessage :{
        type : String
    }
});

mongoose.model('TodoItemsModel',TodoItems);