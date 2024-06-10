const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : {
        type: String,
        trim: true,
        required: true
    },
    email : {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    mobile : {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password : {
        type: String,
        trim: true,
        required: true
    },
    role : {
        type : String,
        trim: true,
        required: true,
        default: 'user',
        enum: ['admin', 'manager', 'merchant','sub-merchant','user']
    },
    isVerified : {
        type: Boolean,
        default: false,
        required: true
    },
    createAt : {
        type: Date,
        required: true,
        default: Date.now()
    },
    updateAt : {
        type: Date,
        required: true,
        default: Date.now()
    }
})

userSchema.pre('save', async function (next) {
    try {
        if(this.isModified('password')){
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function (password) {
    try {
        const result = await bcrypt.compare(password, this.password);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = mongoose.model('User', userSchema);