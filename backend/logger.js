// logger.js
const { dir } = require('console');
const fs = require('fs');
const { hostname } = require('os'); // os.hostname
const path = require('path');

//const pid = process.pid;


/////////////////////////////



function formatNewMsg(msg, level) {
    //return ` ${level}: ${msg}`;
    let new_msg = "";
    new_msg += "[" + (new Date().toISOString()) + "]; ";
    new_msg += "Hostname: " + (hostname()) + "; ";
//    new_msg += "Process ID: " + pid + "; ";
    new_msg += level + " ";
    new_msg += msg;


    return new_msg;

};



class Logger {
    constructor() {
        this.pathway = (path.join(__dirname, 'logs', 'app.log'));
        this.stream = fs.createWriteStream(this.pathway,{ flags: 'a' });
};
   writeToLog(msg){
        this.stream.write(msg);
   }; 
   
    setNewPath(user_path) {
        this.pathway = user_path;
    };
    hybridLogWriting(msg, level) {
        const new_msg = formatNewMsg(msg, level);
        console.log(new_msg);
        this.writeToLog(new_msg);
    };
    log(level, msg) {
        this.hybridLogWriting(msg, level);
    };
    fatal(msg) {
        //A severe error -> terminate/unusable
        this.log("FATAL", msg);
    };
    error(msg){
        //operation failed -> needs attention
        this.log("ERROR", msg);
    };
    warn(msg){
        //Indicates a potential issue or unexpected situation that doesn’t break execution
        this.log("WARN", msg);
    };
    info(msg){
        //Normal operational messages indicating expected system behavior
        this.log("INFO", msg);
    };
    debug(msg) {
        //information useful for debugging during development
        this.log("DEBUG", msg);
    };
    trace(msg){
        //fine-grained diagnostic events (lowest level, rarely enabled in production)
        this.log("TRACE", msg);
    };
}

module.exports = new Logger();
