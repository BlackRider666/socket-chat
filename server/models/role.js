const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const RoleSchema = new Schema({
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Role', RoleSchema);