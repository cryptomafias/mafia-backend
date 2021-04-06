function writeValidator(writer, event, instance){
    var type = event.patch.type
    var patch = event.patch.json_patch
    if(type === "create" && patch.from === writer){
        return true
    }
    return "permission denied"
}