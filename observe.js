(function(){
Observe = function(obj, arg1, arg2, arg3) {
	var type = typeof arg1
	if(type=="function") {
		next = arg1
		doInitialExecute = observeWithoutInitialExecute(obj, null, arg1, arg2)
	} else {
		next = arg2
		doInitialExecute = observeWithoutInitialExecute(obj, arg1, arg2, arg3)
	}
	if(doInitialExecute) next()
}
var observeWithoutInitialExecute = function(obj, arg, next, doInitialExecute) {
	if(!arg) {
		Object.observe(obj, next)
		doInitialExecute &= true
	} else {
		var type = typeof arg
		if(type=="object" && arg.length!==undefined) {
			var doInitialExecuteUnion = false
			for(var i=0, len=arg.length; i<len; ++i)
				doInitialExecuteUnion |= observeWithoutInitialExecute(obj, arg[i], next, doInitialExecute)
			doInitialExecute &= doInitialExecuteUnion
		} else {
			var check = null, initialCheck = null
			if(type=="string") { check = checkString; initialCheck = initialCheckString }
			else if(type=="object") { check = checkObject; initialCheck = initialCheckObject }
			if(check) {
				doInitialExecute &= initialCheck(arg, obj)
				conditonalObserve(check, obj, arg, next)
			}
		}
	}
	return doInitialExecute
}
var checkString = function(change, arg) {
	return change.name===arg;
}
var initialCheckString = function(arg, obj) {
	return (arg in obj)
}
var checkObject = function(change, arg) {
	var name=change.name;
	if(!(name in arg))
		return false;
	var obj = change.object
	for(var a in arg)
		if(arg[a]!==obj[a])
			return false;
	return true;
}
var initialCheckObject = function(arg, obj) {
	for(var o in arg)
		if(arg[o]!==obj[o])
			return false
	return true
}
var conditonalObserve = function(check, obj, val, next) {
	Object.observe(obj, function(changes) {
		for(var c=0, len=changes.length; c<len; ++c) {
			if(check(changes[c], val)) {
				next();
				break;
			}
		}
	})
}
})()
