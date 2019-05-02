'use strict'

const mongoose = require('mongoose');
Schema = mongoose.Schema;

let TodoSchema = new Schema({
    
        id: { type: String, required: true, unique: true },
        userId: { type: String, required: true },
        title: { type: String, required: true },
        description :{type:String,default: '',required : true},
        createdOn: { type: Date, default: Date.now },
        Done: { type: Boolean, default: false },
        delete : {type : Boolean, default : false}
    })


mongoose.model('TodoListModel',TodoSchema);

