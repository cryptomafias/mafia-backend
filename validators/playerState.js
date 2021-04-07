function writeValidator(writer, event, instance){
    var type = event.patch.type
    var patch = event.patch.json_patch
    var owner = "bbaareigca777c5zjrjrkouccm7sfv34tfaadsuxeiwmtr52qlwilmlnym4"
    switch (type) {
        case "create":
            if (writer !== owner) {
                return "permission denied" // writer must match new instance
            }
            break
        case "save":
            if (writer !== owner) {
                return "permission denied"
            }
            break
        case "delete":
            if (writer !== owner) {
                return "permission denied" // no owner access to delete instance
            }
            break
    }
    return true
}

module.exports = {writeValidator}